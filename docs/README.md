# QuizAI - AI-Powered Study Quiz Generator

QuizAI is a NextJS application that generates AI-powered quizzes from study materials to help students prepare for exams and finals. The application uses SQLite for data persistence, supports multiple AI providers (OpenAI/ChatGPT and Anthropic/Claude), and is containerized with Docker.

## Features

- **AI-Powered Quiz Generation**: Paste your study material and get personalized quizzes
- **Multiple AI Providers**: Support for OpenAI, Anthropic, and Claude Code CLI
- **Three Difficulty Modes**:
  - Mercy Mode - Beginner-friendly with helpful hints
  - Mental Warfare - Challenging questions for serious learners
  - Abandon All Hope - Expert-level, no mercy
- **Five Question Types**:
  - Multiple Choice
  - True/False
  - Short Answer
  - Essay
  - Select All That Apply
- **Adaptive Difficulty**: Questions adjust based on your performance
- **OAuth Authentication**: Sign in with Google, GitHub, or Discord
- **Persistent Storage**: SQLite database with Docker volume support
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker and Docker Compose (for containerized deployment)
- At least one OAuth provider configured (Google, GitHub, or Discord)
- At least one AI provider API key (OpenAI or Anthropic)

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quizai
   ```

2. Install dependencies:
   ```bash
   cd src
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp ../build/.env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

### Docker Deployment

1. Copy and configure environment:
   ```bash
   cp build/.env.example build/.env
   # Edit build/.env with your configuration
   ```

2. Build and run:
   ```bash
   cd build
   docker-compose up -d
   ```

3. Access the application at http://localhost:3000

## Project Structure

```
project-root/
├── build/              # Docker configuration
├── docs/               # Documentation
└── src/                # NextJS application
    ├── src/
    │   ├── app/        # Next.js App Router
    │   ├── components/ # React components
    │   ├── lib/        # Utilities and integrations
    │   ├── hooks/      # Custom React hooks
    │   └── types/      # TypeScript definitions
    └── public/         # Static assets
```

## Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [API Reference](./API.md) - API endpoint documentation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Architecture](./ARCHITECTURE.md) - System design and patterns

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **AI Providers**: OpenAI, Anthropic, Claude Code
- **Icons**: Lucide React
- **Containerization**: Docker

## License

MIT License - See LICENSE file for details.
