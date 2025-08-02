# PM2 Setup Instructions

## Installation

First, install PM2 globally:
```bash
npm install -g pm2
```

## Available Commands

After installation, you can use these npm scripts to manage your application:

### Start the application:
```bash
npm run pm2:start
```

### Check application status:
```bash
npm run pm2:status
```

### View real-time logs:
```bash
npm run pm2:logs
```

### Stop the application:
```bash
npm run pm2:stop
```

### Restart the application:
```bash
npm run pm2:restart
```

### Reload the application (zero-downtime restart):
```bash
npm run pm2:reload
```

### Monitor CPU and Memory usage:
```bash
npm run pm2:monitor
```

### Delete the application from PM2:
```bash
npm run pm2:delete
```

## Configuration

The PM2 configuration is defined in `ecosystem.config.js`. Key features:

- **Auto-restart**: Application automatically restarts if it crashes
- **Memory limit**: Restarts if memory usage exceeds 1GB
- **Logging**: All logs are saved in the `logs/` directory
- **Environment variables**: Separate configs for development and production

## Production Setup

For production with multiple instances (cluster mode), modify `ecosystem.config.js`:

```javascript
instances: 'max', // Use all CPU cores
exec_mode: 'cluster'
```

## Auto-start on Server Reboot

To make PM2 start automatically when your server reboots:

```bash
# Generate startup script
pm2 startup

# Start your application
npm run pm2:start

# Save current PM2 processes
pm2 save
```

## Useful PM2 Commands

```bash
# List all applications
pm2 list

# Show detailed info about an app
pm2 show invoice-generator

# Reset restart counter
pm2 reset invoice-generator

# View logs with specific number of lines
pm2 logs invoice-generator --lines 100

# Follow logs in real-time
pm2 logs invoice-generator --follow
```

## Troubleshooting

If you encounter issues:

1. Check PM2 status: `npm run pm2:status`
2. View logs: `npm run pm2:logs`
3. Restart the app: `npm run pm2:restart`
4. Check if the port 4000 is available
5. Ensure all dependencies are installed: `npm install`
