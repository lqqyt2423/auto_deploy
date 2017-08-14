'use strict';

const express = require('express');
const exec = require('child_process').exec;
const path = require('path');
const config = require('../config');
const DeployRecord = require('../models/DeployRecord');

const api = express.Router();
const projects = config.projects;


// receive web hook
api.post('/', (req, res, next) => {
  // push event hook
  if (req.headers['x-gitlab-event'] === 'Push Hook') {
    res.end('ok');
    for (let i in projects) {
      // validate token
      if (req.headers['x-gitlab-token'] === projects[i].token) {
        // validate project name and branch master
        if (req.body.project.name === projects[i].name && req.body.ref === projects[i].ref) {
          handler(projects[i], (err, stdout) => {
            let deployRecord = new DeployRecord({
              hook: JSON.stringify(req.body),
              project: JSON.stringify(projects[i]),
              stdout: stdout,
              error: err,
              createAt: new Date()
            });
            deployRecord.save();
          });
        }
      }
    }
  } else {
    next();
  }
});

// return records
api.get('/list', (req, res) => {
  DeployRecord.log().then((docs) => res.json(docs));
});

module.exports = api;


// callback(err, stdout) string
function handler(project, callback) {
  let cbError = [];
  let cbStdout = [];
  const beforeCallback = (err, stdout) => {
    callback(JSON.stringify(err), JSON.stringify(stdout));
  };
  let fullPath = project.path;
  // git pull
  exec(`cd ${fullPath} && git pull`, { maxBuffer: 1024*1024*64 }, (e, stdout) => {
    if (e) {
      cbError.push([`cd ${fullPath} && git pull`, e.message]);
      return beforeCallback(cbError, cbStdout);
    }
    cbStdout.push([`cd ${fullPath} && git pull`, stdout]);
    // 无文件更新
    let diffFiles = stdout.split('\n').filter(line => line.indexOf('|') > -1);
    if (diffFiles.length === 0) return beforeCallback(cbError, cbStdout);
    let count = 0;
    let len = project.sub.length;
    // 循环所有配置中的项目
    for (let i in project.sub) {
      let subObj = project.sub[i];
      let subPath = subObj.path;
      // 根目录
      if (subPath === '' || subPath === '/') {
        // 有更新
        if (diffFiles.some(file => file.indexOf('/') === -1)) {
          // package.json is changed
          let isPackageChange = diffFiles.some(file => {
            return file.indexOf('/') === -1 && file.indexOf('package.json') > -1;
          })
          if (isPackageChange) {
            exec(`cd ${fullPath} && npm install && ${subObj.command}`, { maxBuffer: 1024*1024*64 }, (e, stdout) => {
              if (e) {
                cbError.push([`cd ${fullPath} && npm install && ${subObj.command}`, e.message]);
              } else {
                cbStdout.push([`cd ${fullPath} && npm install && ${subObj.command}`, stdout]);
              }
              // console.log('根目录 有更新 有package更新');
              if (++count === len) beforeCallback(cbError, cbStdout);
            });
          } else {
            exec(`cd ${fullPath} && ${subObj.command}`, { maxBuffer: 1024*1024*64 }, (e, stdout) => {
              if (e) {
                cbError.push([`cd ${fullPath} && ${subObj.command}`, e.message]);
              } else {
                cbStdout.push([`cd ${fullPath} && ${subObj.command}`, stdout]);
              }
              // console.log('根目录 有更新 无package更新');
              if (++count === len) beforeCallback(cbError, cbStdout);
            });
          }
        } else {
          // console.log('根目录 无更新');
          if (++count === len) beforeCallback(cbError, cbStdout);
        }
      } else { // 子目录
        // if change
        if (diffFiles.some(file => file.indexOf(subPath) > -1)) {
          let subPackagePath = path.join(subPath, 'package.json');
          let subFullPath = path.join(fullPath, subPath);
          // if package.json change => npm install
          if (diffFiles.some(file => file.indexOf(subPackagePath) > -1)) {
            exec(`cd ${subFullPath} && npm install && ${subObj.command}`, { maxBuffer: 1024*1024*64 }, (e, stdout) => {
              if (e) {
                cbError.push([`cd ${subFullPath} && npm install && ${subObj.command}`, e.message]);
              } else {
                cbStdout.push([`cd ${subFullPath} && npm install && ${subObj.command}`, stdout]);
              }
              // console.log('子目录 有更新 有package更新');
              if (++count === len) beforeCallback(cbError, cbStdout);
            });
          } else {
            exec(`cd ${subFullPath} && ${subObj.command}`, { maxBuffer: 1024*1024*64 }, (e, stdout) => {
              if (e) {
                cbError.push([`cd ${subFullPath} && ${subObj.command}`, e.message])
              } else {
                cbStdout.push([`cd ${subFullPath} && ${subObj.command}`, stdout]);
              }
              // console.log('子目录 有更新 无package更新');
              if (++count === len) beforeCallback(cbError, cbStdout);
            });
          }
        } else {
          // console.log('子目录 无更新');
          if (++count === len) beforeCallback(cbError, cbStdout);
        }
      }
    }
  });
}
