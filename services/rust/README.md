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

Set these env vars in the Next.js app to enable integration:

- `RUST_HOTPATH_SERVICE_URL=http://localhost:8088`
- `USE_RUST_FEED_RANKER=true`
- `USE_RUST_NOTIFICATION_FANOUT=true`
- `USE_RUST_SEARCH_INDEXER=true`
- `USE_RUST_MEDIA_PIPELINE=true`
- `USE_RUST_RATE_LIMITER=true`
