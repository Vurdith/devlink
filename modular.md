# Universal Modularization & Consistency Framework

> **Command**: `/modular` or `/modular [phase]`
> **Purpose**: Ensure consistent, reusable, and maintainable component architecture across any codebase.
> **Applies to**: React, Vue, Angular, Svelte, vanilla JS, mobile apps, or any component-based architecture.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/modular full` | Complete 8-phase modularization audit |
| `/modular components` | Phase 1: Component inventory & consolidation |
| `/modular tokens` | Phase 2: Design tokens & variables |
| `/modular patterns` | Phase 3: Common UI patterns |
| `/modular forms` | Phase 4: Form components & validation |
| `/modular layout` | Phase 5: Layout & spacing system |
| `/modular icons` | Phase 6: Icon system |
| `/modular motion` | Phase 7: Animation & transitions |
| `/modular docs` | Phase 8: Component documentation |

---

## Phase 1: Component Inventory & Consolidation

### 1.1 Identify Duplicate Components

**Goal**: Find all instances where similar functionality is implemented differently.

```
Search for these common duplications:
□ Buttons - How many different button implementations exist?
□ Modals/Dialogs - Are there multiple modal systems?
□ Cards/Containers - Inconsistent card styling?
□ Inputs/Form fields - Different input implementations?
□ Loading states - Multiple spinner/skeleton approaches?
□ Avatars - Inconsistent user image handling?
□ Badges/Tags - Various label implementations?
□ Tooltips - Different tooltip systems?
□ Dropdowns/Menus - Multiple dropdown patterns?
□ Tabs - Inconsistent tab implementations?
```

### 1.2 Consolidation Process

For each duplicate pattern found:
```
1. INVENTORY: List all implementations with file paths
2. EVALUATE: Score each by:
   - Code quality (types, error handling)
   - Accessibility (ARIA, keyboard nav)
   - Flexibility (props/options)
   - Performance (renders, bundle size)
3. SELECT: Choose best implementation as base
4. EXTEND: Add missing features from other implementations
5. INTERFACE: Create unified props/API
6. REPLACE: Update all usages to new component
7. REMOVE: Delete deprecated implementations
8. VERIFY: Test all affected pages/views
```

### 1.3 Recommended Component Hierarchy

```
components/
├── primitives/          # Atomic UI elements
│   ├── Button
│   ├── Input
│   ├── Textarea
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Toggle
│   └── Link
├── feedback/            # User feedback components
│   ├── Modal
│   ├── Toast/Notification
│   ├── Alert
│   ├── Tooltip
│   ├── Popover
│   ├── Skeleton
│   ├── Spinner
│   └── Progress
├── display/             # Data display components
│   ├── Card
│   ├── Badge
│   ├── Avatar
│   ├── Tag
│   ├── List
│   ├── Table
│   └── EmptyState
├── navigation/          # Navigation components
│   ├── Navbar
│   ├── Sidebar
│   ├── Tabs
│   ├── Breadcrumb
│   ├── Pagination
│   └── Menu/Dropdown
├── forms/               # Form-specific components
│   ├── FormField
│   ├── FormGroup
│   ├── FormError
│   └── FormActions
├── layout/              # Layout components
│   ├── Container
│   ├── Stack
│   ├── Grid
│   ├── Flex
│   ├── Divider
│   └── Spacer
└── composite/           # Complex compositions
    └── [Domain-specific components]
```

### 1.4 Component Requirements Checklist

Every shared component MUST have:
```
□ Clear, typed interface/props definition
□ Default values for optional props
□ Style override mechanism (className, style, etc.)
□ Consistent naming convention (PascalCase components)
□ Accessibility attributes (ARIA labels, roles)
□ Keyboard navigation support (where applicable)
□ Focus management (where applicable)
□ Error/edge case handling
□ Loading state support (where applicable)
□ Disabled state support (where applicable)
```

---

## Phase 2: Design Tokens & Variables

### 2.1 Color System Audit

**Check that your project has centralized color definitions:**

```
Required color categories:
□ Brand/Accent colors (primary actions)
□ Semantic colors (success, warning, error, info)
□ Neutral scale (backgrounds, text, borders)
□ Interactive states (hover, focus, active, disabled)
```

**Implementation patterns by framework:**
```css
/* CSS Custom Properties (Universal) */
:root {
  --color-primary: #...;
  --color-primary-hover: #...;
  --color-success: #...;
  --color-warning: #...;
  --color-error: #...;
  --color-background: #...;
  --color-foreground: #...;
  --color-muted: #...;
  --color-border: #...;
}

/* Tailwind/UnoCSS */
// tailwind.config.js theme.extend.colors

/* CSS-in-JS (styled-components, emotion) */
// theme.ts with ThemeProvider

/* Sass/Less */
// _variables.scss with $color-primary

/* CSS Modules */
// variables.module.css with @value
```

### 2.2 Color Usage Rules

| Use Case | Token Name | Notes |
|----------|-----------|-------|
| Primary buttons, links | `primary` | Brand color |
| Destructive actions | `error` / `danger` | Red variant |
| Success states | `success` | Green variant |
| Warning states | `warning` | Amber/yellow variant |
| Body text | `foreground` | High contrast |
| Secondary text | `muted` | Reduced contrast |
| Backgrounds | `background` | Base layer |
| Card backgrounds | `background-secondary` | Elevated layer |
| Borders | `border` | Subtle dividers |
| Focus rings | `primary` or `focus` | Accessibility |

### 2.3 Spacing System

**Establish a consistent spacing scale:**

```
Standard scale (8px base):
- 2xs: 0.25rem (4px)   → Tight spacing
- xs:  0.5rem (8px)    → Icon gaps
- sm:  0.75rem (12px)  → Button padding
- md:  1rem (16px)     → Standard gaps
- lg:  1.5rem (24px)   → Section spacing
- xl:  2rem (32px)     → Large gaps
- 2xl: 3rem (48px)     → Section margins
- 3xl: 4rem (64px)     → Page sections
```

**Usage guidelines:**
```
Between related items: xs-sm (8-12px)
Between groups: md-lg (16-24px)
Between sections: xl-2xl (32-48px)
Page margins: lg-xl (24-32px)
Card padding: md-lg (16-24px)
Button padding: xs-sm horizontal, 2xs-xs vertical
```

### 2.4 Typography Scale

```
Size scale:
- xs:   0.75rem (12px)  → Labels, captions
- sm:   0.875rem (14px) → Secondary text
- base: 1rem (16px)     → Body text
- lg:   1.125rem (18px) → Lead text
- xl:   1.25rem (20px)  → Subheadings
- 2xl:  1.5rem (24px)   → Section titles
- 3xl:  1.875rem (30px) → Page titles
- 4xl:  2.25rem (36px)  → Hero text

Weight scale:
- normal:   400 → Body text
- medium:   500 → Emphasis, labels
- semibold: 600 → Subheadings
- bold:     700 → Headings

Line height:
- tight:  1.25 → Headings
- normal: 1.5  → Body text
- relaxed: 1.75 → Long-form content
```

### 2.5 Border Radius Scale

```
- none: 0       → Sharp corners
- sm:   0.25rem → Subtle rounding
- md:   0.5rem  → Buttons, inputs
- lg:   0.75rem → Cards
- xl:   1rem    → Modals, large cards
- 2xl:  1.5rem  → Prominent elements
- full: 9999px  → Pills, avatars
```

### 2.6 Shadow Scale

```
- none: none              → Flat elements
- sm:   subtle shadow     → Hover states
- md:   medium shadow     → Cards, dropdowns
- lg:   prominent shadow  → Modals, popovers
- xl:   heavy shadow      → Floating elements
```

---

## Phase 3: Common UI Patterns

### 3.1 Button Patterns

**Required variants:**
```
Visual variants:
□ Primary   → Main actions (filled, brand color)
□ Secondary → Alternative actions (outlined or muted)
□ Ghost     → Tertiary actions (transparent bg)
□ Danger    → Destructive actions (red variant)
□ Link      → Text-only, underlined

Size variants:
□ Small  → Compact UIs, inline actions
□ Medium → Default size (most common)
□ Large  → Hero sections, prominent CTAs

State variants:
□ Default  → Normal state
□ Hover    → Mouse over
□ Focus    → Keyboard focus (visible ring)
□ Active   → Being pressed
□ Disabled → Non-interactive
□ Loading  → Async action in progress
```

**Button composition:**
```
□ Icon + Text (icon left)
□ Text + Icon (icon right)
□ Icon only (with aria-label)
□ Full width option
□ Button groups
```

### 3.2 Modal/Dialog Patterns

**Required features:**
```
Structure:
□ Backdrop (click to close optional)
□ Container (centered, max-width)
□ Header (title, close button)
□ Body (scrollable content)
□ Footer (action buttons)

Behavior:
□ Focus trap (tab stays within modal)
□ Escape key closes
□ Body scroll lock
□ Return focus on close
□ Animate in/out

Accessibility:
□ role="dialog"
□ aria-modal="true"
□ aria-labelledby (title)
□ aria-describedby (content)

Sizes:
□ Small  → Confirmations
□ Medium → Forms
□ Large  → Complex content
□ Full   → Full-screen on mobile
```

### 3.3 Card Patterns

**Standard card anatomy:**
```
□ Container (background, border, shadow, radius)
□ Header (optional - title, actions)
□ Media (optional - image, video)
□ Body (main content)
□ Footer (optional - actions, metadata)

Interactive cards:
□ Hover state (border, shadow change)
□ Focus state (visible ring)
□ Click handler (if clickable)
□ Cursor change (pointer if clickable)
```

### 3.4 Form Field Patterns

**Standard form field anatomy:**
```
□ Label (above or beside input)
□ Input element
□ Helper text (optional, below input)
□ Error message (replaces or adds to helper)
□ Required indicator

States:
□ Default
□ Focus (ring, border change)
□ Error (red border, error message)
□ Disabled (reduced opacity)
□ Read-only (no focus ring)
```

### 3.5 Empty State Pattern

**Required elements:**
```
□ Icon or illustration (optional)
□ Title (what's empty)
□ Description (why and what to do)
□ Action button (create, add, etc.)
```

### 3.6 Loading State Patterns

```
Inline loading:
□ Spinner/loader icon
□ Text change ("Loading...", "Saving...")

Skeleton loading:
□ Placeholder shapes matching content
□ Subtle animation (pulse, shimmer)

Full-page loading:
□ Centered spinner
□ Optional message
□ Backdrop (optional)

Button loading:
□ Replace text with spinner
□ Disable button
□ Maintain button width
```

---

## Phase 4: Form Components & Validation

### 4.1 Form Component Checklist

```
Accessibility:
□ All inputs have associated <label> elements
□ Labels use htmlFor/for pointing to input id
□ Error messages linked via aria-describedby
□ Required fields marked with aria-required
□ Invalid fields marked with aria-invalid
□ Form groups use fieldset/legend where appropriate

Visual states:
□ Focus state is clearly visible
□ Error state uses error color + icon
□ Disabled state reduces opacity
□ Required indicator visible (*, "required")

Interaction:
□ Tab order is logical
□ Enter submits form (where appropriate)
□ Escape clears focus (where appropriate)
□ Autofocus on first field (where appropriate)
```

### 4.2 Validation Patterns

**Client-side validation:**
```
Real-time validation:
□ Validate on blur (not on every keystroke)
□ Clear error when user starts fixing
□ Show success state when fixed

Submit validation:
□ Validate all fields before submit
□ Focus first invalid field
□ Scroll to first error if needed
□ Disable submit while processing

Common validators:
□ Required
□ Email format
□ Min/max length
□ Pattern (regex)
□ Match (password confirmation)
□ Custom async (username availability)
```

**Error message guidelines:**
```
DO:
✓ Be specific ("Email is required" not "Field required")
✓ Be helpful ("Use 8+ characters" not "Invalid")
✓ Use friendly language
✓ Position consistently (below field)

DON'T:
✗ Blame the user
✗ Use technical jargon
✗ Show all errors at once (overwhelming)
✗ Use only color to indicate errors
```

### 4.3 Form Layout Patterns

```
Single column:
□ Full-width fields
□ Labels above inputs
□ Consistent vertical spacing

Two column:
□ Related fields side by side
□ Responsive (stack on mobile)
□ Logical grouping

Inline:
□ Label and input on same line
□ For short forms, filters
□ Adequate label width
```

---

## Phase 5: Layout & Spacing System

### 5.1 Container Widths

```
Standard content widths:
- xs:  320px  → Mobile minimum
- sm:  480px  → Small modals
- md:  640px  → Medium modals, narrow content
- lg:  768px  → Default content width
- xl:  1024px → Wide content
- 2xl: 1280px → Full-width content
- max: 1536px → Maximum page width
```

### 5.2 Page Layout Patterns

**Standard app layout:**
```
□ Fixed header (top navigation)
□ Optional fixed sidebar (left)
□ Scrollable main content
□ Optional fixed footer (mobile nav)

Responsive behavior:
□ Sidebar collapses on tablet
□ Sidebar becomes drawer on mobile
□ Footer nav appears on mobile
```

**Content page layout:**
```
□ Centered container with max-width
□ Consistent horizontal padding
□ Responsive padding (less on mobile)
```

### 5.3 Grid System

```
Standard grid:
□ 12-column grid
□ Responsive column spans
□ Consistent gutters

Common patterns:
□ 1 column (mobile)
□ 2 columns (tablet)
□ 3-4 columns (desktop)
□ Sidebar + main (desktop)
```

### 5.4 Spacing Consistency Rules

```
Apply spacing consistently:

Between page sections:    3xl-4xl (48-64px)
Between content blocks:   xl-2xl (32-48px)
Between related items:    md-lg (16-24px)
Between tight items:      sm (12px)
Within components:        md (16px)
Icon-to-text gap:         xs-sm (8-12px)
```

### 5.5 Responsive Breakpoints

```
Mobile-first breakpoints:
- base:  0      → Mobile phones
- sm:    640px  → Large phones
- md:    768px  → Tablets
- lg:    1024px → Small laptops
- xl:    1280px → Desktops
- 2xl:   1536px → Large screens

Usage pattern:
Start with mobile layout, add complexity at larger sizes
```

---

## Phase 6: Icon System

### 6.1 Icon Size Standards

```
Size scale:
- xs:  12px → Inline with small text
- sm:  16px → Inline with body text
- md:  20px → Buttons, form elements
- lg:  24px → Navigation, standalone
- xl:  32px → Empty states, features
- 2xl: 48px → Hero sections
```

### 6.2 Icon Consistency

```
Style consistency:
□ Single icon set (don't mix sets)
□ Consistent stroke width
□ Consistent visual weight
□ Consistent style (outlined vs filled)

Color consistency:
□ Icons inherit text color by default
□ Use currentColor for flexibility
□ Semantic colors where needed (success, error)
```

### 6.3 Icon Accessibility

```
□ Decorative icons: aria-hidden="true"
□ Meaningful icons: aria-label or sr-only text
□ Icon-only buttons: aria-label required
□ Icons in links: ensure link text is clear
```

### 6.4 Icon Categories

```
Essential icons to standardize:
Navigation:   home, menu, back, forward, close
Actions:      add, edit, delete, save, share, copy, download
Status:       success/check, error/x, warning, info, loading
User:         user, users, settings, logout
Media:        image, video, file, attachment, link
Social:       like, comment, share, bookmark
Arrows:       up, down, left, right, expand, collapse
Misc:         search, filter, sort, more/dots
```

---

## Phase 7: Animation & Transitions

### 7.1 Duration Scale

```
- instant:  0ms     → No transition
- fast:     100ms   → Micro-interactions
- normal:   200ms   → Standard transitions
- slow:     300ms   → Complex animations
- slower:   500ms   → Page transitions
```

### 7.2 Easing Functions

```
- ease-out:    Fast start, slow end → Enter animations
- ease-in:     Slow start, fast end → Exit animations
- ease-in-out: Slow start and end   → Morphing, repositioning
- linear:      Constant speed       → Spinners, progress bars
```

### 7.3 Common Animations

```
Entrances:
□ Fade in (opacity 0→1)
□ Scale in (scale 0.95→1 + fade)
□ Slide in (translate + fade)

Exits:
□ Fade out (opacity 1→0)
□ Scale out (scale 1→0.95 + fade)
□ Slide out (translate + fade)

Feedback:
□ Pulse (attention)
□ Shake (error)
□ Bounce (success)
□ Spin (loading)
```

### 7.4 Transition Guidelines

```
What to animate:
✓ Opacity
✓ Transform (scale, translate, rotate)
✓ Background color
✓ Border color
✓ Box shadow

What NOT to animate:
✗ Width/height (use transform: scale)
✗ Top/left/right/bottom (use transform: translate)
✗ Margin/padding
✗ Any property causing layout shifts
```

### 7.5 Reduced Motion

```
Always respect user preferences:
□ Check prefers-reduced-motion
□ Disable or reduce animations
□ Replace with instant transitions
□ Keep essential motion (like spinners)
```

---

## Phase 8: Component Documentation

### 8.1 Documentation Requirements

Each shared component SHOULD have:
```
□ Description of purpose
□ Props/API documentation
□ Usage examples
□ Accessibility notes
□ Do's and don'ts
□ Related components
```

### 8.2 Props Documentation Format

```
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| disabled | boolean | false | Disable interaction |
| loading | boolean | false | Show loading state |
| onClick | () => void | - | Click handler |
```

### 8.3 Usage Examples

```
Provide examples for:
□ Basic usage
□ All variants
□ All sizes
□ With icons
□ Loading state
□ Disabled state
□ Common combinations
□ Edge cases
```

### 8.4 Component Changelog

```
Track changes to shared components:
□ Version number
□ Date of change
□ Breaking changes highlighted
□ Migration guide if needed
```

---

## Execution Checklist

### Pre-Audit
```
□ Identify framework/tech stack
□ List all component directories
□ Count total components
□ Find style system (CSS, Sass, CSS-in-JS, etc.)
□ Find existing design tokens/variables
```

### During Audit
```
□ Work through phases 1-8 systematically
□ Document all inconsistencies found
□ Prioritize by impact (P0-P3)
□ Create unified components as needed
□ Test after each consolidation
```

### Post-Audit
```
□ Verify all duplicates removed
□ Ensure design tokens centralized
□ Confirm consistent patterns applied
□ Update/create documentation
□ Run full build and tests
□ Visual regression check
```

---

## Priority Levels

| Priority | Description | Action |
|----------|-------------|--------|
| **P0** | Broken functionality, accessibility violation | Fix immediately |
| **P1** | Major inconsistency affecting UX | Fix within 1 week |
| **P2** | Minor inconsistency, tech debt | Fix when touching file |
| **P3** | Nice to have, optimization | Backlog |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Component reuse | >80% of UI uses shared components | Audit imports |
| Token usage | 100% colors from tokens | Search for hardcoded colors |
| Type coverage | 100% components typed | Check for any types |
| Accessibility | 0 violations | Automated testing |
| Duplicate patterns | 0 duplicates | Manual audit |
| Documentation | 100% shared components documented | Check docs exist |

---

## Common Anti-Patterns to Avoid

```
❌ Copying component code instead of importing
❌ Hardcoding colors/spacing instead of using tokens
❌ Creating new components for slight variations
❌ Inconsistent naming (Button vs Btn vs ButtonComponent)
❌ Props explosion (too many boolean props)
❌ Breaking changes without versioning
❌ Style overrides in parent components
❌ Missing accessibility attributes
❌ Inline styles for common patterns
❌ Framework-specific code in shared components
```

---

## Framework-Specific Notes

### React
- Use forwardRef for ref forwarding
- Use React.memo for performance
- Provide displayName for debugging

### Vue
- Use defineProps with types
- Use slots for composition
- Use v-bind="$attrs" for passthrough

### Angular
- Use @Input() decorators
- Use content projection (ng-content)
- Use HostBinding for styling

### Svelte
- Use export let for props
- Use slots for composition
- Use $$restProps for passthrough

### Web Components
- Use Shadow DOM for encapsulation
- Use slots for composition
- Use CSS custom properties for theming
