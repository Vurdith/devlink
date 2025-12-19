# 🛡️ THE ELITE AI QUALITY AUDIT FRAMEWORK (V2.0)

> **"Code is a liability; logic is the asset."**
> This framework is designed for high-reasoning AI models to ensure production-grade, zero-slop, and hyper-performant software.

---

## 🛠️ THE 21 PHASES OF ELITE QUALITY

---

### 1. ⚡ PERFORMANCE 2.0 (CWV Focus)
- [ ] **LCP (Largest Contentful Paint)**: < 1.2s. Optimized images (WebP), preloads.
- [ ] **INP (Interaction to Next Paint)**: < 200ms. Offload heavy JS, use `useTransition`.
- [ ] **CLS (Cumulative Layout Shift)**: 0. Fixed dimensions, no jumping content.
- [ ] **Bundle Hygiene**: No duplicate libs, tree-shaking active, lazy load below-fold.

### 2. 💎 UX & "ZERO-SLOP" DESIGN
- [ ] **No AI-Slop**: Remove generic placeholders, redundant buttons, and "Coming Soon" text.
- [ ] **Cohesive Styling**: Consistent `glass-soft` usage, no `backdrop-filter` (performance-first).
- [ ] **Visual Hierarchy**: Variable font weights, `leading-relaxed` bios, `tracking-tight` headers.

### 3. 🔐 SECURITY HARDENING
- [ ] **Authentication**: Strict NextAuth JWT optimization, secrets rotated, secure cookies.
- [ ] **Authorization (RLS)**: Server-side permission checks on EVERY mutation.
- [ ] **Input Security**: Zod/Valibot schemas for every API endpoint; XSS/CSRF headers.

### 4. 🧠 SEMANTIC CODE INTEGRITY
- [ ] **Intent Matching**: Does the code solve the actual user problem or just the prompt?
- [ ] **DRY & Clean**: Proactively delete dead code, unused functions, and redundant abstractions.

### 5. 🧱 ARCHITECTURE & TYPE SAFETY
- [ ] **Strict TS**: No `any`, proper null handling, branded types for IDs (e.g., `UserId`).
- [ ] **Project Consistency**: Match existing file structures and naming conventions.

### 6. 📱 RESPONSIVE & ADAPTIVE
- [ ] **Touch Targets**: Min 44x44px for mobile; hover states for desktop.
- [ ] **Safe Areas**: Proper padding for notches and mobile navigation bars.

### 7. 🔍 SEO & DISCOVERABILITY
- [ ] **Metadata**: Unique titles/descriptions, JSON-LD structured data.
- [ ] **Social Sharing**: Open Graph and Twitter/X cards verified with images.

### 8. 🛡️ RESILIENCE & ERROR HANDLING
- [ ] **Graceful Degradation**: Functional Error Boundaries; user-friendly recovery UIs.
- [ ] **API Resilience**: Timeouts, retries with backoff, and circuit breakers.

### 9. 📊 DATA INTEGRITY
- [ ] **Transaction Safety**: Atomic operations for critical data changes.
- [ ] **Migration Health**: Version-controlled schemas, zero-downtime capable.

### 10. ⚙️ OPERATIONS (OPS)
- [ ] **Environment Parity**: Dev/Prod config alignment; secret management via Vault/Env.
- [ ] **Logs**: No sensitive data in logs; structured logging for easy debugging.

### 11. 🌍 INTERNATIONALIZATION (I18N)
- [ ] **String Externalization**: No hardcoded text; support for RTL/LTR layouts.

### 12. ⚖️ LEGAL & COMPLIANCE
- [ ] **Privacy**: GDPR/CCPA compliance; clear Terms of Service and Privacy Policy.

### 13. 📈 ANALYTICS & TRACKING
- [ ] **Event Accuracy**: Tracking key actions (conversions, errors) without breaking UX.

### 14. 🧪 TEST COVERAGE
- [ ] **Critical Paths**: Unit/E2E coverage for auth, payments, and core features.

### 15. 🔌 API DESIGN
- [ ] **Consistency**: REST/GraphQL follows strict versioning and naming conventions.

### 16. 🔄 REAL-TIME FEATURES
- [ ] **Sync**: WebSocket/Presence handling with graceful reconnection.

### 17. 🖼️ MEDIA HANDLING
- [ ] **Optimization**: Auto-resizing, CDN delivery, and lazy-loading for all user uploads.

### 18. 🚀 SCALE & INFRASTRUCTURE
- [ ] **Database**: Connection pooling (Supabase), indexing, and read replicas.

### 19. 🤝 SOCIAL FEATURES
- [ ] **Engagement**: Follows, Likes, and Shares reflected instantly via Optimistic UI.

### 20. 🛠️ DEVELOPER EXPERIENCE (DX)
- [ ] **Setup**: README clarity, seed data, and fast local feedback loops.

### 21. ⚡ RUNTIME TESTING & STATE SYNC (CRITICAL)
- [ ] **The Mutation Test**: Change data (e.g., bio) -> verify sync on Header, Profile, and Settings.
- [ ] **The Multi-Tab Test**: Changes in Tab A reflect in Tab B via BroadcastChannel/EventBus.
- [ ] **The Offline Test**: Verify graceful degradation in Airplane Mode.

---

## 🚀 HOW TO USE
Run `/qa full` to trigger this framework. As an expert AI, I will:
1.  **Trace every symbol** back to its definition.
2.  **Verify runtime state** across all affected components.
3.  **Refactor and delete** any "slop" or dead code I encounter.
