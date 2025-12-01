# Universal Quality Audit Framework

A truly universal, framework-agnostic quality audit. Works for ANY tech stack, ANY language, ANY platform. **21 phases, 450+ checks** adapted to whatever you're building.

> ⚠️ **Important**: Static code analysis alone is insufficient. Phase 21 (RUNTIME) requires actually running and testing the application to catch state synchronization bugs that code review cannot detect.

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
| `/qa full` | Complete 21-phase audit |
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
| `/qa runtime` | **Runtime Testing & State Verification** ⚡ |

---

# THE 21 PHASES

*Phases 1-20: Static analysis (code review). Phase 21: Runtime testing (actually using the app).*

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

### Query Pattern Verification *(actually trace each query)*

*Adapt to your ORM/database:*

| Pattern | ✅ Good | ❌ Bad |
|---------|---------|--------|
| **Counting** | `COUNT(*)`, `_count`, `.count()` | Fetch all records, count in app code |
| **Averages/Sums** | `AVG()`, `SUM()`, `aggregate()` | Fetch all records, calculate in app |
| **Parallel queries** | `Promise.all()`, `asyncio.gather()`, concurrent requests | Sequential `await` / blocking calls |
| **Related data** | JOINs, eager loading, `select` with relations | N queries for N items (N+1 problem) |
| **Field selection** | `SELECT col1, col2`, projection, `select:` | `SELECT *`, full record when only count needed |
| **Large datasets** | Pagination, cursors, `LIMIT/OFFSET` | Unbounded queries returning all rows |

#### ORM-Specific Examples

| ORM/DB | Count | Average | Parallel |
|--------|-------|---------|----------|
| **Prisma** | `_count`, `groupBy` | `aggregate({ _avg })` | `Promise.all([...])` |
| **Django** | `.count()`, `annotate(Count())` | `aggregate(Avg())` | `asyncio.gather()` |
| **SQLAlchemy** | `func.count()` | `func.avg()` | `asyncio.gather()` |
| **ActiveRecord** | `.count`, `.group(:x).count` | `.average(:col)` | `Parallel.map` |
| **Sequelize** | `count()`, `findAndCountAll` | `aggregate('col', 'avg')` | `Promise.all([...])` |
| **Raw SQL** | `SELECT COUNT(*)` | `SELECT AVG(col)` | Multiple concurrent connections |

#### Checklist
- [ ] **Counting uses DB aggregation** - not fetch-then-count
- [ ] **Math operations use DB aggregation** - not fetch-then-calculate
- [ ] **Independent queries run in parallel** - not sequential blocking
- [ ] **Related data uses JOINs/eager loading** - not N+1 queries
- [ ] **Only needed fields selected** - not full records
- [ ] **Large datasets are paginated** - not unbounded queries

---

## 2. UX - User Experience

### Loading States
- [ ] Skeleton screens or spinners
- [ ] Progress indicators for long operations
- [ ] Optimistic updates for instant feedback *(verify in Phase 21 RUNTIME)*
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
- [ ] State sync across components *(verify in Phase 21 RUNTIME)*

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

> **Note**: This phase checks if real-time CODE EXISTS. Phase 21 (RUNTIME) verifies it actually WORKS by testing the app.

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

## 21. RUNTIME - Runtime Testing & State Verification

*CRITICAL: Static code analysis cannot catch runtime state bugs. This phase requires actually running and testing the app.*

### Applies To

| App Type | Relevant? | Key Focus Areas |
|----------|-----------|-----------------|
| **Web App (SPA)** | ✅ Yes | Component state sync, cache invalidation, optimistic updates |
| **Web App (MPA/SSR)** | ✅ Yes | Cache headers, revalidation, hydration issues |
| **Mobile App** | ✅ Yes | Background/foreground state, offline sync, push handling |
| **Desktop App** | ✅ Yes | Multi-window sync, system events, persistence |
| **API/Backend** | ✅ Yes | Cache consistency, webhook delivery, replica lag |
| **CLI Tool** | ⚠️ Partial | Config persistence, state between runs |
| **Static Site** | ⚠️ Partial | Build-time data freshness, CDN cache |

### Why This Phase Exists

Code patterns can look correct while behavior is broken:
- ✅ Event listener exists → ❌ But component doesn't re-render
- ✅ Cache invalidation code exists → ❌ But wrong keys are invalidated
- ✅ State update dispatched → ❌ But not all components subscribe to it

**This phase cannot be skipped. It requires actually using the application.**

### Critical User Flows (Test Each Manually)

*Adapt to your application type:*

#### Universal Flows (All Apps)
- [ ] **First Launch** - App loads correctly, no errors
- [ ] **Authentication** - Login/logout → all components reflect state change
- [ ] **Navigation** - All routes work, back/forward behaves correctly
- [ ] **Error Recovery** - App recovers gracefully from errors

#### User Account Flows (Apps with Accounts)
- [ ] **Registration → Login → First Use** - Complete new user journey
- [ ] **Profile/Settings Update** - Changes reflect everywhere immediately
- [ ] **Password/Email Change** - Sessions handled correctly
- [ ] **Account Deletion** - All data properly removed

#### Content Flows (Apps with User Content)
- [ ] **Create** - New item appears in all relevant lists
- [ ] **Read** - Detail view shows correct, fresh data
- [ ] **Update** - Changes propagate to all displays
- [ ] **Delete** - Item removed from all lists/caches

#### E-Commerce Flows (Shopping Apps)
- [ ] **Add to Cart** - Cart updates everywhere (header, sidebar, page)
- [ ] **Update Quantity** - Totals recalculate everywhere
- [ ] **Remove Item** - Item gone from all cart views
- [ ] **Checkout** - Inventory/stock updates correctly
- [ ] **Order Status** - Changes reflect in real-time

#### Dashboard/SaaS Flows
- [ ] **Data Refresh** - Charts/tables update correctly
- [ ] **Filter/Sort** - Results update without page reload
- [ ] **Settings Change** - Affects all relevant displays
- [ ] **Role/Permission Change** - UI adapts immediately

#### Real-Time Flows (Collaborative Apps)
- [ ] **Multi-User Edit** - Changes from others appear
- [ ] **Presence** - Online indicators accurate
- [ ] **Notifications** - Arrive in real-time
- [ ] **Conflict Resolution** - Handled gracefully

### State Synchronization Checklist

For each piece of shared state, verify it updates in ALL locations.

*Identify your app's shared state, then map every place it's displayed:*

#### Pattern: User/Account Data
| Data | Common Display Locations |
|------|-------------------------|
| Avatar/Photo | Header, sidebar, profile page, comments, posts, settings |
| Name | Header dropdown, profile page, authored content, @mentions |
| Role/Plan | Header badge, feature gates, settings, billing page |
| Preferences | All affected components (theme, language, notifications) |

#### Pattern: Entity/Item Data
| Data | Common Display Locations |
|------|-------------------------|
| Title/Name | List views, detail view, search results, breadcrumbs, related items |
| Status | Cards, tables, detail page, filters, dashboards |
| Count/Stats | Cards, detail page, analytics, reports |
| Relationships | Parent/child views, linked items, navigation |

#### Pattern: Transient State
| Data | Common Display Locations |
|------|-------------------------|
| Cart/Selection | Header icon, sidebar, checkout page, mini-cart |
| Notifications | Bell icon badge, dropdown, notification page |
| Progress | Progress bar, step indicator, completion % |
| Filters/Sort | URL, sidebar, applied filters display |

### Cross-Component Data Flow Verification

For critical data, trace the complete flow:

```
Data Source → API Response → Cache → Component State → Rendered UI
       ↓           ↓           ↓            ↓              ↓
   [Verify]    [Verify]    [Verify]     [Verify]       [Verify]
```

Specific checks:
- [ ] **Immediate Update** - Change appears instantly (< 100ms perceived)
- [ ] **No Stale Data** - Old data never flashes before new data
- [ ] **Consistency** - Same data never shows different values in different places
- [ ] **Cache Invalidation** - All relevant caches cleared on mutation
- [ ] **Event Propagation** - State change events reach all subscribers
- [ ] **Component Re-render** - Components actually re-render on state change

### Common Sync Failure Patterns

Check for these anti-patterns (adapt to your stack):

#### Universal Patterns
- [ ] **Missing Subscriber** - Component doesn't listen to state changes
- [ ] **Wrong Cache Key** - Invalidating different key than what's cached
- [ ] **Stale Reference** - Handler/callback captures outdated data
- [ ] **Race Condition** - Old async response overwrites newer data
- [ ] **Cache Not Cleared** - Browser/server cache holds stale data
- [ ] **Optimistic Rollback Failure** - Failed mutation doesn't restore UI

#### Frontend-Specific
| Framework | Common Issues |
|-----------|---------------|
| React | Missing `key` prop, stale closure in hooks, missing dependency array item |
| Vue | Reactivity lost (direct array mutation, new property on object) |
| Angular | Zone.js not triggered, OnPush strategy blocking update |
| Svelte | Reassignment needed for reactivity, store not subscribed |
| Vanilla JS | DOM not updated, event listener not attached |

#### Backend-Specific
- [ ] **Database Transaction Not Committed** - Change not persisted
- [ ] **Cache TTL Too Long** - Stale data served after mutation
- [ ] **Pub/Sub Not Published** - Other services not notified
- [ ] **Webhook Not Triggered** - External systems not updated
- [ ] **Replication Lag** - Read replica behind primary

### Real-Time Verification (if applicable)

- [ ] **Multi-Tab Sync** - Change in one tab reflects in other tabs
- [ ] **Multi-Device Sync** - Change on one device reflects on others
- [ ] **Presence Updates** - Online/typing indicators update correctly
- [ ] **Live Notifications** - Real-time events trigger appropriate UI updates

### Testing Methodology

1. **Identify Shared State** - List all data shown in multiple places
2. **Map Display Locations** - For each piece of data, list ALL places that display it
3. **Test Mutation** - Change the data and verify ALL locations update
4. **Test Edge Cases**:
   - [ ] Slow network (throttle to 3G)
   - [ ] Offline → online transition
   - [ ] Multiple rapid mutations
   - [ ] Concurrent mutations from multiple sources
   - [ ] Session timeout during operation
   - [ ] Browser tab backgrounded then foregrounded

### Platform-Specific Testing

#### Web Apps
- [ ] **Hard Refresh** - Ctrl+Shift+R shows latest data
- [ ] **Soft Refresh** - F5 shows latest data
- [ ] **Back/Forward** - Navigation shows correct state
- [ ] **New Tab** - Fresh tab shows latest data
- [ ] **Incognito** - Private browsing works correctly
- [ ] **Cross-Browser** - Chrome, Firefox, Safari, Edge consistency
- [ ] **PWA** - Service worker serves fresh data

#### Mobile Apps
- [ ] **App Restart** - Cold start shows fresh data
- [ ] **Background/Foreground** - State preserved correctly
- [ ] **Force Close** - Data persisted correctly
- [ ] **OS Memory Pressure** - App recovers state
- [ ] **Deep Link** - Opens correct state
- [ ] **Push Notification Tap** - Navigates to correct updated state

#### Desktop Apps
- [ ] **Window Close/Open** - State preserved
- [ ] **System Sleep/Wake** - Reconnects, refreshes
- [ ] **Multiple Windows** - State syncs between windows

#### APIs/Backend
- [ ] **Concurrent Requests** - No race conditions
- [ ] **Retry After Failure** - Idempotent, no duplicate effects
- [ ] **Webhook Delivery** - External systems receive updates
- [ ] **Database Replicas** - All replicas eventually consistent

### Verification Tools

*Use your stack's equivalent tools:*

#### Browser DevTools (Universal)
- **Network Tab** - Cache headers, request timing, response data
- **Application Tab** - Session/Local storage, cookies, cache storage
- **Console** - Errors, logs, event verification
- **Performance Tab** - Rendering, repaints, frame drops

#### Framework-Specific
| Framework | Tool |
|-----------|------|
| React | React DevTools (component state, props, hooks) |
| Vue | Vue DevTools (Vuex/Pinia state, component tree) |
| Angular | Angular DevTools (component tree, change detection) |
| Svelte | Svelte DevTools (state inspection) |
| Redux/Zustand | Redux DevTools (action history, state diff) |

#### Backend/API
- **Postman/Insomnia** - API response verification
- **Database GUI** - Direct data verification
- **Redis CLI/GUI** - Cache contents inspection
- **Log aggregator** - Server-side event trail

#### Mobile
| Platform | Tool |
|----------|------|
| React Native | Flipper, React DevTools |
| Flutter | Flutter DevTools |
| iOS | Xcode Instruments |
| Android | Android Studio Profiler |

### Performance Profiling *(actually measure, don't guess)*

Static code review CANNOT determine if queries are fast. You must measure.

#### What to Measure

| Metric | Tool | Target |
|--------|------|--------|
| API Response Time | Browser Network tab, Postman, curl | < 200ms for simple, < 500ms for complex |
| Database Query Time | Query logs, EXPLAIN, APM | < 50ms for simple, < 200ms for complex |
| Time to First Byte | Lighthouse, WebPageTest | < 600ms |
| Total Page Load | Lighthouse, WebPageTest | < 3s |

#### Platform-Specific Profiling Tools

| Platform | Tools |
|----------|-------|
| **Web (Browser)** | Chrome DevTools Network/Performance tab, Lighthouse |
| **Web (Server)** | APM (Datadog, New Relic), query logs, `console.time()` |
| **Mobile** | Flipper, Xcode Instruments, Android Profiler |
| **Backend API** | Postman, curl timing, APM, slow query logs |
| **Database** | `EXPLAIN ANALYZE`, slow query log, pg_stat_statements |

#### Red Flags
```
❌ API returns in 2+ seconds with few/no records → inefficient query
❌ Multiple sequential network requests → should be batched or parallel
❌ Same data fetched multiple times → missing cache or deduplication
❌ Large payload for simple view → over-fetching data
❌ Query time >> network time → database bottleneck
❌ Network time >> query time → payload too large or no compression
```

#### Quick Performance Test
1. Open Network/Performance tab (or equivalent for your platform)
2. Load each main screen/page
3. Note response times for each API call
4. If any endpoint > 500ms with minimal data → trace and optimize that query

### Documentation Requirement

After this phase, document (if not already documented):

1. **State Flow Diagram** - How critical data flows through the app
2. **Event/Message System** - What events/messages exist, what subscribes
3. **Cache Strategy** - What's cached (browser, CDN, server, DB), invalidation triggers
4. **Sync Points** - Where data is expected to sync across components/services

*This documentation prevents future regressions and onboards new developers.*

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
    ├── 2. 🔍 STATIC SCAN (Phases 1-20)
    │       └── Search codebase systematically
    │       └── Check against relevant items
    │       └── Code-level pattern analysis
    │
    ├── 3. 📋 REPORT static findings
    │       └── Prioritized list (P0 → P3)
    │       └── Issue count per phase
    │
    ├── 4. 🔧 FIX static issues
    │       └── P0 first, then P1, P2, P3
    │       └── Use stack-appropriate solutions
    │
    ├── 5. ✅ VERIFY static fixes
    │       └── Build passes
    │       └── Tests pass
    │
    ├── 6. ⚡ RUNTIME TESTING (Phase 21) ← CRITICAL
    │       └── Actually run the application
    │       └── Test critical user flows manually
    │       └── Verify state sync across components
    │       └── Check data propagation on mutations
    │       └── Multi-tab/multi-browser testing
    │
    ├── 7. 📋 REPORT runtime findings
    │       └── State sync issues
    │       └── Cache staleness
    │       └── UI consistency problems
    │
    ├── 8. 🔧 FIX runtime issues
    │       └── Event propagation fixes
    │       └── Cache invalidation fixes
    │       └── Re-render trigger fixes
    │
    └── 9. 🚀 DEPLOY
            └── Final verification
            └── Commit & push
```

## Why Runtime Testing is Separate

Static analysis can verify:
- ✅ Code pattern exists
- ✅ Event handler is defined
- ✅ Component imports hook

Static analysis CANNOT verify:
- ❌ Event actually reaches the handler
- ❌ Component actually re-renders
- ❌ Cache actually gets invalidated
- ❌ User sees the update instantly

**Examples of missed bugs:**

*React/Vue/Frontend:*
```typescript
// Code looks perfect, but...
useEffect(() => {
  subscribe('data-updated', handleUpdate);
  return () => unsubscribe('data-updated', handleUpdate);
}, []);
// Bug: handleUpdate captures stale state, key prop missing, cache stale
```

*Backend/API:*
```python
# Code looks perfect, but...
def update_user(user_id, data):
    db.update(user_id, data)
    cache.delete(f"user:{user_id}")
    return success
# Bug: Also cached at "profile:{user_id}" and "users:list" - not invalidated
```

*Mobile:*
```swift
// Code looks perfect, but...
NotificationCenter.default.addObserver(self, selector: #selector(refresh), name: .dataUpdated)
// Bug: Observer added but view not on screen, or added multiple times
```

Static scan says ✅. Runtime test reveals ❌.

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
/qa runtime     → Runtime Testing & State Verification ⚡ NEW
/qa [phase]     → Any specific phase
```

**Phases automatically adapt to:**
- Your framework (React, Vue, Django, Rails, etc.)
- Your language (TypeScript, Python, Go, etc.)
- Your platform (Web, Mobile, Desktop, API)
- Your architecture (Monolith, Microservices, Serverless)
- Your features (skip what doesn't apply)

---

**Total: 21 phases, 450+ checks, universally applicable.**

---

# Audit Type Comparison

| Audit Type | What It Catches | What It Misses |
|------------|-----------------|----------------|
| **Static (Phases 1-20)** | Missing code, wrong patterns, security holes, a11y issues | Runtime behavior, state sync, actual user experience |
| **Runtime (Phase 21)** | State sync bugs, cache issues, UX problems, race conditions | Nothing - sees what users see |

**Both are required for a complete audit.**
