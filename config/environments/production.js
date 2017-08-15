module.exports = {
  port: 8000,
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
      name: 'my_node_server',
      ref: 'refs/heads/master',
      path: '/root/code/my_node_server',
      sub: [
        { path: '', command: 'NODE_ENV=production pm2 reload app'}
      ]
    }
  ]
};
