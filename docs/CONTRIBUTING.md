> [<< Documentation Index](./README.md)

# Contributing to QuizAI

Thank you for your interest in contributing to QuizAI. This guide covers the development workflow and expectations for contributions.

## Getting Started

Set up your local development environment by following the [Getting Started Guide](./GETTING-STARTED.md). You will need at least one OAuth provider and one AI provider configured to run the application.

## Development Workflow

1. **Fork and clone** the repository
2. **Create a branch** from `master` for your work
3. **Make your changes** with clear, focused commits
4. **Test locally** -- ensure `bun run build` succeeds and the application works as expected
5. **Open a pull request** against `master`

### Available Scripts

Run these from the `src/` directory:

| Script | Purpose |
|--------|---------|
| `bun run dev` | Start the development server |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:push` | Push schema changes (development) |
| `bun run db:studio` | Open Drizzle Studio |

## Code Style

- **Language**: TypeScript throughout (strict mode)
- **Styling**: Tailwind CSS v4 utility classes
- **Components**: React Server Components by default; `"use client"` only when needed
- **File naming**: kebab-case for files, PascalCase for components
- **Imports**: Absolute imports via `@/` path alias

### Project Structure

See [Architecture](./ARCHITECTURE.md) for the full system design. Key directories:

```
src/
  app/          # Next.js App Router (pages and API routes)
  components/   # React components (ui/, quiz/, dashboard/, auth/)
  lib/          # Core libraries (db/, ai/, auth, utils, validations)
  hooks/        # Custom React hooks
  types/        # TypeScript definitions
```

## Pull Request Process

1. **Title**: Concise description of the change (e.g., "Add quiz export feature")
2. **Description**: Explain what the PR does and why. Link any related issues.
3. **Scope**: Keep PRs focused. One feature or fix per PR is preferred.
4. **Review**: All PRs require review before merging.
5. **Build**: The PR must pass `bun run build` and `bun run lint` without errors.

## Security

If you discover a security vulnerability, please report it privately rather than opening a public issue. See [Security](./SECURITY.md) for the current security architecture and expectations.

## License

QuizAI is licensed under the **GNU General Public License v3.0**. By contributing, you agree that your contributions will be licensed under the same terms. See the [LICENSE](../LICENSE) file for details.

---

**Next**: [Security](./SECURITY.md)
