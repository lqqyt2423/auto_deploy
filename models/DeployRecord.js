'use strict';

require('./connect');
const mongoose = require('mongoose');

const DeployRecord = new mongoose.Schema({
  hook: { type: String },
  project: { type: String },
  stdout: { type: String },
  error: { type: String },
  createAt: Date
});

DeployRecord.statics.log = function() {
  return this.find({}).sort('-createAt').limit(20).then(docs => {
    return docs.map(doc => {
      // 检查数据库中旧的格式
      let error = doc.error;
      let stdout = doc.stdout;
      let hook = JSON.parse(doc.hook);
      let project = JSON.parse(doc.project);
      try {
        error = JSON.parse(error);
      } catch(e) {
        error = [];
      }
      try {
        stdout = JSON.parse(stdout);
      } catch(e) {
        stdout = [];
      }
      return {
        id: doc._id,
        createAt: doc.createAt,
        error: error,
        changeFileLists: toFileLists(stdout),
        successCommand: toCommandLists(stdout, project),
        project: {
          name: hook.project.name,
          branch: hook.ref.split('/').slice(-1).join(''),
          beforeCommitId: hook.before.slice(0, 8),
          nowCommitId: hook.after.slice(0, 8),
          commitMessage: hook.commits[0].message,
          commitAuthor: hook.commits[0].author.name
        }
      };
    });
  }).catch(e => console.log(e));
};

function toFileLists(stdout) {
  if (stdout.length === 0) return;
  if (stdout[0][0].indexOf('git pull') > -1) {
    return stdout[0][1].split('\n').filter(file => file.indexOf('|') > -1);
  }
}

function toCommandLists(stdout, project) {
  if (stdout.length < 2 ) return;
  return stdout.slice(1).map(item => {
    return item[0].replace(project.path, '.');
  });
}

module.exports = mongoose.model('DeployRecord', DeployRecord);
