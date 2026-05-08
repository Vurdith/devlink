# OAuth Setup

DevLink uses NextAuth with credentials plus Google, Apple, X/Twitter, and Roblox providers.

## Environment Variables

Set these in `.env.local` for development and in your host for production:

```env
NEXTAUTH_SECRET="replace-with-a-strong-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="replace-me"
GOOGLE_CLIENT_SECRET="replace-me"

TWITTER_CLIENT_ID="replace-me"
TWITTER_CLIENT_SECRET="replace-me"

APPLE_ID="replace-me"
APPLE_SECRET="replace-me"

ROBLOX_CLIENT_ID="replace-me"
ROBLOX_CLIENT_SECRET="replace-me"
```

Use `https://devlink.ink` for `NEXTAUTH_URL` in production.

## Callback URLs

Register these callback paths with each provider:

```text
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/twitter
http://localhost:3000/api/auth/callback/apple
http://localhost:3000/api/auth/callback/roblox
```

Production equivalents use the same paths under `https://devlink.ink`.

## Provider Notes

- Google: create a web OAuth client in Google Cloud Console.
- X/Twitter: enable OAuth 2.0 in the developer portal and use the Twitter callback.
- Apple: create a Service ID with Sign in with Apple enabled.
- Roblox: create an OAuth app in Roblox Creator Hub and use the Roblox callback.

Do not commit real provider secrets or generated production secrets.
