# Universal Quality Audit Framework

The most comprehensive quality audit possible. 20 phases, 400+ checks. Covers everything from a simple landing page to X.com-scale platforms. Every detail. Nothing overlooked.

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

---

## 1. PERF - Performance Excellence

### Bundle & Assets
- [ ] Bundle size < 200KB initial JS (gzipped)
- [ ] Code splitting per route
- [ ] Dynamic imports for heavy components
- [ ] Tree shaking verification
- [ ] Dead code elimination
- [ ] No duplicate dependencies
- [ ] Minification enabled
- [ ] Source maps in production (optional, for debugging)

### Images
- [ ] Next-gen formats (WebP, AVIF)
- [ ] Responsive srcset
- [ ] Lazy loading (below fold)
- [ ] Eager loading (above fold, LCP)
- [ ] Proper sizing (no layout shift)
- [ ] Image CDN with transforms
- [ ] Blur placeholder / LQIP
- [ ] SVG optimization

### Fonts
- [ ] Font subsetting
- [ ] Preload critical fonts
- [ ] font-display: swap
- [ ] Variable fonts where possible
- [ ] Local font fallbacks
- [ ] No FOUT/FOIT

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms (INP < 200ms)
- [ ] CLS < 0.1
- [ ] TTFB < 600ms
- [ ] FCP < 1.8s
- [ ] TBT < 200ms

### Runtime Performance
- [ ] 60fps animations
- [ ] GPU-accelerated transforms
- [ ] will-change used sparingly
- [ ] No forced synchronous layouts
- [ ] Debounced scroll/resize handlers
- [ ] RequestAnimationFrame for animations
- [ ] Web Workers for heavy computation
- [ ] Memory leak detection
- [ ] No memory bloat over time

### Network
- [ ] HTTP/2 or HTTP/3
- [ ] Preconnect to critical origins
- [ ] DNS prefetch
- [ ] Resource hints (prefetch, preload)
- [ ] Service worker caching
- [ ] Offline support
- [ ] Background sync
- [ ] Compression (gzip/brotli)

### Caching
- [ ] CDN for static assets
- [ ] Browser cache headers
- [ ] Immutable assets with hashes
- [ ] ISR/SSG where possible
- [ ] Redis/memory cache for API
- [ ] Database query cache
- [ ] Edge caching

### Database
- [ ] Query optimization
- [ ] N+1 query prevention
- [ ] Proper indexes
- [ ] Connection pooling
- [ ] Read replicas
- [ ] Query timeout limits
- [ ] Slow query logging

---

## 2. UX - User Experience

### Loading States
- [ ] Skeleton screens
- [ ] Progress indicators
- [ ] Shimmer effects
- [ ] Optimistic updates
- [ ] Stale-while-revalidate
- [ ] Loading priority (critical first)

### Empty States
- [ ] Helpful messaging
- [ ] Call to action
- [ ] Illustration/icon
- [ ] First-time user guidance

### Error States
- [ ] Clear error messaging
- [ ] Recovery suggestions
- [ ] Retry buttons
- [ ] Error boundaries per section
- [ ] Graceful degradation

### Forms
- [ ] Inline validation
- [ ] Real-time feedback
- [ ] Clear labels
- [ ] Placeholder text
- [ ] Input masking
- [ ] Autofill support
- [ ] Autocomplete attributes
- [ ] Error summary
- [ ] Success confirmation
- [ ] Form persistence (draft saving)

### Navigation
- [ ] Consistent header/footer
- [ ] Breadcrumbs
- [ ] Back button works
- [ ] Deep linking
- [ ] URL reflects state
- [ ] History management
- [ ] Scroll position restoration

### Interactions
- [ ] Touch targets 44x44px minimum
- [ ] Hover states
- [ ] Active/pressed states
- [ ] Focus states
- [ ] Disabled states
- [ ] Loading states on buttons
- [ ] Confirmation for destructive actions
- [ ] Undo capability
- [ ] Keyboard shortcuts
- [ ] Gesture support (swipe, pinch)

### Feedback
- [ ] Toast notifications
- [ ] Success messages
- [ ] Error messages
- [ ] Progress feedback
- [ ] Haptic feedback (mobile)
- [ ] Sound feedback (optional)

### Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints: 320, 640, 768, 1024, 1280, 1536
- [ ] Touch-friendly on mobile
- [ ] Hover-friendly on desktop
- [ ] Orientation support
- [ ] Foldable device support
- [ ] Safe area insets (notch)

### Dark Mode
- [ ] System preference detection
- [ ] Manual toggle
- [ ] Persisted preference
- [ ] Smooth transition
- [ ] Proper contrast in both modes
- [ ] Images adapted for dark mode

---

## 3. SECURITY - Security Hardening

### Authentication
- [ ] Secure password hashing (bcrypt/argon2)
- [ ] Password strength requirements
- [ ] Secure session management
- [ ] Token refresh mechanism
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Session timeout
- [ ] Session invalidation on password change
- [ ] Remember me functionality
- [ ] Device/session management
- [ ] Logout from all devices

### Multi-Factor Authentication
- [ ] TOTP support (authenticator apps)
- [ ] SMS backup (with warnings)
- [ ] Recovery codes
- [ ] Security keys (WebAuthn)
- [ ] Email verification

### Authorization
- [ ] Server-side permission checks
- [ ] Role-based access control
- [ ] Resource-level permissions
- [ ] API endpoint protection
- [ ] Admin panel protection
- [ ] Rate limiting per role

### Input Security
- [ ] Input sanitization
- [ ] Output encoding
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] NoSQL injection prevention
- [ ] Command injection prevention
- [ ] Path traversal prevention
- [ ] File upload validation
- [ ] Content-Type validation
- [ ] File size limits

### Headers & Transport
- [ ] HTTPS everywhere
- [ ] HSTS header
- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Permissions-Policy
- [ ] CORS configuration

### Rate Limiting
- [ ] Per-IP limits
- [ ] Per-user limits
- [ ] Per-endpoint limits
- [ ] Graduated responses
- [ ] Bypass for trusted sources
- [ ] DDoS protection

### Secrets & Keys
- [ ] Environment variables
- [ ] Secret rotation
- [ ] No secrets in code
- [ ] No secrets in logs
- [ ] Vault/secret manager
- [ ] API key scoping

### Audit & Monitoring
- [ ] Login attempt logging
- [ ] Failed auth logging
- [ ] Permission change logging
- [ ] Suspicious activity detection
- [ ] IP geolocation anomalies
- [ ] Security event alerts

---

## 4. A11Y - Accessibility (WCAG 2.1 AA+)

### Semantic HTML
- [ ] Proper heading hierarchy (h1-h6)
- [ ] Landmark regions (nav, main, aside)
- [ ] Lists for lists
- [ ] Tables for tabular data
- [ ] Buttons for actions
- [ ] Links for navigation
- [ ] Form element associations

### ARIA
- [ ] aria-label on icon buttons
- [ ] aria-labelledby for complex widgets
- [ ] aria-describedby for help text
- [ ] aria-expanded for accordions
- [ ] aria-selected for tabs
- [ ] aria-live for dynamic content
- [ ] aria-busy for loading states
- [ ] role attributes where needed
- [ ] aria-hidden for decorative elements

### Keyboard
- [ ] Tab navigation works
- [ ] Logical tab order
- [ ] Focus visible
- [ ] Skip links
- [ ] No keyboard traps
- [ ] Escape closes modals
- [ ] Arrow keys for widgets
- [ ] Enter/Space for buttons

### Visual
- [ ] 4.5:1 contrast (text)
- [ ] 3:1 contrast (large text, UI)
- [ ] Not color-only information
- [ ] Focus indicators visible
- [ ] Text resizable to 200%
- [ ] Zoom to 400% works
- [ ] No horizontal scroll at 320px

### Motion
- [ ] Reduced motion support
- [ ] No autoplay video
- [ ] Pause/stop controls
- [ ] No flashing > 3Hz
- [ ] Animation duration controls

### Forms
- [ ] Visible labels
- [ ] Error identification
- [ ] Error suggestions
- [ ] Required field indication
- [ ] Input purpose (autocomplete)
- [ ] Inline validation accessible

### Media
- [ ] Alt text on images
- [ ] Captions on video
- [ ] Transcripts for audio
- [ ] Audio descriptions
- [ ] No audio autoplay

### Testing
- [ ] Screen reader tested (NVDA, VoiceOver)
- [ ] Keyboard-only tested
- [ ] High contrast mode tested
- [ ] axe-core automated testing
- [ ] Manual accessibility audit

---

## 5. ARCH - Architecture & Code Quality

### Structure
- [ ] Consistent folder structure
- [ ] Feature-based organization
- [ ] Clear separation of concerns
- [ ] Colocation (related files together)
- [ ] Barrel exports where appropriate

### Principles
- [ ] DRY (Don't Repeat Yourself)
- [ ] SOLID principles
- [ ] Single responsibility
- [ ] Open/closed principle
- [ ] Composition over inheritance
- [ ] Immutability preference
- [ ] Pure functions where possible

### TypeScript
- [ ] Strict mode enabled
- [ ] No 'any' types
- [ ] No 'as' assertions (prefer type guards)
- [ ] Proper generics
- [ ] Discriminated unions
- [ ] Exhaustive switch statements
- [ ] Proper null handling

### Components
- [ ] Small, focused components
- [ ] Proper prop types
- [ ] Default props
- [ ] Memoization where needed
- [ ] Error boundaries
- [ ] Loading boundaries (Suspense)
- [ ] Proper key props

### State Management
- [ ] Minimal global state
- [ ] Colocated state
- [ ] Derived state (not duplicated)
- [ ] Server state separation
- [ ] Optimistic updates
- [ ] Cache invalidation

### Patterns
- [ ] Consistent async patterns
- [ ] Consistent error handling
- [ ] Consistent API calls
- [ ] Consistent form handling
- [ ] Custom hooks extraction
- [ ] Utility function organization

### Dependencies
- [ ] Minimal dependencies
- [ ] No duplicate functionality
- [ ] Regular updates
- [ ] Security audit
- [ ] License compliance
- [ ] Bundle impact awareness

---

## 6. DX - Developer Experience

### Documentation
- [ ] README with setup steps
- [ ] Architecture overview
- [ ] API documentation
- [ ] Component documentation
- [ ] Contributing guide
- [ ] Code of conduct
- [ ] Changelog
- [ ] Decision records (ADRs)

### Setup
- [ ] One-command setup
- [ ] .env.example file
- [ ] Docker development option
- [ ] Seed data scripts
- [ ] Clear prerequisites

### Tooling
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] TypeScript configured
- [ ] Git hooks (husky)
- [ ] Commit message linting
- [ ] Pre-commit checks
- [ ] Editor config

### Development
- [ ] Fast hot reload
- [ ] Fast builds (< 30s)
- [ ] Parallel task running
- [ ] Watch mode for tests
- [ ] Debug configuration
- [ ] Source maps

### Git
- [ ] Branch naming convention
- [ ] Commit message convention
- [ ] PR template
- [ ] Issue templates
- [ ] Protected branches
- [ ] Required reviews

### CI/CD
- [ ] Automated testing
- [ ] Automated linting
- [ ] Type checking
- [ ] Build verification
- [ ] Preview deployments
- [ ] Automated releases

---

## 7. SEO - Search Engine Optimization

### Meta Tags
- [ ] Unique titles (< 60 chars)
- [ ] Unique descriptions (< 160 chars)
- [ ] Canonical URLs
- [ ] Robots meta (index, follow)
- [ ] Viewport meta

### Social
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Cards (twitter:card, twitter:title, etc.)
- [ ] Social image dimensions (1200x630)
- [ ] Social image alt text

### Structured Data
- [ ] JSON-LD schema
- [ ] Organization schema
- [ ] Website schema
- [ ] Breadcrumb schema
- [ ] Article schema (if applicable)
- [ ] Product schema (if applicable)
- [ ] FAQ schema (if applicable)

### Technical
- [ ] XML sitemap
- [ ] Sitemap in robots.txt
- [ ] robots.txt configured
- [ ] Clean URLs
- [ ] No duplicate content
- [ ] Proper redirects (301)
- [ ] No broken links
- [ ] HTTPS

### Content
- [ ] Heading hierarchy
- [ ] Internal linking
- [ ] Image alt text
- [ ] Descriptive anchor text
- [ ] Readable URLs
- [ ] Fast page load

### Crawlability
- [ ] JavaScript rendered content indexable
- [ ] Infinite scroll with pagination
- [ ] Proper 404 pages
- [ ] Proper error pages
- [ ] No orphan pages

---

## 8. RESILIENCE - Error Handling & Recovery

### Error Boundaries
- [ ] Global error boundary
- [ ] Route-level error boundaries
- [ ] Component-level error boundaries
- [ ] Error recovery UI
- [ ] Error reporting

### API Errors
- [ ] Consistent error format
- [ ] Proper HTTP status codes
- [ ] Error messages (user-friendly)
- [ ] Error codes (machine-readable)
- [ ] Stack traces (dev only)

### Network Resilience
- [ ] Timeout handling
- [ ] Retry with exponential backoff
- [ ] Circuit breaker pattern
- [ ] Offline detection
- [ ] Reconnection logic
- [ ] Request deduplication

### Graceful Degradation
- [ ] Feature flags
- [ ] Fallback UI
- [ ] Fallback data
- [ ] Progressive enhancement
- [ ] Third-party failure isolation

### Monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Error grouping
- [ ] Error alerting
- [ ] Error context
- [ ] User impact tracking
- [ ] Error trends

### Recovery
- [ ] Auto-retry
- [ ] Manual retry
- [ ] Data recovery
- [ ] Session recovery
- [ ] Draft saving
- [ ] Conflict resolution

---

## 9. DATA - Data Integrity & Consistency

### Schema
- [ ] Proper data types
- [ ] NOT NULL constraints
- [ ] Foreign key constraints
- [ ] Unique constraints
- [ ] Check constraints
- [ ] Default values
- [ ] Proper indexes

### Validation
- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Schema validation (Zod, etc.)
- [ ] Sanitization
- [ ] Type coercion

### Consistency
- [ ] Transaction handling
- [ ] Optimistic locking
- [ ] Conflict resolution
- [ ] Eventual consistency handling
- [ ] Cache invalidation

### Migrations
- [ ] Version controlled
- [ ] Reversible migrations
- [ ] Zero-downtime migrations
- [ ] Data migrations
- [ ] Migration testing

### Backup
- [ ] Automated backups
- [ ] Point-in-time recovery
- [ ] Backup testing
- [ ] Disaster recovery plan
- [ ] Data export

### Privacy
- [ ] Data minimization
- [ ] Data retention policies
- [ ] Data deletion (right to be forgotten)
- [ ] Data portability (export)
- [ ] Anonymization

---

## 10. OPS - Operations & Deployment

### Deployment
- [ ] Zero-downtime deployment
- [ ] Blue/green or canary
- [ ] Rollback capability
- [ ] Feature flags
- [ ] Environment parity

### Infrastructure
- [ ] Auto-scaling
- [ ] Load balancing
- [ ] Multi-region (if needed)
- [ ] CDN configuration
- [ ] Database scaling

### Monitoring
- [ ] Uptime monitoring
- [ ] Performance monitoring (APM)
- [ ] Error monitoring
- [ ] Log aggregation
- [ ] Alerting rules
- [ ] On-call rotation

### Security
- [ ] SSL/TLS certificates
- [ ] Certificate renewal
- [ ] Secret management
- [ ] Access control
- [ ] Audit logging

### Cost
- [ ] Resource limits
- [ ] Cost monitoring
- [ ] Cost alerts
- [ ] Right-sizing
- [ ] Reserved capacity

---

## 11. I18N - Internationalization

### Translation
- [ ] Externalized strings
- [ ] Translation management
- [ ] Pluralization rules
- [ ] Gender handling
- [ ] Context for translators

### Formatting
- [ ] Date/time formatting
- [ ] Number formatting
- [ ] Currency formatting
- [ ] Relative time
- [ ] Timezone handling

### Layout
- [ ] RTL support
- [ ] Text expansion room
- [ ] Dynamic layout
- [ ] Font support
- [ ] Character encoding (UTF-8)

### Content
- [ ] Language detection
- [ ] Language switcher
- [ ] URL structure (/en/, /es/)
- [ ] hreflang tags
- [ ] Default language fallback

---

## 12. LEGAL - Legal & Compliance

### Privacy
- [ ] Privacy policy
- [ ] Cookie policy
- [ ] Cookie consent banner
- [ ] GDPR compliance
- [ ] CCPA compliance
- [ ] Data processing agreements

### Terms
- [ ] Terms of service
- [ ] User agreements
- [ ] Refund policy (if applicable)
- [ ] Copyright notices
- [ ] License information

### Accessibility
- [ ] Accessibility statement
- [ ] VPAT (if required)
- [ ] Compliance documentation

### Age
- [ ] Age verification (if needed)
- [ ] COPPA compliance (if kids)
- [ ] Age-gated content

---

## 13. ANALYTICS - Analytics & Tracking

### Core Analytics
- [ ] Page views
- [ ] User sessions
- [ ] Unique visitors
- [ ] Bounce rate
- [ ] Session duration
- [ ] Traffic sources

### Events
- [ ] Click tracking
- [ ] Form submissions
- [ ] Downloads
- [ ] Video plays
- [ ] Custom events
- [ ] Conversion goals

### User Journey
- [ ] Funnel analysis
- [ ] User flows
- [ ] Drop-off points
- [ ] Path analysis
- [ ] Attribution

### Technical
- [ ] Performance metrics
- [ ] Error tracking
- [ ] Core Web Vitals
- [ ] API performance
- [ ] Feature usage

### Privacy-Compliant
- [ ] Consent management
- [ ] IP anonymization
- [ ] Data retention
- [ ] User opt-out
- [ ] Cookie-less options

---

## 14. TESTING - Test Coverage

### Unit Tests
- [ ] Utility functions
- [ ] Business logic
- [ ] Hooks
- [ ] Services
- [ ] 80%+ coverage

### Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] External services
- [ ] Authentication flows

### E2E Tests
- [ ] Critical user paths
- [ ] Checkout flow (if applicable)
- [ ] Authentication
- [ ] Core features
- [ ] Cross-browser

### Visual Tests
- [ ] Component screenshots
- [ ] Visual regression
- [ ] Responsive screenshots
- [ ] Dark mode screenshots

### Performance Tests
- [ ] Load testing
- [ ] Stress testing
- [ ] Spike testing
- [ ] Soak testing

### Security Tests
- [ ] Penetration testing
- [ ] Dependency scanning
- [ ] SAST/DAST
- [ ] Security headers

---

## 15. API - API Design

### REST Standards
- [ ] Proper HTTP methods
- [ ] Proper status codes
- [ ] Resource naming
- [ ] Consistent URLs
- [ ] Query parameters
- [ ] Pagination
- [ ] Filtering
- [ ] Sorting

### Documentation
- [ ] OpenAPI/Swagger
- [ ] Request examples
- [ ] Response examples
- [ ] Error examples
- [ ] Authentication docs

### Versioning
- [ ] Version strategy
- [ ] Deprecation policy
- [ ] Breaking change handling
- [ ] Migration guides

### Performance
- [ ] Response compression
- [ ] Caching headers
- [ ] Field selection
- [ ] Batch endpoints
- [ ] Rate limiting

### Security
- [ ] Authentication
- [ ] Authorization
- [ ] Input validation
- [ ] Output sanitization
- [ ] Rate limiting

---

## 16. REALTIME - Real-time Features

### WebSockets
- [ ] Connection management
- [ ] Reconnection logic
- [ ] Heartbeat/ping-pong
- [ ] Message queuing
- [ ] Backpressure handling

### State Sync
- [ ] Optimistic updates
- [ ] Conflict resolution
- [ ] Eventual consistency
- [ ] Offline queue
- [ ] Sync indicators

### Presence
- [ ] Online indicators
- [ ] Typing indicators
- [ ] Activity status
- [ ] Last seen

### Notifications
- [ ] Push notifications
- [ ] In-app notifications
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences

---

## 17. MEDIA - Media Handling

### Images
- [ ] Upload validation
- [ ] Size limits
- [ ] Type validation
- [ ] Virus scanning
- [ ] Automatic optimization
- [ ] Thumbnail generation
- [ ] CDN delivery

### Video
- [ ] Upload handling
- [ ] Transcoding
- [ ] Adaptive streaming (HLS/DASH)
- [ ] Thumbnail extraction
- [ ] Video player
- [ ] Progress tracking

### Audio
- [ ] Upload handling
- [ ] Format support
- [ ] Waveform generation
- [ ] Audio player
- [ ] Progress tracking

### Documents
- [ ] PDF handling
- [ ] Preview generation
- [ ] Download handling
- [ ] Virus scanning

---

## 18. SCALE - Scale & Infrastructure

### Database
- [ ] Read replicas
- [ ] Connection pooling
- [ ] Query optimization
- [ ] Sharding strategy
- [ ] Archival strategy

### Caching
- [ ] Multi-layer caching
- [ ] Cache invalidation
- [ ] Cache warming
- [ ] Distributed cache
- [ ] Cache stampede prevention

### Queues
- [ ] Background jobs
- [ ] Job retry logic
- [ ] Dead letter queues
- [ ] Job prioritization
- [ ] Job monitoring

### Search
- [ ] Full-text search
- [ ] Faceted search
- [ ] Relevance ranking
- [ ] Search suggestions
- [ ] Search analytics

### CDN
- [ ] Global distribution
- [ ] Edge caching
- [ ] Purge capability
- [ ] Custom domains
- [ ] SSL at edge

---

## 19. SOCIAL - Social Features

### Sharing
- [ ] Share buttons
- [ ] Copy link
- [ ] Native share (mobile)
- [ ] Social meta tags
- [ ] Share analytics

### Embeds
- [ ] oEmbed support
- [ ] Embed codes
- [ ] Responsive embeds
- [ ] Embed customization

### Content
- [ ] User-generated content
- [ ] Content moderation
- [ ] Spam detection
- [ ] Report system
- [ ] Block/mute

### Engagement
- [ ] Likes/reactions
- [ ] Comments
- [ ] Shares/reposts
- [ ] Follows
- [ ] Mentions
- [ ] Hashtags

---

## 20. MOBILE - Mobile & PWA

### PWA
- [ ] Web app manifest
- [ ] Service worker
- [ ] Offline support
- [ ] Install prompt
- [ ] App icons
- [ ] Splash screen

### Mobile UX
- [ ] Touch-optimized
- [ ] Swipe gestures
- [ ] Pull to refresh
- [ ] Bottom navigation
- [ ] Safe areas (notch)

### Native Features
- [ ] Camera access
- [ ] Geolocation
- [ ] Push notifications
- [ ] Share target
- [ ] Clipboard access

### Performance
- [ ] Mobile-first assets
- [ ] Reduced motion
- [ ] Data saver mode
- [ ] Battery-aware

---

# Priority Levels

| Level | Meaning | SLA |
|-------|---------|-----|
| **P0** | Critical - Site broken, security vuln, data loss | Fix immediately |
| **P1** | High - Major feature broken, bad UX, legal issue | Fix within hours |
| **P2** | Medium - Minor bugs, improvements, polish | Fix within days |
| **P3** | Low - Nice to have, minor polish, optimization | Backlog |

---

# Workflow

```
/qa full
    │
    ├── 1. 🔍 SCAN all 20 phases
    │       └── Search codebase systematically
    │
    ├── 2. 📋 REPORT findings
    │       └── Prioritized list (P0 → P3)
    │       └── Issue count per phase
    │       └── Estimated effort
    │
    ├── 3. 🔧 FIX issues
    │       └── P0 first, then P1, P2, P3
    │       └── Batch similar fixes
    │
    ├── 4. ✅ VERIFY
    │       └── Build passes
    │       └── Tests pass
    │       └── Manual verification
    │
    └── 5. 🚀 DEPLOY
            └── Commit with detailed message
            └── Push to trigger deployment
```

---

# Benchmark Standards

Compare against the best:

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

---

# Quick Commands

```
/qa full        → Complete 20-phase audit (400+ checks)
/qa perf        → Performance only
/qa security    → Security only
/qa a11y        → Accessibility only
/qa [phase]     → Any specific phase
```

---

**Total: 20 phases, 400+ individual checks, covering every aspect of a production application.**
