# DevLink – Roblox Developer Network

<div align="center">
  <img src="public/logo/logo.png" alt="DevLink Logo" width="120" height="120" />
  <p><strong>The premier professional network for Roblox developers, clients, studios, and influencers.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
</div>

---

## 🚀 Features

- **Professional Profiles** – Showcase your work with customizable portfolios
- **Social Feed** – Share updates, projects, and connect with the community
- **Multi-Type Profiles** – Developer, Client, Studio, Influencer, or Guest
- **Rich Media** – Upload images, videos, and create polls
- **Real-time Engagement** – Likes, reposts, replies, and saves
- **Discovery** – Find talent, projects, and trending hashtags
- **OAuth Support** – Sign in with Google, GitHub, Discord, or X

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.5.2 (App Router) |
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma 6.15 |
| **Auth** | NextAuth 4.24 |
| **Storage** | Cloudflare R2 / AWS S3 |
| **Caching** | Redis (Upstash) |
| **Monitoring** | Sentry |
| **Testing** | Vitest |

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Redis instance (Upstash recommended for serverless)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/devlink.git
   cd devlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."
   
   # Storage (Cloudflare R2 or AWS S3)
   S3_BUCKET="..."
   S3_REGION="..."
   S3_ACCESS_KEY_ID="..."
   S3_SECRET_ACCESS_KEY="..."
   
   # Redis (optional but recommended)
   UPSTASH_REDIS_REST_URL="..."
   UPSTASH_REDIS_REST_TOKEN="..."
   
   # Sentry (optional)
   SENTRY_DSN="..."
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests with Vitest |
| `npm run lint` | Run ESLint |
| `npm run tunnel` | Start Cloudflare tunnel for testing |

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication pages
│   ├── (routes)/       # Main application routes
│   ├── api/            # API routes
│   ├── home/           # Home feed
│   ├── settings/       # Settings pages
│   └── u/[username]/   # User profiles
├── components/         # React components
│   ├── analytics/      # Analytics components
│   ├── feed/           # Feed components
│   ├── layout/         # Layout components
│   ├── portfolio/      # Portfolio components
│   ├── providers/      # Context providers
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── ranking/        # Feed ranking algorithm
│   └── monitoring/     # Performance monitoring
├── server/             # Server-side code
└── types/              # TypeScript types
```

## 🔐 Environment Variables

See `.env.example` for all required and optional environment variables.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

DevLink is optimized for deployment on:
- **Vercel** (recommended)
- **Railway**
- **AWS Amplify**
- Any platform supporting Next.js

### Production Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure CDN for media
- [ ] Set up error monitoring
- [ ] Configure rate limiting

## 📄 License

This project is proprietary. All rights reserved.

## 🤝 Contributing

Please read our contributing guidelines before submitting a pull request.

---

<div align="center">
  <p>Built with ❤️ for the Roblox development community</p>
  <p><a href="https://devlink.ink">devlink.ink</a></p>
</div>
