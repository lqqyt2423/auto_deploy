module.exports = {
  port: 2990,
  database: {
    mongodb: {
      db: 'mongodb://127.0.0.1:27017/auto_deploy',
      dbName: 'auto_deploy',
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
        { path: '', command: ''}
      ]
    }
  ]
};
