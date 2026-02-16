# DevLink Rust Hotpath Services

This directory contains the initial Rust extraction for heavy backend paths.

## Services

- `hotpath-service`: unified service with endpoints for:
  - feed ranking (`/rank-feed`)
  - notification fan-out (`/fanout-notification`)
  - search indexing trigger (`/index-search`)
  - media pipeline trigger (`/process-media`)
  - edge rate-limit check (`/rate-limit`)

## Local run

```bash
cd services/rust/hotpath-service
cargo run
```

The service listens on `0.0.0.0:8088`.

Set these env vars in the Next.js app:

- `RUST_HOTPATH_SERVICE_URL=http://localhost:8088`
- `NEXT_PUBLIC_RUST_REALTIME_URL=ws://localhost:8090/ws`
