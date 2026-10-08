module.exports = {
  apps: [{
    name: 'docvia-api',
    script: './index.js',
    cwd: __dirname,
    instances: 'max',
    exec_mode: 'cluster',
    env_production: { NODE_ENV: 'production', PORT: 5000 },
    max_memory_restart: '500M',
    listen_timeout: 10000,
    kill_timeout: 12000,
  }],
};
