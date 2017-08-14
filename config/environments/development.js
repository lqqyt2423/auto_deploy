module.exports = {
  port: 3333,
  database: {
    mongodb: {
      db: 'mongodb://127.0.0.1:27017/auto_deploy_dev',
      dbName: 'auto_deploy_dev',
      options: {}
    }
  },
  // 新增 auto-deploy 在此数组添加配置即可
  projects: [
    {
      token: '',
      name: '',
      ref: 'refs/heads/master',
      path: '',
      sub: [
        { path: '', command: 'pm2 reload myapp'}
      ]
    },
    {
      token: '',
      name: 'test',
      ref: 'refs/heads/master',
      path: '',
      sub: [
        { path: '', command: 'npm start' }
      ]
    }
  ]
};
