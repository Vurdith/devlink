# DevLink: Everything Explained for Beginners

A complete guide explaining every piece of technology behind DevLink, written for someone who has never coded before.

---

## 📚 Table of Contents

1. [What Even Is a Website?](#-what-even-is-a-website)
2. [The Building Blocks of Code](#-the-building-blocks-of-code)
3. [DevLink's Tech Stack](#-devlinks-tech-stack)
4. [The Database: Your App's Memory](#-the-database-your-apps-memory)
5. [Authentication: Who Are You?](#-authentication-who-are-you)
6. [Caching: Speed Through Remembering](#-caching-speed-through-remembering)
7. [Rate Limiting: Traffic Control](#-rate-limiting-traffic-control)
8. [File Storage: Where Pictures Live](#-file-storage-where-pictures-live)
9. [Hosting: Where Your Website Lives](#-hosting-where-your-website-lives)
10. [Domains & DNS: Your Website's Address](#-domains--dns-your-websites-address)
11. [CDN: Speed Everywhere](#-cdn-speed-everywhere)
12. [APIs: How Things Talk to Each Other](#-apis-how-things-talk-to-each-other)
13. [Environment Variables: Secret Settings](#-environment-variables-secret-settings)
14. [How It All Fits Together](#-how-it-all-fits-together)
15. [The Services We Use](#-the-services-we-use)
16. [Glossary: Every Term Explained](#-glossary-every-term-explained)

---

## 🌐 What Even Is a Website?

### The Simple Explanation

When you type "google.com" in your browser and press Enter, here's what actually happens:

1. **Your browser asks:** "Hey internet, where is google.com?"
2. **The internet responds:** "It's at this address: 142.250.80.46" (an IP address)
3. **Your browser connects** to that address and asks for the webpage
4. **Google's computer sends back** a bunch of files (HTML, CSS, JavaScript)
5. **Your browser reads** those files and draws the webpage on your screen

That's it. A website is just files on someone else's computer that your browser downloads and displays.

### The Two Types of Websites

**Static Websites** (Simple)
- Like a digital brochure
- Same content for everyone
- Example: A restaurant menu page
- Just files sitting on a computer

**Dynamic Websites/Web Apps** (Complex - This is DevLink!)
- Content changes based on who you are
- You can interact with it (post, like, comment)
- Different users see different things
- Needs a database, server logic, user accounts
- Example: Twitter, Facebook, Instagram, DevLink

DevLink is a **web application** - it's not just showing you files, it's:
- Remembering who you are (authentication)
- Storing your posts (database)
- Showing you different content than other users (personalization)
- Processing your actions in real-time (server logic)

---

## 🧱 The Building Blocks of Code

### What Is Code?

Code is instructions written in a language computers understand. Just like you might write a recipe for a cake, programmers write "recipes" for computers.

**Example - A recipe for humans:**
```
1. Get a bowl
2. Add 2 cups of flour
3. Add 1 cup of sugar
4. Mix together
```

**Example - Code for computers (JavaScript):**
```javascript
let bowl = [];
bowl.add(flour, 2);
bowl.add(sugar, 1);
bowl.mix();
```

### Programming Languages

Just like humans have English, Spanish, French - computers have different programming languages:

| Language | Used For | Analogy |
|----------|----------|---------|
| **JavaScript** | Websites, interactivity | The "action" language of the web |
| **TypeScript** | JavaScript but safer | JavaScript with spell-check |
| **HTML** | Structure of webpages | The skeleton/bones |
| **CSS** | Styling webpages | The clothes and makeup |
| **Python** | AI, data, backends | Swiss army knife |
| **SQL** | Talking to databases | Language for organizing data |

### What DevLink Uses

DevLink is written in **TypeScript** (a safer version of JavaScript) and uses:
- **HTML** for structure (what elements exist)
- **CSS** (via Tailwind) for styling (how it looks)
- **React** for building the interface (how it behaves)

---

## 🛠 DevLink's Tech Stack

A "tech stack" is just the list of technologies used to build an app. Think of it like the ingredients list for a recipe.

### DevLink's Ingredients

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVLINK TECH STACK                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (What you see)                                        │
│  ├── React ────────── Building blocks for the interface        │
│  ├── Next.js ──────── The framework that runs everything       │
│  ├── TypeScript ───── The programming language                 │
│  └── Tailwind CSS ─── Makes everything look pretty             │
│                                                                 │
│  BACKEND (Behind the scenes)                                    │
│  ├── Next.js API ──── Handles your requests                    │
│  ├── Prisma ───────── Talks to the database                    │
│  └── NextAuth ─────── Handles login/logout                     │
│                                                                 │
│  DATA STORAGE                                                   │
│  ├── PostgreSQL ───── The database (via Supabase)              │
│  ├── Redis ────────── Fast temporary storage (via Upstash)     │
│  └── R2 ───────────── File storage (via Cloudflare)            │
│                                                                 │
│  INFRASTRUCTURE                                                 │
│  ├── Vercel ───────── Hosts the website                        │
│  ├── Cloudflare ───── Security + speed                         │
│  └── Google OAuth ─── "Sign in with Google"                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Let's Break Each One Down

#### React
**What it is:** A tool made by Facebook for building user interfaces.

**Analogy:** Imagine building with LEGO blocks. Instead of writing the same code over and over, you create "components" (like LEGO pieces) and snap them together.

**Example:** The "Post" you see in DevLink is a component. Every post uses the same component, just with different data (different text, different author).

```
┌─────────────────────────┐
│  POST COMPONENT         │
│  ┌───────────────────┐  │
│  │ Profile Picture   │  │
│  │ Username          │  │
│  │ Post Content      │  │
│  │ Like/Repost/Reply │  │
│  └───────────────────┘  │
└─────────────────────────┘
       ↓ Same component, different data
┌─────────────────────────┐  ┌─────────────────────────┐
│  John's Post            │  │  Sarah's Post           │
│  "Hello world!"         │  │  "I love coding!"       │
│  ❤️ 5  🔄 2  💬 1       │  │  ❤️ 12  🔄 8  💬 3      │
└─────────────────────────┘  └─────────────────────────┘
```

#### Next.js
**What it is:** A "framework" built on top of React. It's like React with superpowers.

**Analogy:** If React is a car engine, Next.js is the entire car - it gives you the steering wheel, seats, wheels, and everything else you need to actually drive.

**What it does for DevLink:**
- Handles routing (when you go to `/profile`, it shows your profile)
- Server-side rendering (makes pages load faster)
- API routes (handles backend logic)
- Image optimization (makes images load faster)
- And much more...

#### TypeScript
**What it is:** JavaScript with "types" - extra rules that catch mistakes before they happen.

**Analogy:** Imagine if spell-check also checked your grammar and warned you when sentences didn't make sense. That's TypeScript for JavaScript.

**Example:**
```javascript
// JavaScript (no safety)
function addNumbers(a, b) {
  return a + b;
}
addNumbers("hello", "world"); // Returns "helloworld" - oops!

// TypeScript (safe)
function addNumbers(a: number, b: number): number {
  return a + b;
}
addNumbers("hello", "world"); // ERROR! TypeScript stops you
```

#### Tailwind CSS
**What it is:** A way to style your website using pre-made "utility classes."

**Traditional CSS:**
```css
.button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}
```

**Tailwind CSS:**
```html
<button class="bg-blue-500 text-white px-5 py-2 rounded">
  Click me
</button>
```

**Analogy:** Instead of creating custom outfits from scratch, Tailwind gives you a wardrobe of pre-made pieces you can mix and match.

#### Prisma
**What it is:** A tool that lets you talk to your database using JavaScript/TypeScript instead of SQL.

**Without Prisma (raw SQL):**
```sql
SELECT * FROM users WHERE email = 'john@example.com';
```

**With Prisma (TypeScript):**
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});
```

**Analogy:** Prisma is like a translator. You speak TypeScript, the database speaks SQL, and Prisma translates between you.

---

## 🗄 The Database: Your App's Memory

### What Is a Database?

A database is where your app stores all its data permanently. Without a database, every time you refresh the page, everything would disappear.

**Think of it like this:**
- Your brain's short-term memory = Variables in code (temporary)
- Your brain's long-term memory = Database (permanent)

### What DevLink Stores in Its Database

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVLINK DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USERS TABLE                                                    │
│  ┌────────┬──────────────┬─────────────────┬──────────────┐    │
│  │ id     │ username     │ email           │ avatar       │    │
│  ├────────┼──────────────┼─────────────────┼──────────────┤    │
│  │ 1      │ johndoe      │ john@email.com  │ /avatar1.jpg │    │
│  │ 2      │ sarahcodes   │ sarah@email.com │ /avatar2.jpg │    │
│  └────────┴──────────────┴─────────────────┴──────────────┘    │
│                                                                 │
│  POSTS TABLE                                                    │
│  ┌────────┬──────────┬──────────────────────┬─────────────┐    │
│  │ id     │ authorId │ content              │ createdAt   │    │
│  ├────────┼──────────┼──────────────────────┼─────────────┤    │
│  │ 101    │ 1        │ "Hello world!"       │ 2024-01-15  │    │
│  │ 102    │ 2        │ "I love DevLink!"    │ 2024-01-16  │    │
│  └────────┴──────────┴──────────────────────┴─────────────┘    │
│                                                                 │
│  LIKES TABLE                                                    │
│  ┌────────┬──────────┬──────────┐                              │
│  │ id     │ userId   │ postId   │                              │
│  ├────────┼──────────┼──────────┤                              │
│  │ 1001   │ 2        │ 101      │  (Sarah liked John's post)   │
│  │ 1002   │ 1        │ 102      │  (John liked Sarah's post)   │
│  └────────┴──────────┴──────────┘                              │
│                                                                 │
│  + followers, reposts, comments, notifications, etc.            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Types of Databases

**Relational Databases (SQL)** - What DevLink uses
- Data stored in tables (like Excel spreadsheets)
- Tables are linked together (hence "relational")
- Examples: PostgreSQL, MySQL, SQLite
- Good for: Structured data with relationships

**NoSQL Databases**
- Data stored more flexibly (documents, key-value pairs)
- Examples: MongoDB, Firebase
- Good for: Unstructured or rapidly changing data

### PostgreSQL

**What it is:** A powerful, open-source relational database. It's been around since 1996 and powers millions of applications.

**Analogy:** If databases were cars, PostgreSQL would be a Toyota - reliable, proven, handles anything you throw at it.

**Why DevLink uses it:**
- Rock-solid reliability
- Handles complex queries efficiently
- Great for social networks with lots of relationships (users → posts → likes → comments)

### Supabase

**What it is:** A company that hosts PostgreSQL databases for you and adds extra features.

**Analogy:** You could build your own house (set up your own database server), or you could move into an apartment that handles maintenance for you (Supabase).

**What Supabase provides:**
- A PostgreSQL database in the cloud
- Automatic backups
- Connection pooling (explained below)
- A nice dashboard to see your data
- Real-time features

### Connection Pooling (Why Port 6543 Matters)

**The Problem:**
Every time someone visits DevLink, the app needs to connect to the database. Connections take time to establish (like making a phone call). If 10,000 people visit at once, that's 10,000 connections - databases can only handle so many!

**The Solution - Connection Pooling:**
Instead of everyone making their own connection, a "pool" of connections is shared.

```
WITHOUT POOLING (Bad)                    WITH POOLING (Good)
                                         
User 1 ─────┐                           User 1 ─────┐
User 2 ─────┼── Database                User 2 ─────┼── Pool ─── Database
User 3 ─────┤   (overwhelmed!)          User 3 ─────┤   (manageable)
User 4 ─────┤                           User 4 ─────┤
  ...       │                             ...       │
User 10000──┘                           User 10000──┘

10,000 connections = 💀                 ~100 shared connections = ✅
```

**Analogy:** 
- Without pooling: Everyone calls the restaurant directly to order (phone lines jam up)
- With pooling: Everyone tells the receptionist their order, and she batches them to the kitchen

**In your .env:**
```
Port 5432 = Direct connection (no pooling) ❌
Port 6543 = Pooled connection (pgbouncer) ✅
```

---

## 🔐 Authentication: Who Are You?

### What Is Authentication?

Authentication is how your app knows who you are. When you log in, you prove your identity.

**Authentication:** "Who are you?" (Login)
**Authorization:** "What are you allowed to do?" (Permissions)

### How Login Works (The Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. You click "Sign in with Google"                             │
│           │                                                     │
│           ▼                                                     │
│  2. Google asks: "Do you want to let DevLink access your        │
│     basic info (name, email, picture)?"                         │
│           │                                                     │
│           ▼                                                     │
│  3. You click "Allow"                                           │
│           │                                                     │
│           ▼                                                     │
│  4. Google tells DevLink: "This is John, here's his email       │
│     and profile picture"                                        │
│           │                                                     │
│           ▼                                                     │
│  5. DevLink creates/finds your account and gives you a          │
│     "session" (proof you're logged in)                          │
│           │                                                     │
│           ▼                                                     │
│  6. Your browser stores a "cookie" with your session            │
│           │                                                     │
│           ▼                                                     │
│  7. Every time you visit a page, your browser sends that        │
│     cookie, and DevLink knows it's you!                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### OAuth (Open Authorization)

**What it is:** A system that lets you log into one site using your account from another site.

**Examples:**
- "Sign in with Google"
- "Sign in with Apple"
- "Sign in with GitHub"

**Why it's great:**
1. You don't need to create yet another password
2. You don't have to trust DevLink with your password
3. Google handles all the security stuff
4. DevLink only gets basic info (not your Gmail, not your Drive)

**Analogy:** It's like using your driver's license to verify your age at a bar. The bar doesn't need to know your address or social security number - just that you're over 21.

### Sessions & Cookies

**Session:** A temporary "pass" that proves you're logged in.

**Cookie:** A small piece of data your browser stores and sends with every request.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOW SESSIONS WORK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. You log in successfully                                     │
│                                                                 │
│  2. Server creates a session:                                   │
│     { id: "abc123", user: "johndoe", expires: "24 hours" }      │
│                                                                 │
│  3. Server sends back a cookie:                                 │
│     "Hey browser, store this: session_id=abc123"                │
│                                                                 │
│  4. Browser saves the cookie                                    │
│                                                                 │
│  5. Every request you make:                                     │
│     Browser: "Here's my cookie: session_id=abc123"              │
│     Server: "Oh, that's johndoe! Here's your personalized feed" │
│                                                                 │
│  6. After 24 hours (or logout):                                 │
│     Session expires → Cookie deleted → You need to log in again │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### JWT (JSON Web Tokens)

**What it is:** A special type of session token that contains user info directly (so the server doesn't need to look it up every time).

**Regular session:** Server has to check database every request
**JWT:** Info is encoded in the token itself

```
JWT Token (decoded):
{
  "userId": "123",
  "username": "johndoe", 
  "email": "john@example.com",
  "expiresAt": "2024-01-20"
}
```

DevLink uses JWTs for speed - we don't have to ask the database "who is this?" on every single page load.

### NextAuth

**What it is:** A library that handles all authentication for Next.js apps.

**What it does:**
- Handles "Sign in with Google/Apple/Twitter"
- Manages sessions and cookies
- Protects routes (so logged-out users can't access `/settings`)
- Handles password reset, email verification, etc.

**Analogy:** Instead of building your own security system from scratch, NextAuth is like hiring a professional security company.

### NEXTAUTH_SECRET

**What it is:** A secret key used to encrypt your session tokens.

**Why it matters:** Without this, anyone could forge a session token and pretend to be you.

```
Good secret: "Ookf0RvQ6Tfnwe0vwELph1nWNSYUo0qvBI9EoVWeH9s="
Bad secret: "devlink-dev-secret" (anyone could guess this!)
```

**Analogy:** It's like the master key to your building. If someone gets it, they can access any apartment.

---

## ⚡ Caching: Speed Through Remembering

### What Is Caching?

Caching is storing data temporarily so you don't have to compute or fetch it again.

**Without caching:**
- User requests feed
- Server asks database for posts
- Database processes query (slow)
- Server sends response
- Repeat 1000x for 1000 users

**With caching:**
- User requests feed
- Server checks cache: "Do I already have this?"
- If yes → Send cached data instantly
- If no → Ask database, store in cache, then send

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING EXAMPLE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WITHOUT CACHE                         WITH CACHE               │
│                                                                 │
│  Request 1:                            Request 1:               │
│  User → Server → Database → 200ms      User → Server → Database │
│                                        → Server saves to cache  │
│  Request 2:                            → 200ms                  │
│  User → Server → Database → 200ms                               │
│                                        Request 2:               │
│  Request 3:                            User → Server → Cache    │
│  User → Server → Database → 200ms      → 5ms ⚡                  │
│                                                                 │
│  Total: 600ms                          Total: 205ms             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Types of Caches

**Browser Cache**
- Stored on your computer
- Saves images, CSS, JavaScript files
- Why: So you don't re-download the DevLink logo every page visit

**Server Cache (Memory)**
- Stored in the server's RAM
- Very fast but limited size
- Disappears when server restarts

**Distributed Cache (Redis)**
- Stored on a dedicated cache server
- Shared across all your app servers
- Persists even if one server restarts

### Why DevLink Needs Redis

**The Problem with Serverless:**
DevLink runs on Vercel, which uses "serverless functions." Each request might run on a different server!

```
WITHOUT REDIS (Each server has its own cache)

Server A cache: { trending: [...] }
Server B cache: { }  ← Empty! Cache miss
Server C cache: { }  ← Empty! Cache miss

User hits Server A → Fast (cache hit)
User hits Server B → Slow (cache miss, has to query DB)
User hits Server C → Slow (cache miss)

Cache hit rate: ~33% 😢
```

```
WITH REDIS (Shared cache)

┌──────────┐
│  REDIS   │ ← All servers share this cache
│  Cache   │
└────┬─────┘
     │
     ├── Server A
     ├── Server B
     └── Server C

Any server can read/write to the same cache.

Cache hit rate: ~90%+ 🎉
```

### Redis

**What it is:** An incredibly fast database that stores data in memory (RAM) instead of on disk.

**How fast?**
- Regular database: ~10-100ms per query
- Redis: ~1ms per query

**Analogy:** 
- Regular database = Filing cabinet (have to open drawer, flip through files)
- Redis = Sticky notes on your monitor (instant access)

**What DevLink caches in Redis:**
- Trending hashtags
- Popular posts
- User profiles (so we don't query DB every time)
- Feed data
- Rate limiting counters

### Upstash

**What it is:** A company that provides Redis as a service, designed for serverless apps.

**Why Upstash (not regular Redis):**
- Regular Redis requires a server that's always running (costs money)
- Upstash uses a "REST API" which works perfectly with serverless
- Pay only for what you use
- Generous free tier

**In your .env:**
```env
UPSTASH_REDIS_REST_URL="https://one-badger-41681.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-secret-token"
```

### Cache Invalidation

**The hardest problem in programming:** When do you delete/update the cache?

**Example:**
1. User posts "Hello world!"
2. Feed is cached showing 10 posts
3. New post isn't in the cache!
4. User refreshes and doesn't see their own post 😱

**Solutions:**
- **Time-based:** Cache expires after 60 seconds
- **Event-based:** When someone posts, delete the feed cache
- **Tag-based:** Associate caches with tags, invalidate by tag

DevLink uses a combination - important data expires quickly, less important data lasts longer.

---

## 🚦 Rate Limiting: Traffic Control

### What Is Rate Limiting?

Rate limiting restricts how many requests a user can make in a time period.

**Why it's necessary:**
1. **Prevent abuse:** Stop bots from spamming
2. **Protect servers:** Don't let one user overwhelm the system
3. **Fair usage:** Everyone gets a fair share of resources
4. **Cost control:** Each request costs money

### How Rate Limiting Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    RATE LIMITING EXAMPLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Rule: Maximum 100 requests per minute per user                 │
│                                                                 │
│  User makes request #1 → ✅ Allowed (1/100)                     │
│  User makes request #2 → ✅ Allowed (2/100)                     │
│  ...                                                            │
│  User makes request #100 → ✅ Allowed (100/100)                 │
│  User makes request #101 → ❌ BLOCKED "Too many requests"       │
│                                                                 │
│  [One minute passes]                                            │
│                                                                 │
│  Counter resets to 0                                            │
│  User makes request #1 → ✅ Allowed (1/100)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Types of Rate Limits in DevLink

| Action | Limit | Why |
|--------|-------|-----|
| API requests | 100/minute | Prevent general abuse |
| Login attempts | 5/minute | Prevent password guessing |
| Post creation | 10/minute | Prevent spam |
| Following | 50/hour | Prevent follow/unfollow spam |
| Likes | 200/hour | Prevent like manipulation |

### How We Track Limits (Using Redis)

```
User "john" likes a post:

1. Check Redis key "ratelimit:likes:john"
2. Current value: 45
3. Is 45 < 200? Yes → Allow the like
4. Increment: "ratelimit:likes:john" = 46
5. Key expires in 1 hour (auto-reset)
```

This is why Redis is important - we need fast access to check limits on every request.

---

## 📁 File Storage: Where Pictures Live

### The Problem with Local Storage

When you run a website on one computer, you can save files directly:

```
/my-website/
├── uploads/
│   ├── avatar1.jpg
│   ├── avatar2.jpg
│   └── post-image1.png
└── ...
```

**But this breaks when:**
1. You have multiple servers (which one has the file?)
2. You use serverless (no persistent file system)
3. Your server restarts (files might be lost)
4. You need to scale (files take up disk space)

### Object Storage: The Solution

Object storage is a service designed specifically for storing files (images, videos, documents).

**Key concepts:**
- **Object:** Any file you upload
- **Bucket:** A container for objects (like a folder)
- **Key:** The "path" to your object (like `avatars/john.jpg`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBJECT STORAGE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Bucket: "devlink"                                              │
│  ├── avatars/                                                   │
│  │   ├── user-123.jpg                                           │
│  │   ├── user-456.jpg                                           │
│  │   └── user-789.jpg                                           │
│  ├── posts/                                                     │
│  │   ├── post-abc-image1.png                                    │
│  │   ├── post-abc-image2.png                                    │
│  │   └── post-def-image1.jpg                                    │
│  └── banners/                                                   │
│      ├── user-123-banner.jpg                                    │
│      └── user-456-banner.jpg                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### S3 (Amazon Simple Storage Service)

**What it is:** The original object storage service, created by Amazon.

**Why "S3"?** It stands for "Simple Storage Service" (three S's).

**Key features:**
- Virtually unlimited storage
- 99.999999999% durability (you won't lose files)
- Pay only for what you use
- Files accessible via URL

**Analogy:** S3 is like a warehouse where you can store unlimited boxes. You pay rent based on how much space you use, and anyone with the right key can access your stuff.

### Cloudflare R2

**What it is:** Cloudflare's version of S3, with one huge advantage: **free egress**.

**Egress = downloading data**
When someone views an image on your site, that's a download (egress).

```
COST COMPARISON (storing 100GB, 1TB of downloads/month)

AWS S3:
- Storage: $2.30/month
- Egress: $90/month ← THIS IS THE KILLER
- Total: ~$92/month

Cloudflare R2:
- Storage: $1.50/month
- Egress: $0/month ← FREE!
- Total: ~$1.50/month

Savings: ~98% 🤯
```

For a social network like DevLink where users view tons of images, R2's free egress is a game-changer.

### S3-Compatible API

R2 uses the same "API" (way of communicating) as S3. This means:
- Code written for S3 works with R2
- You can switch between them easily
- Same tools and libraries work

**That's why our .env has S3_ prefixes even though we use R2:**
```env
S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="xxx"
S3_SECRET_ACCESS_KEY="xxx"
S3_BUCKET_NAME="devlink"
```

### How File Upload Works in DevLink

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILE UPLOAD FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User selects image in browser                               │
│           │                                                     │
│           ▼                                                     │
│  2. Browser sends image to DevLink server                       │
│           │                                                     │
│           ▼                                                     │
│  3. Server validates (is it an image? is it too big?)           │
│           │                                                     │
│           ▼                                                     │
│  4. Server uploads to R2 bucket                                 │
│           │                                                     │
│           ▼                                                     │
│  5. R2 returns the public URL                                   │
│     https://pub-xxx.r2.dev/avatars/user-123.jpg                 │
│           │                                                     │
│           ▼                                                     │
│  6. Server saves URL in database                                │
│     User.avatar = "https://pub-xxx.r2.dev/avatars/user-123.jpg" │
│           │                                                     │
│           ▼                                                     │
│  7. When someone views your profile, we load the image from R2  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏠 Hosting: Where Your Website Lives

### What Is Hosting?

Hosting is renting a computer (server) that runs your website 24/7.

**Without hosting:** Your website only works when your laptop is open and connected to the internet.

**With hosting:** Your website runs on a computer in a data center, always on, always connected.

### Types of Hosting

#### Traditional Hosting (VPS/Dedicated Server)
- You rent an entire computer
- You manage everything (security updates, scaling)
- Pay monthly regardless of usage
- Example: DigitalOcean, Linode

**Analogy:** Renting an apartment - it's yours 24/7, but you pay even when you're not there.

#### Serverless Hosting (What DevLink Uses)
- You don't manage any servers
- Your code runs in "functions" that spin up on demand
- Pay only when your code runs
- Auto-scales to handle traffic
- Example: Vercel, AWS Lambda

**Analogy:** Taking taxis instead of owning a car - you only pay when you need a ride, and you don't worry about maintenance.

### Vercel

**What it is:** The best platform for hosting Next.js applications (they created Next.js!).

**Why Vercel for DevLink:**

| Feature | Vercel | Traditional Hosting |
|---------|--------|---------------------|
| Deployment | Push to Git → Live in 60 seconds | Manual uploads, configuration |
| Scaling | Automatic | You manage load balancers |
| HTTPS/SSL | Automatic | You configure certificates |
| Global CDN | Built-in | You set up separately |
| Preview Deploys | Every PR gets a URL | Not usually |
| Downtime | They handle it | You wake up at 3am |

**How Vercel Works:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL DEPLOYMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. You push code to GitHub                                     │
│           │                                                     │
│           ▼                                                     │
│  2. Vercel detects the push                                     │
│           │                                                     │
│           ▼                                                     │
│  3. Vercel builds your Next.js app                              │
│           │                                                     │
│           ▼                                                     │
│  4. Vercel deploys to their global network                      │
│     (servers in 100+ locations worldwide)                       │
│           │                                                     │
│           ▼                                                     │
│  5. Your site is live at devlink-xxx.vercel.app                 │
│           │                                                     │
│           ▼                                                     │
│  6. You connect devlink.ink → Vercel serves it                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Serverless Functions

**What they are:** Small pieces of code that run on-demand.

**Traditional server:**
```
Server runs 24/7
Even at 3am when nobody's visiting
You pay for all that time
```

**Serverless:**
```
Code sleeps until needed
User visits → Function wakes up, runs, responds, sleeps
You pay only for the milliseconds it ran
```

**DevLink's API routes are serverless functions:**
- `/api/posts` → Function that fetches posts
- `/api/auth/login` → Function that handles login
- `/api/upload` → Function that handles file uploads

Each one only runs when called, saving money.

---

## 🌍 Domains & DNS: Your Website's Address

### What Is a Domain?

A domain is a human-readable address for a website.

- IP Address: `142.250.80.46` (hard to remember)
- Domain: `google.com` (easy to remember)

**Parts of a domain:**
```
https://www.devlink.ink/profile/johndoe
  │      │     │     │        │
  │      │     │     │        └── Path (specific page)
  │      │     │     └── TLD (Top Level Domain)
  │      │     └── Domain name
  │      └── Subdomain (www)
  └── Protocol (secure connection)
```

### DNS (Domain Name System)

**What it is:** The "phone book" of the internet. It translates domains to IP addresses.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOW DNS WORKS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  You type: devlink.ink                                          │
│           │                                                     │
│           ▼                                                     │
│  Browser asks DNS: "What's the IP for devlink.ink?"             │
│           │                                                     │
│           ▼                                                     │
│  DNS responds: "76.76.21.21" (Vercel's server)                  │
│           │                                                     │
│           ▼                                                     │
│  Browser connects to 76.76.21.21                                │
│           │                                                     │
│           ▼                                                     │
│  Vercel sees request for devlink.ink                            │
│           │                                                     │
│           ▼                                                     │
│  Vercel serves your DevLink app                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### DNS Records

**A Record:** Points a domain to an IP address
```
devlink.ink → 76.76.21.21
```

**CNAME Record:** Points a domain to another domain
```
www.devlink.ink → cname.vercel-dns.com
```

**MX Record:** For email
```
devlink.ink → mail server for receiving emails
```

### Domain Registrars

**What they are:** Companies where you buy/register domains.

**Popular registrars:**
- Cloudflare Registrar (cheapest, no markup)
- Namecheap
- Google Domains (now Squarespace)
- GoDaddy (avoid - expensive and pushy)

**You bought devlink.ink from a registrar.** To point it to Vercel, you add DNS records there.

---

## 🌐 CDN: Speed Everywhere

### What Is a CDN?

CDN stands for **Content Delivery Network**. It's a network of servers around the world that cache your content.

**Without CDN:**
```
Your server is in Virginia, USA.
User in Tokyo requests your site.

Tokyo ──────────────────────────────────────► Virginia
       14,000 km, ~200ms latency
       
Every request has to travel this far.
```

**With CDN:**
```
CDN has servers in Tokyo, London, São Paulo, etc.

Your content is cached on all of them.

User in Tokyo requests your site.
Tokyo ──► Tokyo CDN server
          ~10ms latency

200ms → 10ms = 20x faster!
```

### What Gets Cached on CDNs

- **Static assets:** CSS, JavaScript, images (never change)
- **Static pages:** About page, marketing pages
- **API responses:** Sometimes (with care)

**NOT cached:**
- User-specific data (your feed, your notifications)
- Real-time data (messages, live updates)
- Sensitive data (account settings)

### Cloudflare

**What it is:** A massive CDN and security company.

**What Cloudflare provides:**

1. **CDN:** Caches your static content globally
2. **DDoS Protection:** Stops attacks that try to overwhelm your site
3. **SSL/HTTPS:** Free encryption for your domain
4. **DNS:** Fast DNS resolution
5. **R2:** Object storage (what we use)
6. **Workers:** Serverless functions at the edge

**How to use Cloudflare with Vercel:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE + VERCEL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User requests devlink.ink                                      │
│           │                                                     │
│           ▼                                                     │
│  Cloudflare (closest to user)                                   │
│  ├── Is this cached? → Yes → Return cached content              │
│  └── Is this cached? → No → Ask Vercel                          │
│           │                                                     │
│           ▼                                                     │
│  Vercel processes the request                                   │
│           │                                                     │
│           ▼                                                     │
│  Response goes back through Cloudflare                          │
│  (Cloudflare caches it for next time)                           │
│           │                                                     │
│           ▼                                                     │
│  User receives response                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 APIs: How Things Talk to Each Other

### What Is an API?

API stands for **Application Programming Interface**. It's how different programs talk to each other.

**Analogy:** A restaurant menu is an API. You don't go into the kitchen and make your own food. You look at the menu (API), tell the waiter what you want (request), and get your food (response).

### REST APIs

DevLink uses REST APIs. REST is a style of designing APIs.

**Key concepts:**
- **Endpoint:** A URL that does something
- **Method:** What action to take (GET, POST, PUT, DELETE)
- **Request:** What you send
- **Response:** What you get back

**Example DevLink API calls:**

```
GET /api/posts
→ Returns a list of posts

GET /api/posts/123
→ Returns post with ID 123

POST /api/posts
Body: { "content": "Hello world!" }
→ Creates a new post

DELETE /api/posts/123
→ Deletes post 123

POST /api/posts/123/like
→ Likes post 123
```

### How the Frontend Talks to the Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND ↔ BACKEND                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (React/Browser)         BACKEND (API/Server)          │
│                                                                 │
│  User clicks "Like" button                                      │
│           │                                                     │
│           ▼                                                     │
│  Frontend sends:                                                │
│  POST /api/posts/123/like                                       │
│  Headers: { Cookie: session_id=abc }                            │
│           │                                                     │
│           ▼                                                     │
│  Backend receives request                                       │
│  ├── Validates session (is user logged in?)                     │
│  ├── Checks rate limits (too many likes?)                       │
│  ├── Updates database (add like record)                         │
│  └── Returns response                                           │
│           │                                                     │
│           ▼                                                     │
│  Frontend receives:                                             │
│  { "success": true, "likes": 46 }                               │
│           │                                                     │
│           ▼                                                     │
│  Frontend updates UI                                            │
│  Heart turns red, count shows 46                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### External APIs

DevLink also talks to external services:

- **Google OAuth API:** "Sign in with Google"
- **Upstash API:** Cache operations
- **R2 API:** File uploads
- **OpenAI API:** AI features (optional)

---

## 🔒 Environment Variables: Secret Settings

### What Are Environment Variables?

Environment variables are settings that:
1. Change between environments (development vs production)
2. Contain secrets (passwords, API keys)
3. Should NOT be in your code

**Why not in code?**
```javascript
// ❌ BAD - Anyone who sees your code sees your password
const password = "super_secret_123";

// ✅ GOOD - Password is stored separately
const password = process.env.DATABASE_PASSWORD;
```

### The .env File

```env
# This is a comment

# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Secrets
NEXTAUTH_SECRET="random-secret-string"
GOOGLE_CLIENT_SECRET="google-secret"

# URLs
NEXTAUTH_URL="https://devlink.ink"
```

**CRITICAL:** The `.env` file should NEVER be uploaded to GitHub. It's in `.gitignore`.

### Different Environments

```
DEVELOPMENT (.env.local)
- DATABASE_URL → Local database or test database
- NEXTAUTH_URL → http://localhost:3000
- Debugging enabled

PRODUCTION (.env in Vercel)
- DATABASE_URL → Production Supabase
- NEXTAUTH_URL → https://devlink.ink
- Optimized for speed
```

### How to Set Env Vars in Vercel

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
5. Vercel injects these when your app runs

---

## 🔄 How It All Fits Together

Let's trace what happens when someone visits DevLink and likes a post:

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETE REQUEST FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER VISITS devlink.ink                                     │
│     │                                                           │
│     ├── DNS resolves devlink.ink → Cloudflare                   │
│     ├── Cloudflare checks DDoS protection → Safe                │
│     ├── Cloudflare passes to Vercel                             │
│     ├── Vercel runs Next.js                                     │
│     └── Page loads in browser                                   │
│                                                                 │
│  2. USER LOGS IN WITH GOOGLE                                    │
│     │                                                           │
│     ├── Click "Sign in with Google"                             │
│     ├── Redirect to Google OAuth                                │
│     ├── User approves access                                    │
│     ├── Google sends user info to NextAuth callback             │
│     ├── NextAuth creates/finds user in Supabase (PostgreSQL)    │
│     ├── NextAuth creates JWT session                            │
│     ├── Browser stores session cookie                           │
│     └── User is logged in!                                      │
│                                                                 │
│  3. USER VIEWS FEED                                             │
│     │                                                           │
│     ├── Browser requests /api/posts                             │
│     ├── API checks Redis cache: "Do I have fresh posts?"        │
│     │   │                                                       │
│     │   ├── CACHE HIT → Return cached posts (5ms)               │
│     │   │                                                       │
│     │   └── CACHE MISS →                                        │
│     │       ├── Query Supabase PostgreSQL                       │
│     │       ├── Run ranking algorithm                           │
│     │       ├── Store in Redis cache                            │
│     │       └── Return posts (200ms)                            │
│     │                                                           │
│     ├── Posts include image URLs from R2                        │
│     ├── Browser loads images from R2 (free egress!)             │
│     └── Feed renders with React components                      │
│                                                                 │
│  4. USER LIKES A POST                                           │
│     │                                                           │
│     ├── Click heart button                                      │
│     ├── React sends POST /api/posts/123/like                    │
│     ├── API validates JWT from cookie                           │
│     ├── API checks rate limit in Redis (200/hour)               │
│     │   │                                                       │
│     │   ├── UNDER LIMIT → Continue                              │
│     │   └── OVER LIMIT → Return "Too many requests"             │
│     │                                                           │
│     ├── API creates Like record in Supabase                     │
│     ├── API invalidates relevant caches in Redis                │
│     ├── API returns success + new like count                    │
│     └── React updates UI (heart turns red)                      │
│                                                                 │
│  5. USER UPLOADS PROFILE PICTURE                                │
│     │                                                           │
│     ├── Select image in browser                                 │
│     ├── Browser sends to /api/upload                            │
│     ├── API validates (is image, < 5MB, etc.)                   │
│     ├── API uploads to Cloudflare R2                            │
│     ├── R2 returns public URL                                   │
│     ├── API updates user.avatar in Supabase                     │
│     └── Browser displays new avatar from R2                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏢 The Services We Use

### Summary of All Services

| Service | What It Does | Why We Use It | Cost |
|---------|--------------|---------------|------|
| **Vercel** | Hosts the website | Best for Next.js, auto-scaling | Free - $20/mo |
| **Supabase** | PostgreSQL database | Easy setup, connection pooling | Free - $25/mo |
| **Upstash** | Redis cache | Serverless-friendly, fast | Free - $10/mo |
| **Cloudflare R2** | File storage | Free egress, S3-compatible | Free - $5/mo |
| **Cloudflare** | CDN, DNS, security | Speed + protection | Free |
| **Google Cloud** | OAuth login | "Sign in with Google" | Free |

### Why These Specific Services?

**Vercel over AWS/DigitalOcean:**
- Zero configuration for Next.js
- Automatic scaling
- No server management

**Supabase over raw PostgreSQL:**
- Managed service (they handle updates, backups)
- Built-in connection pooling
- Nice dashboard

**Upstash over self-hosted Redis:**
- Works with serverless (REST API)
- No server to manage
- Pay-per-use

**R2 over S3:**
- 98% cheaper for high-traffic sites (free egress)
- Same API as S3

---

## 📖 Glossary: Every Term Explained

### A

**API (Application Programming Interface)**
A way for programs to talk to each other. Like a menu at a restaurant - you make requests, you get responses.

**Authentication**
Verifying who someone is. "Are you who you say you are?"

**Authorization**
Determining what someone can do. "Are you allowed to do this?"

### B

**Backend**
The server-side of an application. The part users don't see - databases, business logic, APIs.

**Bucket**
A container for files in object storage. Like a folder, but in the cloud.

**Build**
Converting source code into something that can run. Like compiling a manuscript into a printed book.

### C

**Cache**
Temporary storage for frequently accessed data. Like keeping a copy of a document on your desk instead of going to the filing cabinet every time.

**CDN (Content Delivery Network)**
A network of servers around the world that store copies of your content for faster delivery.

**Client**
The browser/app that users interact with. The "front" of frontend.

**Component**
A reusable piece of UI in React. Like a LEGO block you can use many times.

**Cookie**
A small piece of data stored in your browser. Websites use them to remember you.

**CORS (Cross-Origin Resource Sharing)**
Security rules about which websites can talk to which APIs.

### D

**Database**
A system for storing and organizing data. Like a really sophisticated spreadsheet.

**Deployment**
Putting your code on a server so people can use it.

**DNS (Domain Name System)**
The system that translates domain names (google.com) to IP addresses (142.250.80.46).

**Domain**
A human-readable address for a website (devlink.ink).

### E

**Egress**
Data leaving a server (downloads). The opposite of ingress (uploads).

**Endpoint**
A specific URL that an API responds to (/api/posts).

**Environment Variable**
A setting stored outside your code, often containing secrets.

### F

**Framework**
A collection of tools and patterns for building applications. Next.js is a framework.

**Frontend**
The user-facing part of an application. What you see and interact with.

**Function (Serverless)**
A piece of code that runs on-demand and charges by execution time.

### G-H

**Git**
A system for tracking changes to code. Like "track changes" in Word, but much more powerful.

**GitHub**
A website that hosts Git repositories. Where code lives.

**Hosting**
Renting servers to run your website.

**HTTP/HTTPS**
The protocol used to transfer web pages. HTTPS is the secure (encrypted) version.

### I-J

**IP Address**
A numerical address for a computer on the internet (192.168.1.1).

**JavaScript**
The programming language of the web. Runs in browsers.

**JSON (JavaScript Object Notation)**
A format for storing/sending data. Looks like: `{"name": "John", "age": 30}`

**JWT (JSON Web Token)**
A secure way to transmit information between parties. Used for authentication.

### K-L

**Key (API Key)**
A secret password for accessing an API.

**Latency**
The delay between a request and response. Lower is better.

**Library**
Pre-written code you can use in your project. Like using a cookbook instead of inventing recipes.

### M-N

**Middleware**
Code that runs between receiving a request and sending a response.

**Migration**
Updating a database structure. Like renovating a house while people still live in it.

**Node.js**
A way to run JavaScript outside the browser, on servers.

**npm**
Node Package Manager. A tool for installing JavaScript libraries.

### O-P

**OAuth**
A standard for authorization. How "Sign in with Google" works.

**Object Storage**
A type of storage for files (images, videos). S3 and R2 are examples.

**ORM (Object-Relational Mapping)**
A tool that lets you interact with databases using code instead of SQL. Prisma is an ORM.

**PostgreSQL**
A powerful, open-source relational database.

**Production**
The live environment where real users access your app.

**Protocol**
A set of rules for communication. HTTP, HTTPS, WebSocket are protocols.

### Q-R

**Query**
A request for data from a database.

**Rate Limiting**
Restricting how many requests someone can make in a time period.

**React**
A JavaScript library for building user interfaces, created by Facebook.

**Redis**
A very fast in-memory database, often used for caching.

**REST**
A style of designing APIs using HTTP methods (GET, POST, PUT, DELETE).

**Route**
A URL pattern that maps to specific code. /profile → show profile page.

### S

**S3 (Simple Storage Service)**
Amazon's object storage service. R2 is Cloudflare's S3-compatible alternative.

**Schema**
The structure/shape of your data. What fields exist and what types they are.

**Server**
A computer that serves content to other computers.

**Serverless**
A model where you don't manage servers. Code runs on-demand.

**Session**
A period of interaction between user and app. Ends when you log out or it expires.

**SQL (Structured Query Language)**
A language for interacting with relational databases.

**SSL/TLS**
Encryption for web traffic. The "S" in HTTPS.

### T-U

**Token**
A piece of data that represents something (authentication, permissions, etc.).

**TypeScript**
JavaScript with types. Catches errors before they happen.

**UI (User Interface)**
What users see and interact with.

**URL (Uniform Resource Locator)**
A web address. https://devlink.ink/profile

**Upstash**
A company providing serverless Redis and Kafka.

### V-Z

**Vercel**
A platform for hosting web applications, especially Next.js.

**Webhook**
A way for one service to notify another when something happens.

**WebSocket**
A protocol for real-time, two-way communication.

---

## 🎓 Final Summary

You now understand:

1. **Websites** are files served from computers (servers)
2. **Code** is instructions for computers, written in programming languages
3. **DevLink's stack**: Next.js, React, TypeScript, Tailwind
4. **Databases** store data permanently (Supabase/PostgreSQL)
5. **Authentication** verifies identity (NextAuth, OAuth, JWT)
6. **Caching** makes things fast (Redis/Upstash)
7. **Rate limiting** prevents abuse
8. **File storage** holds images (Cloudflare R2)
9. **Hosting** runs your site (Vercel)
10. **DNS** connects domains to servers
11. **CDNs** make content load fast globally (Cloudflare)
12. **APIs** let programs talk to each other
13. **Environment variables** store secrets safely

DevLink combines all these technologies to create a social platform that's:
- **Fast** (caching, CDN, serverless)
- **Scalable** (handles 10,000+ users)
- **Secure** (authentication, rate limiting, HTTPS)
- **Affordable** (free tiers, efficient architecture)

---

*This document is part of the DevLink project. Last updated: November 26, 2025*

