# Contributing to tradetrace

## Code Quality Standards

tradetrace follows the standards set by [veta-trading-platform](https://github.com/milesburton/veta-trading-platform). All code must pass:

- **Linting**: `deno lint`
- **Formatting**: `deno fmt`
- **Type checking**: `deno check`
- **Tests**: `deno test`

## Development Setup

```bash
# Clone the repo
git clone https://github.com/milesburton/tradetrace.git
cd tradetrace

# Start local environment
docker-compose up

# Run development server
deno task dev

# Run tests
deno task test

# Format and lint
deno task fmt
deno task lint
```

## Code Style

- Use TypeScript with strict type checking
- No `any` types (enforced by Biome)
- Validate all external input with Zod schemas
- Use const instead of let/var (enforced by Biome)
- Keep functions small and focused
- Write meaningful error messages

## Testing

- Write unit tests for all new business logic
- Use integration tests for database/graph operations
- Aim for >80% code coverage
- Use descriptive test names

## Commits

- Keep commits focused and logical
- Write clear commit messages following conventional commits
- Include Co-Authored-By line when appropriate

## Pull Requests

- Open a draft PR early for feedback
- Ensure CI passes (linting, tests, type-check)
- Include a clear description of changes
- Request review from maintainers

## Questions?

Open an issue or check existing documentation at `/docs`.
