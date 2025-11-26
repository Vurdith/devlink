# Kill Node.js Only

Kills only Node.js processes, leaving Cloudflare tunnel running.

## Usage

Use this when you want to restart just the development server while keeping the tunnel active.

## Command

```bash
taskkill /f /im node.exe
```

## What it does

- Forcefully terminates all `node.exe` processes
- Leaves Cloudflare tunnel running
- Allows you to restart just the dev server


















