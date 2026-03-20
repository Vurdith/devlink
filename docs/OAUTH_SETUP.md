# OAuth Integration Setup Guide

This guide will help you set up OAuth authentication for Google, X (Twitter), Apple, and Roblox in your DevLink application.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3456"

# Google OAuth
GOOGLE_CLIENT_ID=588354524625-g39m4a4i17686p40rng2v7i2e9sepdv7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# X (Twitter) OAuth
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"

# Apple OAuth
APPLE_ID="your-apple-client-id"
APPLE_SECRET="your-apple-client-secret"

# Roblox OAuth
ROBLOX_CLIENT_ID="your-roblox-client-id"
ROBLOX_CLIENT_SECRET="your-roblox-client-secret"
```

## OAuth Provider Setup

### 1. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3456/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your environment variables

### 2. X (Twitter) OAuth Setup

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. Go to "App settings" → "Authentication settings"
4. Enable OAuth 2.0
5. Set the callback URL to:
   - `http://localhost:3456/api/auth/callback/twitter` (development)
   - `https://yourdomain.com/api/auth/callback/twitter` (production)
6. Copy the Client ID and Client Secret to your environment variables

### 3. Apple OAuth Setup

1. Go to the [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID with Sign In with Apple capability
3. Create a new Service ID
4. Configure the Service ID with your domain and redirect URL:
   - `http://localhost:3456/api/auth/callback/apple` (development)
   - `https://yourdomain.com/api/auth/callback/apple` (production)
5. Create a private key for Sign In with Apple
6. Copy the Client ID and Client Secret to your environment variables

### 4. Roblox OAuth Setup

1. Go to the [Roblox Creator Hub](https://create.roblox.com/)
2. Create a new OAuth application
3. Set the redirect URI to:
   - `http://localhost:3456/api/auth/callback/roblox` (development)
   - `https://yourdomain.com/api/auth/callback/roblox` (production)
4. Copy the Client ID and Client Secret to your environment variables

## Features Implemented

✅ **Google OAuth Integration**
- Full Google OAuth 2.0 implementation
- Automatic user creation and account linking
- Profile picture and name sync

✅ **X (Twitter) OAuth Integration**
- Twitter OAuth 2.0 implementation
- User profile information sync
- Account linking support

✅ **Apple OAuth Integration**
- Sign In with Apple implementation
- Privacy-focused authentication
- Account linking support

✅ **Roblox OAuth Integration**
- Custom Roblox OAuth provider
- Roblox-specific authentication flow
- User profile integration

✅ **Database Schema Updates**
- Added Account, Session, and VerificationToken models
- Support for multiple OAuth providers per user
- Proper foreign key relationships

✅ **UI Components**
- Beautiful OAuth buttons with provider-specific styling
- Consistent design across login and register pages
- Responsive layout with proper spacing

## Usage

Once you've set up the environment variables and OAuth applications:

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/register`
3. Click on any OAuth provider button to authenticate
4. Users will be automatically created and logged in
5. Existing users can link additional OAuth accounts

## Security Notes

- Always use HTTPS in production
- Keep your OAuth secrets secure and never commit them to version control
- Regularly rotate your OAuth credentials
- Use strong, unique values for `NEXTAUTH_SECRET`

## Troubleshooting

- Ensure all environment variables are properly set
- Check that redirect URIs match exactly in your OAuth app configurations
- Verify that your OAuth applications are approved and active
- Check the browser console and server logs for any error messages
