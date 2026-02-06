# QuizAI Setup Guide

This guide covers the complete setup process for QuizAI, including OAuth provider configuration and AI provider setup.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Git

## Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd quizai/src
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

## OAuth Provider Setup

You need to configure at least one OAuth provider for authentication.

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Navigate to "OAuth2" > "General"
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/discord`
5. Copy the Client ID and Client Secret:
   ```
   DISCORD_CLIENT_ID=your-client-id
   DISCORD_CLIENT_SECRET=your-client-secret
   ```

## AI Provider Setup

Configure at least one AI provider for quiz generation.

### Anthropic (Recommended)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account and navigate to API Keys
3. Generate a new API key
4. Add to your `.env.local`:
   ```
   ANTHROPIC_API_KEY=your-api-key
   ANTHROPIC_MODEL=claude-sonnet-4-20250514
   DEFAULT_AI_PROVIDER=anthropic
   ```

### OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new API key
4. Add to your `.env.local`:
   ```
   OPENAI_API_KEY=your-api-key
   OPENAI_MODEL=gpt-4-turbo-preview
   DEFAULT_AI_PROVIDER=openai
   ```

### Claude Code (CLI Alternative)

For local development, you can use Claude Code CLI instead of API keys:

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Authenticate: `claude auth login`
3. Enable in `.env.local`:
   ```
   CLAUDE_CODE_ENABLED=true
   DEFAULT_AI_PROVIDER=claude-code
   ```

## NextAuth Configuration

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Add to your `.env.local`:
```
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

## Database Setup

The SQLite database is automatically initialized when you start the application. The database file is created at `./data/quiz.db`.

For manual database operations:

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### OAuth Callback Errors

- Ensure redirect URIs match exactly (including trailing slashes)
- Check that all OAuth credentials are correctly configured
- Verify NEXTAUTH_URL matches your actual URL

### Database Errors

- Ensure the `data` directory exists and is writable
- Check DATABASE_URL in your environment

### AI Provider Errors

- Verify API keys are valid and have sufficient credits
- Check that the selected model is available for your account
- For Claude Code, ensure you're authenticated (`claude auth status`)

## Next Steps

- Read the [API Documentation](./API.md) for endpoint details
- Check the [Deployment Guide](./DEPLOYMENT.md) for production setup
- Review the [Architecture](./ARCHITECTURE.md) for system design
