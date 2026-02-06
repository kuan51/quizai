# QuizAI

**AI-powered adaptive study quiz generator -- turn your notes into exams.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Drizzle_ORM-003B57?logo=sqlite)](https://orm.drizzle.team/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

---

## What is QuizAI?

QuizAI takes your study materials -- lecture notes, textbook excerpts, slide decks -- and uses AI to generate personalized quizzes that help you retain what you are learning. It supports multiple question formats, three difficulty tiers, adaptive difficulty that responds to your performance, and AI-powered essay grading.

### Key Features

- **AI-Powered Quiz Generation** -- Paste study material, receive a tailored quiz in seconds. Supports OpenAI (GPT-4 Turbo), Anthropic (Claude Sonnet 4), and Claude Code CLI.
- **Five Question Types** -- Multiple Choice, True/False, Short Answer, Essay, and Select All That Apply.
- **Three Difficulty Tiers** -- *Mercy Mode* (beginner-friendly), *Mental Warfare* (challenging), and *Abandon All Hope* (expert-level, no mercy).
- **Adaptive Difficulty** -- Questions get harder or easier based on your recent performance using exponential decay weighting.
- **AI Essay Grading** -- Essay and short-answer responses are graded by AI with score, correctness, and constructive feedback.
- **OAuth Authentication** -- Sign in with Google, GitHub, or Discord.
- **15 Themes** -- Five theme categories (Editorial, Cyberpunk, Dracula, Arc, Glass), each with light, dark, and neon variants.
- **Security Hardened** -- Input sanitization, rate limiting, Zod validation, CSP headers, and structured security logging.
- **Docker Deployment** -- Multi-stage Docker build with Cloudflared tunnel support for production.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite with Drizzle ORM |
| Authentication | NextAuth.js v5 (Auth.js) |
| AI Providers | OpenAI, Anthropic, Claude Code CLI |
| Icons | Lucide React |
| Deployment | Docker, Cloudflared |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/kuan51/quizai.git
cd quizai

# 2. Install dependencies
cd src && npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your OAuth and AI provider credentials

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For detailed setup instructions including OAuth provider configuration, see the [Getting Started Guide](./docs/GETTING_STARTED.md).

---

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Prerequisites, installation, OAuth setup, AI provider configuration |
| [Architecture](./docs/ARCHITECTURE.md) | System design, data model, service architecture, design decisions |
| [API Reference](./docs/API.md) | REST API endpoints, request/response formats, error handling |
| [Deployment](./docs/DEPLOYMENT.md) | Docker, docker-compose, Cloudflared tunnels, cloud platforms |
| [Security](./docs/SECURITY.md) | Security architecture, OWASP alignment, implemented protections |
| [Contributing](./docs/CONTRIBUTING.md) | Development workflow, code style, PR process |
| [Domain Ontology](./docs/ONTOLOGY.md) | Comprehensive domain model reference |

---

## Contributing

Contributions are welcome. Please read the [Contributing Guide](./docs/CONTRIBUTING.md) before opening a pull request. The guide covers the development workflow, code conventions, and PR expectations.

---

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
