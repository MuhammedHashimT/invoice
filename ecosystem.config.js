module.exports = {
  apps: [{
    name: 'invoice-generator',
    script: './main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Restart delay to prevent rapid restarts
    restart_delay: 4000,
    // Maximum number of restart attempts
    max_restarts: 10,
    // Minimum uptime before restart is considered successful
    min_uptime: '10s'
  }]
};
