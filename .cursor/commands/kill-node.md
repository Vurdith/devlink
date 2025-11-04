# Kill Node & Cloudflare

Kills all Node.js and Cloudflare processes running on the system.

## Usage

Run this command to stop all development processes including:
- Node.js development server
- Cloudflare tunnel processes
- Any other Node.js processes

## Command

```bash
taskkill /f /im node.exe & taskkill /f /im cloudflared.exe
```

## What it does

- Forcefully terminates all `node.exe` processes
- Forcefully terminates all `cloudflared.exe` processes
- Clears the development environment for a fresh start



