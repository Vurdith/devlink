# Universal Quality Audit Framework

A truly universal, framework-agnostic quality audit. Works for ANY tech stack, ANY language, ANY platform. 20 phases, 400+ checks adapted to whatever you're building.

## Adapts To Your Stack

| Stack Type | Examples |
|------------|----------|
| **Frontend Frameworks** | React, Vue, Angular, Svelte, Solid, Qwik, Astro, vanilla JS |
| **Backend Frameworks** | Next.js, Express, Django, Rails, Laravel, FastAPI, Spring, .NET |
| **Languages** | TypeScript, JavaScript, Python, Go, Rust, PHP, Ruby, Java, C# |
| **Databases** | PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Firebase |
| **Platforms** | Web, Mobile (React Native, Flutter), Desktop (Electron, Tauri) |
| **Architectures** | Monolith, Microservices, Serverless, JAMstack, Edge |

---

## Usage

Run `/qa full` for complete audit, or `/qa [phase]` for specific areas.

## Commands

| Command | Phase |
|---------|-------|
| `/qa full` | Complete 20-phase audit |
| `/qa perf` | Performance |
| `/qa ux` | User Experience |
| `/qa security` | Security Hardening |
| `/qa a11y` | Accessibility |
| `/qa arch` | Architecture |
| `/qa dx` | Developer Experience |
| `/qa seo` | SEO & Discoverability |
| `/qa resilience` | Error Handling |
| `/qa data` | Data Integrity |
| `/qa ops` | Operations |
| `/qa i18n` | Internationalization |
| `/qa legal` | Legal & Compliance |
| `/qa analytics` | Analytics & Tracking |
| `/qa testing` | Test Coverage |
| `/qa api` | API Design |
| `/qa realtime` | Real-time Features |
| `/qa media` | Media Handling |
| `/qa scale` | Scale & Infrastructure |
| `/qa social` | Social Features |

---

# THE 20 PHASES

*Each phase lists universal concepts. Apply using your stack's equivalent tools/patterns.*

---

## 1. PERF - Performance Excellence

### Bundle & Assets (Web/Mobile)
- [ ] Minimize initial payload size
- [ ] Code splitting / lazy loading
- [ ] Tree shaking / dead code elimination
- [ ] Asset minification (JS, CSS, HTML)
- [ ] Compression (gzip, brotli, zstd)
- [ ] No duplicate dependencies

### Images & Media
- [ ] Modern formats (WebP, AVIF, HEIC where supported)
- [ ] Responsive sizing
- [ ] Lazy loading below fold
- [ ] Eager loading for critical content
- [ ] CDN delivery
- [ ] Placeholder/skeleton during load

### Fonts (if applicable)
- [ ] Subset to used characters
- [ ] Preload critical fonts
- [ ] Font display strategy (swap/optional)
- [ ] Fallback fonts defined

### Core Metrics (adapt to platform)
- [ ] First meaningful paint / initial render < 2s
- [ ] Time to interactive < 3s
- [ ] Input responsiveness < 100ms
- [ ] No layout shifts after load
- [ ] Smooth animations (60fps)

### Runtime Performance
- [ ] Efficient rendering (virtual lists, pagination)
- [ ] Memoization where beneficial
- [ ] No memory leaks
- [ ] Debounced expensive operations
- [ ] Background processing for heavy tasks
- [ ] Proper garbage collection

### Network
- [ ] HTTP/2 or HTTP/3 where available
- [ ] Connection reuse
- [ ] Request batching where appropriate
- [ ] Prefetching critical resources
- [ ] Offline capability (if applicable)

### Caching (use your stack's tools)
- [ ] CDN caching for static assets
- [ ] Browser/client caching
- [ ] Application-level caching (Redis, Memcached, in-memory)
- [ ] Database query caching
- [ ] Cache invalidation strategy

### Database/Data Layer
- [ ] Query optimization
- [ ] N+1 query prevention
- [ ] Proper indexing
- [ ] Connection pooling
- [ ] Query timeout limits

---

## 2. UX - User Experience

### Loading States
- [ ] Skeleton screens or spinners
- [ ] Progress indicators for long operations
- [ ] Optimistic updates for instant feedback
- [ ] Loading priority (critical content first)
- [ ] Perceived performance optimization

### Empty States
- [ ] Helpful messaging
- [ ] Call to action
- [ ] Visual indicator
- [ ] First-time user guidance

### Error States
- [ ] Clear error messaging (user-friendly)
- [ ] Recovery suggestions
- [ ] Retry options
- [ ] Graceful degradation
- [ ] No technical jargon

### Forms (if applicable)
- [ ] Inline validation
- [ ] Real-time feedback
- [ ] Clear labels and placeholders
- [ ] Error messages near fields
- [ ] Success confirmation
- [ ] Autosave / draft persistence
- [ ] Proper input types

### Navigation
- [ ] Consistent patterns
- [ ] Clear hierarchy
- [ ] Back/undo works as expected
- [ ] Deep linking support
- [ ] State reflected in URL (web)
- [ ] Breadcrumbs where helpful

### Interactions
- [ ] Appropriate touch/click targets (min 44x44px)
- [ ] Hover states (desktop)
- [ ] Active/pressed states
- [ ] Focus states
- [ ] Disabled states
- [ ] Loading states on actions
- [ ] Confirmation for destructive actions
- [ ] Undo capability where possible

### Feedback
- [ ] Success notifications
- [ ] Error notifications
- [ ] Progress feedback
- [ ] Sound/haptic feedback (if appropriate)

### Responsive Design (if applicable)
- [ ] Works on all target screen sizes
- [ ] Touch-friendly on mobile
- [ ] Hover-friendly on desktop
- [ ] Orientation support
- [ ] Safe areas (notches, etc.)

### Theming
- [ ] Dark/light mode (if applicable)
- [ ] System preference detection
- [ ] Persisted preference
- [ ] Proper contrast in all themes

---

## 3. SECURITY - Security Hardening

### Authentication
- [ ] Secure password hashing (bcrypt, argon2, scrypt)
- [ ] Password complexity requirements
- [ ] Secure session/token management
- [ ] Token expiration and refresh
- [ ] Session timeout
- [ ] Session invalidation on password change
- [ ] Logout functionality
- [ ] Device/session management

### Multi-Factor Authentication (if applicable)
- [ ] TOTP support
- [ ] Backup codes
- [ ] Recovery options
- [ ] Security keys (WebAuthn/FIDO2)

### Authorization
- [ ] Server-side permission checks on ALL operations
- [ ] Role-based or attribute-based access control
- [ ] Resource-level permissions
- [ ] Principle of least privilege

### Input Security
- [ ] Input validation (server-side REQUIRED)
- [ ] Input sanitization
- [ ] Output encoding/escaping
- [ ] Injection prevention (SQL, NoSQL, command, XSS)
- [ ] File upload validation
- [ ] Content-Type validation
- [ ] Size limits

### Transport Security
- [ ] TLS/HTTPS everywhere
- [ ] Secure headers (HSTS, CSP, X-Frame-Options, etc.)
- [ ] Secure cookies (HttpOnly, Secure, SameSite)
- [ ] CORS configuration
- [ ] Certificate management

### Rate Limiting
- [ ] Per-IP limits
- [ ] Per-user limits
- [ ] Per-endpoint limits
- [ ] Brute force protection
- [ ] DDoS mitigation

### Secrets Management
- [ ] Environment variables (not in code)
- [ ] Secret rotation capability
- [ ] No secrets in logs
- [ ] Vault/secret manager (production)

### Audit & Monitoring
- [ ] Authentication event logging
- [ ] Authorization failure logging
- [ ] Suspicious activity detection
- [ ] Security alerting

---

## 4. A11Y - Accessibility

*Applies to web, mobile, desktop - adapt to platform standards*

### Semantic Structure
- [ ] Proper heading hierarchy
- [ ] Meaningful landmarks/regions
- [ ] Lists for list content
- [ ] Tables for tabular data
- [ ] Buttons for actions, links for navigation

### Assistive Technology
- [ ] Screen reader compatible
- [ ] Labels on interactive elements
- [ ] Descriptions for complex widgets
- [ ] Live regions for dynamic content
- [ ] Proper focus management

### Keyboard/Input
- [ ] Full keyboard navigation
- [ ] Logical focus order
- [ ] Visible focus indicators
- [ ] No keyboard traps
- [ ] Skip navigation (web)
- [ ] Keyboard shortcuts (if applicable)

### Visual
- [ ] Sufficient color contrast (4.5:1 text, 3:1 UI)
- [ ] Not color-only information
- [ ] Text resizable without breaking
- [ ] Zoom support
- [ ] Reduced motion option

### Forms
- [ ] Visible labels
- [ ] Error identification
- [ ] Error suggestions
- [ ] Required field indication
- [ ] Accessible validation messages

### Media
- [ ] Alt text on images
- [ ] Captions on video
- [ ] Transcripts for audio
- [ ] No autoplay

### Testing
- [ ] Screen reader tested
- [ ] Keyboard-only tested
- [ ] Automated a11y testing
- [ ] Manual audit completed

---

## 5. ARCH - Architecture & Code Quality

### Structure
- [ ] Consistent file/folder organization
- [ ] Clear separation of concerns
- [ ] Logical module boundaries
- [ ] Predictable patterns

### Principles
- [ ] DRY (Don't Repeat Yourself)
- [ ] Single Responsibility
- [ ] Open/Closed
- [ ] Composition over inheritance
- [ ] Dependency inversion
- [ ] Immutability preference

### Type Safety (if using typed language)
- [ ] Strict mode enabled
- [ ] No unsafe type assertions
- [ ] Proper null/undefined handling
- [ ] Complete type coverage

### Code Quality
- [ ] Small, focused functions/methods
- [ ] Clear naming conventions
- [ ] Consistent style
- [ ] No dead code
- [ ] No unused dependencies
- [ ] Proper error handling patterns

### State Management (if applicable)
- [ ] Minimal global state
- [ ] Colocated state
- [ ] No duplicated state
- [ ] Clear data flow
- [ ] Cache invalidation strategy

### Dependencies
- [ ] Minimal dependencies
- [ ] Regular updates
- [ ] Security audit
- [ ] License compliance

---

## 6. DX - Developer Experience

### Documentation
- [ ] README with setup steps
- [ ] Architecture overview
- [ ] API documentation
- [ ] Contributing guide
- [ ] Changelog

### Setup
- [ ] Simple setup process
- [ ] Environment config template
- [ ] Seed/sample data
- [ ] Clear prerequisites

### Tooling
- [ ] Linter configured
- [ ] Formatter configured
- [ ] Type checker (if applicable)
- [ ] Git hooks
- [ ] Editor config

### Development
- [ ] Fast feedback loop (hot reload, watch mode)
- [ ] Reasonable build times
- [ ] Debug tooling
- [ ] Local development works offline

### Git
- [ ] Branch naming convention
- [ ] Commit message convention
- [ ] PR/MR template
- [ ] Issue templates
- [ ] Protected branches

### CI/CD
- [ ] Automated testing
- [ ] Automated linting
- [ ] Build verification
- [ ] Preview/staging deployments
- [ ] Automated releases

---

## 7. SEO - Search Engine Optimization

*Skip if not applicable (API-only, internal tools, native apps)*

### Meta Tags
- [ ] Unique titles
- [ ] Unique descriptions
- [ ] Canonical URLs
- [ ] Robots directives

### Social Sharing
- [ ] Open Graph tags
- [ ] Twitter/X Cards
- [ ] Social images

### Structured Data
- [ ] Schema.org markup (JSON-LD)
- [ ] Relevant schemas for content type

### Technical SEO
- [ ] XML sitemap
- [ ] robots.txt
- [ ] Clean URLs
- [ ] No duplicate content
- [ ] Proper redirects
- [ ] No broken links

### Content
- [ ] Heading hierarchy
- [ ] Image alt text
- [ ] Internal linking
- [ ] Fast page load
- [ ] Mobile-friendly

---

## 8. RESILIENCE - Error Handling & Recovery

### Error Boundaries
- [ ] Global error catching
- [ ] Graceful error UI
- [ ] Error recovery options
- [ ] Error reporting to monitoring

### API/Service Errors
- [ ] Consistent error format
- [ ] Appropriate error codes
- [ ] User-friendly messages
- [ ] No sensitive info in errors

### Network Resilience
- [ ] Timeout handling
- [ ] Retry with backoff
- [ ] Circuit breaker pattern (if applicable)
- [ ] Offline detection
- [ ] Request deduplication

### Graceful Degradation
- [ ] Feature flags
- [ ] Fallback UI/behavior
- [ ] Third-party failure isolation
- [ ] Progressive enhancement

### Monitoring
- [ ] Error tracking service
- [ ] Error alerting
- [ ] Error context/breadcrumbs
- [ ] User impact tracking

### Recovery
- [ ] Auto-retry where appropriate
- [ ] Manual retry option
- [ ] Data recovery (drafts, etc.)
- [ ] Session recovery

---

## 9. DATA - Data Integrity & Consistency

### Schema (if using database)
- [ ] Proper data types
- [ ] Constraints (NOT NULL, UNIQUE, FK)
- [ ] Proper indexes
- [ ] Default values

### Validation
- [ ] Client-side validation (UX)
- [ ] Server-side validation (REQUIRED)
- [ ] Schema validation
- [ ] Sanitization

### Consistency
- [ ] Transaction handling
- [ ] Optimistic locking (if needed)
- [ ] Conflict resolution
- [ ] Cache invalidation

### Migrations
- [ ] Version controlled
- [ ] Reversible
- [ ] Tested before production
- [ ] Zero-downtime capable

### Backup & Recovery
- [ ] Automated backups
- [ ] Point-in-time recovery
- [ ] Backup testing
- [ ] Disaster recovery plan

### Privacy
- [ ] Data minimization
- [ ] Retention policies
- [ ] Deletion capability
- [ ] Export capability

---

## 10. OPS - Operations & Deployment

### Deployment
- [ ] Zero-downtime deployment
- [ ] Rollback capability
- [ ] Feature flags
- [ ] Environment parity

### Infrastructure
- [ ] Auto-scaling (if applicable)
- [ ] Load balancing (if applicable)
- [ ] CDN configuration
- [ ] Database scaling strategy

### Monitoring
- [ ] Uptime monitoring
- [ ] Performance monitoring (APM)
- [ ] Error monitoring
- [ ] Log aggregation
- [ ] Alerting rules

### Security
- [ ] SSL/TLS certificates
- [ ] Certificate renewal
- [ ] Secret management
- [ ] Access control
- [ ] Audit logging

### Cost
- [ ] Resource limits
- [ ] Cost monitoring
- [ ] Alerts for anomalies

---

## 11. I18N - Internationalization

*Skip if single-language only*

### Translation
- [ ] Externalized strings
- [ ] No hardcoded text
- [ ] Pluralization support
- [ ] Context for translators

### Formatting
- [ ] Date/time localization
- [ ] Number formatting
- [ ] Currency formatting
- [ ] Timezone handling

### Layout
- [ ] RTL support (if applicable)
- [ ] Text expansion room
- [ ] Font support for all languages
- [ ] Proper encoding (UTF-8)

### Content
- [ ] Language detection
- [ ] Language switcher
- [ ] Proper URL structure
- [ ] Fallback language

---

## 12. LEGAL - Legal & Compliance

### Privacy
- [ ] Privacy policy
- [ ] Cookie policy (if applicable)
- [ ] Cookie consent (if required)
- [ ] GDPR compliance (if applicable)
- [ ] CCPA compliance (if applicable)
- [ ] Data processing agreements

### Terms
- [ ] Terms of service
- [ ] User agreements
- [ ] Refund policy (if applicable)
- [ ] Copyright notices

### Accessibility
- [ ] Accessibility statement
- [ ] Compliance documentation

### Age Restrictions (if applicable)
- [ ] Age verification
- [ ] COPPA compliance
- [ ] Age-gated content

---

## 13. ANALYTICS - Analytics & Tracking

*Skip if not tracking users*

### Core Analytics
- [ ] Page/screen views
- [ ] User sessions
- [ ] User retention
- [ ] Traffic sources

### Events
- [ ] Key action tracking
- [ ] Conversion goals
- [ ] Funnel analysis
- [ ] Custom events

### Technical
- [ ] Performance metrics
- [ ] Error tracking
- [ ] Feature usage

### Privacy-Compliant
- [ ] Consent management
- [ ] IP anonymization (if required)
- [ ] Data retention limits
- [ ] Opt-out option

---

## 14. TESTING - Test Coverage

### Unit Tests
- [ ] Business logic
- [ ] Utility functions
- [ ] Critical paths
- [ ] Edge cases

### Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] External services
- [ ] Authentication flows

### End-to-End Tests
- [ ] Critical user journeys
- [ ] Cross-browser/platform (if applicable)
- [ ] Core features

### Additional Testing (as applicable)
- [ ] Visual regression
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing

---

## 15. API - API Design

*Applies to REST, GraphQL, gRPC, or any API*

### Design
- [ ] Consistent conventions
- [ ] Proper status/error codes
- [ ] Clear resource naming
- [ ] Pagination
- [ ] Filtering/sorting

### Documentation
- [ ] API spec (OpenAPI, GraphQL schema, etc.)
- [ ] Request/response examples
- [ ] Error examples
- [ ] Authentication docs

### Versioning
- [ ] Version strategy
- [ ] Deprecation policy
- [ ] Migration guides

### Performance
- [ ] Response compression
- [ ] Caching headers
- [ ] Field selection/sparse fieldsets
- [ ] Batch operations

### Security
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Input validation
- [ ] Rate limiting

---

## 16. REALTIME - Real-time Features

*Skip if not using real-time*

### Connection
- [ ] Connection management
- [ ] Reconnection logic
- [ ] Heartbeat/keep-alive
- [ ] Graceful disconnection

### State Sync
- [ ] Optimistic updates
- [ ] Conflict resolution
- [ ] Eventual consistency handling
- [ ] Offline queue

### Presence (if applicable)
- [ ] Online indicators
- [ ] Typing indicators
- [ ] Activity status

### Notifications
- [ ] Push notifications
- [ ] In-app notifications
- [ ] Email notifications
- [ ] Notification preferences

---

## 17. MEDIA - Media Handling

*Skip if not handling media*

### Upload
- [ ] Size limits
- [ ] Type validation
- [ ] Virus scanning (if applicable)
- [ ] Progress indication

### Processing
- [ ] Image optimization
- [ ] Thumbnail generation
- [ ] Video transcoding (if applicable)
- [ ] Format conversion

### Delivery
- [ ] CDN delivery
- [ ] Responsive serving
- [ ] Lazy loading
- [ ] Caching

---

## 18. SCALE - Scale & Infrastructure

*Depth depends on scale requirements*

### Database
- [ ] Read replicas (if needed)
- [ ] Connection pooling
- [ ] Query optimization
- [ ] Sharding strategy (if needed)

### Caching
- [ ] Multi-layer caching
- [ ] Cache invalidation
- [ ] Distributed cache (if needed)

### Queues (if applicable)
- [ ] Background job processing
- [ ] Retry logic
- [ ] Dead letter handling
- [ ] Job monitoring

### Search (if applicable)
- [ ] Full-text search
- [ ] Relevance ranking
- [ ] Search suggestions

---

## 19. SOCIAL - Social Features

*Skip if not a social platform*

### Sharing
- [ ] Share functionality
- [ ] Social meta tags
- [ ] Embed support

### Content Moderation
- [ ] User-generated content handling
- [ ] Report system
- [ ] Spam detection
- [ ] Block/mute functionality

### Engagement
- [ ] Likes/reactions
- [ ] Comments
- [ ] Follows
- [ ] Mentions
- [ ] Notifications

---

## 20. MOBILE - Mobile & PWA

*Skip if not mobile/PWA*

### PWA (Web)
- [ ] Web app manifest
- [ ] Service worker
- [ ] Offline support
- [ ] Install prompt
- [ ] App icons

### Mobile UX
- [ ] Touch-optimized
- [ ] Gestures
- [ ] Native patterns
- [ ] Safe areas

### Native Features (if applicable)
- [ ] Camera/photos
- [ ] Geolocation
- [ ] Push notifications
- [ ] Biometrics

---

# Priority Levels

| Level | Meaning | SLA |
|-------|---------|-----|
| **P0** | Critical - Broken, security vuln, data loss | Fix immediately |
| **P1** | High - Major feature broken, legal issue | Fix within hours |
| **P2** | Medium - Minor bugs, improvements | Fix within days |
| **P3** | Low - Nice to have, polish | Backlog |

---

# Workflow

```
/qa full
    │
    ├── 1. 🔍 IDENTIFY your stack
    │       └── What framework/language/platform?
    │       └── What features exist?
    │       └── Skip irrelevant phases
    │
    ├── 2. 🔍 SCAN applicable phases
    │       └── Search codebase systematically
    │       └── Check against relevant items
    │
    ├── 3. 📋 REPORT findings
    │       └── Prioritized list (P0 → P3)
    │       └── Issue count per phase
    │
    ├── 4. 🔧 FIX issues
    │       └── P0 first, then P1, P2, P3
    │       └── Use stack-appropriate solutions
    │
    ├── 5. ✅ VERIFY
    │       └── Build passes
    │       └── Tests pass
    │
    └── 6. 🚀 DEPLOY
            └── Commit & push
```

---

# Benchmark Standards

| Company | Known For |
|---------|-----------|
| **X.com** | Real-time, scale, performance |
| **GitHub** | DX, reliability, API design |
| **Linear** | Design, animations, polish |
| **Stripe** | Security, docs, API design |
| **Vercel** | Speed, DX, deployment |
| **Notion** | UX, real-time, offline |
| **Figma** | Performance, real-time |
| **Discord** | Real-time, scale, mobile |
| **Shopify** | E-commerce, scale, i18n |
| **Airbnb** | UX, i18n, mobile |

---

# Quick Reference

```
/qa full        → Complete audit (adapts to your stack)
/qa perf        → Performance
/qa security    → Security
/qa a11y        → Accessibility
/qa [phase]     → Any specific phase
```

**Phases automatically adapt to:**
- Your framework (React, Vue, Django, Rails, etc.)
- Your language (TypeScript, Python, Go, etc.)
- Your platform (Web, Mobile, Desktop, API)
- Your architecture (Monolith, Microservices, Serverless)
- Your features (skip what doesn't apply)

---

**Total: 20 phases, 400+ checks, universally applicable.**
