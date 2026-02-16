use axum::{extract::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[derive(Debug, Deserialize)]
struct RankFeedRequest {
    post_ids: Vec<String>,
}

#[derive(Debug, Serialize)]
struct RankFeedResponse {
    ordered_post_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct FanoutRequest {
    notification_id: Option<String>,
    recipient_id: String,
    actor_id: String,
    kind: String,
}

#[derive(Debug, Deserialize)]
struct SearchIndexRequest {
    entity: String,
    entity_id: String,
}

#[derive(Debug, Deserialize)]
struct MediaProcessRequest {
    media_id: String,
    media_type: String,
    url: String,
}

#[derive(Debug, Deserialize)]
struct RateLimitRequest {
    key: String,
    limit: u32,
    window_seconds: u32,
}

#[derive(Debug, Serialize)]
struct RateLimitResponse {
    success: bool,
    limit: u32,
    remaining: u32,
}

#[derive(Debug, Serialize)]
struct AckResponse {
    accepted: bool,
}

async fn health() -> &'static str {
    "ok"
}

async fn rank_feed(Json(request): Json<RankFeedRequest>) -> Json<RankFeedResponse> {
    // Placeholder ranking: newest-first ordering should happen upstream for now.
    Json(RankFeedResponse {
        ordered_post_ids: request.post_ids,
    })
}

async fn fanout_notification(Json(_request): Json<FanoutRequest>) -> Json<AckResponse> {
    // Placeholder fan-out hook.
    Json(AckResponse { accepted: true })
}

async fn index_search(Json(_request): Json<SearchIndexRequest>) -> Json<AckResponse> {
    Json(AckResponse { accepted: true })
}

async fn process_media(Json(_request): Json<MediaProcessRequest>) -> Json<AckResponse> {
    Json(AckResponse { accepted: true })
}

async fn rate_limit(Json(request): Json<RateLimitRequest>) -> Json<RateLimitResponse> {
    let _ = request.key;
    let _ = request.window_seconds;
    Json(RateLimitResponse {
        success: true,
        limit: request.limit,
        remaining: request.limit.saturating_sub(1),
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .compact()
        .init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/rank-feed", post(rank_feed))
        .route("/fanout-notification", post(fanout_notification))
        .route("/index-search", post(index_search))
        .route("/process-media", post(process_media))
        .route("/rate-limit", post(rate_limit));

    let addr: SocketAddr = "0.0.0.0:8088".parse().expect("valid socket address");
    tracing::info!("hotpath service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind listener");
    axum::serve(listener, app).await.expect("serve");
}
