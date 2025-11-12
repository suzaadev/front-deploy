module.exports = {
  apps: [{
    name: 'suzaa-frontend',
    script: 'node_modules/.bin/next',
    args: 'start -p 3065',
    cwd: '/home/suzaa/suzaa-deployment/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
