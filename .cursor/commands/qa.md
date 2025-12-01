# Universal Quality Audit Framework

A comprehensive 10-phase audit to ensure any codebase meets the highest professional standards. Every detail considered. Nothing overlooked.

## Usage

Run `/qa full` for complete audit, or `/qa [phase]` for specific areas.

## Commands

| Command | Phase |
|---------|-------|
| `/qa full` | Complete 10-phase audit |
| `/qa perf` | Performance |
| `/qa ux` | User Experience |
| `/qa security` | Security Hardening |
| `/qa a11y` | Accessibility |
| `/qa arch` | Architecture |
| `/qa dx` | Developer Experience |
| `/qa seo` | SEO & Discoverability |
| `/qa resilience` | Error Handling & Recovery |
| `/qa data` | Data Integrity |
| `/qa ops` | Operations & Deployment |

---

## The 10 Phases

### 1. PERF - Performance Excellence

- Bundle size analysis (identify bloat)
- Code splitting & lazy loading
- Image optimization (formats, sizes, lazy load)
- Font optimization (preload, subset, swap)
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- API response times (< 200ms target)
- Database query optimization (N+1, indexes)
- Caching strategy (Redis, CDN, browser, ISR)
- Memory leak detection
- Animation performance (60fps, GPU acceleration)
- Network waterfall optimization
- Prefetching & preconnecting
- Service worker / offline support
- Tree shaking verification
- Dead code elimination

### 2. UX - User Experience

- Loading states (skeletons, spinners, progress)
- Empty states (helpful, actionable)
- Error states (clear, recoverable)
- Optimistic updates (instant feedback)
- Form validation (inline, real-time)
- Confirmation dialogs (destructive actions)
- Undo/redo support
- Keyboard shortcuts
- Touch targets (min 44x44px)
- Scroll behavior (smooth, restore position)
- Infinite scroll / pagination
- Search experience (debounce, suggestions)
- Navigation consistency
- Breadcrumbs where needed
- Toast/notification system
- Dark/light mode support
- Responsive breakpoints
- Mobile-first interactions
- Gesture support (swipe, pinch)
- Offline graceful degradation

### 3. SECURITY - Security Hardening

- Authentication (secure sessions, token refresh)
- Authorization (server-side checks on ALL endpoints)
- Input sanitization (XSS prevention)
- SQL injection prevention (parameterized queries)
- CSRF protection
- Rate limiting (per user, per IP, per endpoint)
- Security headers (CSP, X-Frame-Options, etc.)
- HTTPS enforcement
- Sensitive data encryption
- Password hashing (bcrypt, argon2)
- Session invalidation (logout everywhere)
- API key / secret management
- File upload validation
- Dependency vulnerability scan
- Error message sanitization (no stack traces)
- Audit logging
- Brute force protection
- Account lockout policies
- 2FA / MFA support
- CORS configuration

### 4. A11Y - Accessibility (WCAG 2.1 AA)

- Semantic HTML (proper heading hierarchy)
- ARIA labels on interactive elements
- Alt text on all images
- Color contrast (4.5:1 minimum)
- Focus indicators (visible, consistent)
- Keyboard navigation (tab order, focus trap)
- Screen reader testing
- Skip navigation links
- Form labels and associations
- Error announcements
- Live regions for dynamic content
- Reduced motion support
- Text resizing (up to 200%)
- No keyboard traps
- Captions/transcripts for media
- Link purpose clarity
- Touch target sizes
- Reading order
- Language attributes
- No flashing content (< 3Hz)

### 5. ARCH - Architecture & Code Quality

- Consistent file/folder structure
- DRY principle (no duplicate code)
- Single responsibility principle
- Type safety (no 'any' types)
- Consistent naming conventions
- Proper abstraction layers
- Dependency injection where appropriate
- Immutable data patterns
- Pure functions preference
- Component composition
- Proper error boundaries
- State management patterns
- API layer abstraction
- Configuration centralization
- Environment separation
- Feature flags support
- Modular, testable code
- Clear import structure
- No circular dependencies
- Proper TypeScript strict mode

### 6. DX - Developer Experience

- README with setup instructions
- Contributing guidelines
- Code formatting (Prettier/ESLint)
- Git hooks (pre-commit, pre-push)
- Type definitions complete
- JSDoc / comments on complex logic
- Consistent error handling patterns
- Debug tooling
- Hot reload working
- Fast build times
- Clear environment setup (.env.example)
- Database seeding scripts
- Migration scripts
- Test coverage
- CI/CD pipeline
- Storybook / component docs
- API documentation
- Changelog maintenance
- Version management
- Monorepo structure (if applicable)

### 7. SEO - Search Engine Optimization

- Meta titles (unique, < 60 chars)
- Meta descriptions (unique, < 160 chars)
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Structured data (JSON-LD)
- Sitemap.xml
- Robots.txt
- Clean URL structure
- Internal linking
- Image alt text
- Page load speed
- Mobile-friendly
- HTTPS
- No broken links
- Heading hierarchy
- Content-to-code ratio
- Core Web Vitals
- Crawlable JavaScript
- 404 handling

### 8. RESILIENCE - Error Handling & Recovery

- Global error boundary
- Per-component error boundaries
- API error handling (all endpoints)
- Network failure handling
- Timeout handling
- Retry logic with backoff
- Graceful degradation
- Fallback UI components
- Offline detection
- Stale data handling
- Race condition prevention
- Concurrent request handling
- Memory pressure handling
- Storage quota handling
- Third-party failure isolation
- Circuit breaker pattern
- Health checks
- Monitoring & alerting (Sentry, etc.)
- Error logging (structured)
- User-friendly error messages

### 9. DATA - Data Integrity & Consistency

- Database schema validation
- Foreign key constraints
- Unique constraints where needed
- Proper indexes
- Data migration strategy
- Backup strategy
- Soft delete vs hard delete
- Audit trails
- Optimistic locking
- Transaction handling
- Cache invalidation
- Real-time sync consistency
- Pagination consistency
- Sort stability
- Search accuracy
- Data validation (server-side)
- Data sanitization
- Timezone handling
- Date formatting consistency
- Numeric precision

### 10. OPS - Operations & Deployment

- Zero-downtime deployment
- Rollback capability
- Environment parity (dev/staging/prod)
- Secret management
- Log aggregation
- Performance monitoring
- Uptime monitoring
- Auto-scaling configuration
- Database connection pooling
- CDN configuration
- SSL/TLS certificates
- Domain/DNS configuration
- Backup verification
- Disaster recovery plan
- Incident response process
- On-call rotation
- SLA definitions
- Cost monitoring
- Resource limits
- Rate limit monitoring

---

## Priority Levels

| Level | Meaning | Action |
|-------|---------|--------|
| P0 | Critical - Site broken, security vulnerability | Fix immediately |
| P1 | High - Major feature broken, bad UX | Fix within session |
| P2 | Medium - Minor issues, improvements | Fix before deploy |
| P3 | Low - Nice to have, polish | Add to backlog |

---

## Workflow

When you run a /qa command:

1. **SCAN** - Search codebase for issues in that phase
2. **REPORT** - Create prioritized issue list (P0 → P3)
3. **FIX** - Address issues, most critical first
4. **VERIFY** - Build & test after fixes
5. **DEPLOY** - Commit & push when ready

---

## Benchmark Standards

Audits compare against:

- **X.com** - Real-time, scale, performance
- **GitHub** - Developer experience, reliability
- **Linear** - Design polish, animations
- **Stripe** - Security, documentation
- **Vercel** - Speed, developer experience

---

## Examples

```
/qa full        → Run complete 10-phase audit
/qa perf        → Just performance audit
/qa security    → Just security audit
/qa a11y        → Just accessibility audit
```

