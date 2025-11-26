# Kill Cloudflare Only

Kills only Cloudflare tunnel processes, leaving Node.js development server running.

## Usage

Use this when you want to restart just the tunnel while keeping the dev server active.

## Command

```bash
taskkill /f /im cloudflared.exe
```

## What it does

- Forcefully terminates all `cloudflared.exe` processes
- Leaves Node.js development server running
- Allows you to restart just the tunnel


















