# QuizAI - AI-Powered Study Quiz Generator

Turn your study materials into AI-powered quizzes to help you ace your exams.

## Features

- **AI-Powered Generation**: Paste study material, get personalized quizzes
- **Multiple AI Providers**: OpenAI, Anthropic, Claude Code CLI
- **Three Difficulty Modes**: Mercy Mode, Mental Warfare, Abandon All Hope
- **Five Question Types**: Multiple Choice, True/False, Short Answer, Essay, Select All
- **Adaptive Difficulty**: Questions adjust based on performance
- **OAuth Authentication**: Google, GitHub, Discord

## Quick Start

```bash
# Install dependencies
cd src && npm install

# Configure environment
cp ../build/.env.example .env.local
# Edit .env.local with your OAuth and AI credentials

# Start development server
npm run dev
```

Open http://localhost:3000

## Docker Deployment

```bash
cd build
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

## Documentation

- [Setup Guide](./docs/SETUP.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](./docs/ARCHITECTURE.md)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- SQLite + Drizzle ORM
- NextAuth.js v5
- OpenAI / Anthropic APIs

## License

MIT
