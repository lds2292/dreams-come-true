module.exports = {
  apps: [
    {
      name: 'dreamcomtrue-api',
      script: 'src/index.js',
      cwd: '/home/ec2-user/app/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
    },
  ],
};
