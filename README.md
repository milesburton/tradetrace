# tradetrace

> Transparent tradesman reviews with relationship mapping to expose hidden bias and fake endorsements.

[![CI](https://github.com/milesburton/tradetrace/actions/workflows/ci.yml/badge.svg)](https://github.com/milesburton/tradetrace/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

tradetrace builds trust in tradesman reviews by:

- **Exposing relationships**: Visualizing who knows whom to detect planted reviews from family/friends
- **Aggregating reviews**: Combining data from multiple sources for unbiased ratings
- **Transparent scoring**: Flagging declared relationships so reviewers can judge credibility
- **GDPR-compliant**: Handling personal data responsibly with explicit consent

This is a prototype demonstrating core functionality. See [CONTRIBUTING.md](CONTRIBUTING.md) for development standards.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Deno 1.40+ (for local development)

### Local Development

```bash
# Start services
docker-compose up

# In another terminal, start the API server
deno task dev

# API runs on http://localhost:3000
# Neo4j Browser on http://localhost:7474
# Postgres on localhost:5432
```

### API Usage

```bash
# Create a tradesman
curl -X POST http://localhost:3000/api/tradesmen \
  -H "Content-Type: application/json" \
  -d '{"business_name":"John Plumbing","trade_category":"plumbing"}'

# Submit a review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"tradesman_id":1,"reviewer_id":2,"rating":5,"text":"Great work!"}'

# Get tradesman with reviews
curl http://localhost:3000/api/tradesmen/1

# Get relationship graph
curl http://localhost:3000/api/tradesmen/1/graph

# Declare a relationship
curl -X POST http://localhost:3000/api/relationships \
  -H "Content-Type: application/json" \
  -d '{"person1_id":2,"person2_id":3,"type":"spouse"}'
```

## Project Structure

```
tradetrace/
├── backend/                     — Deno TypeScript server
│   ├── src/
│   │   ├── main.ts             — Server entry point
│   │   ├── lib/                — Shared libraries
│   │   │   ├── db.ts          — Postgres client
│   │   │   ├── graph.ts       — Neo4j client
│   │   │   ├── http.ts        — HTTP utilities
│   │   │   └── logger.ts      — Structured logging
│   │   ├── routes/            — API route handlers
│   │   │   ├── tradesmen.ts
│   │   │   ├── reviews.ts
│   │   │   └── graph.ts
│   │   ├── schemas/           — Zod validation schemas
│   │   └── tests/             — Unit & integration tests
│   └── db/                    — SQL migrations
├── frontend/                  — React + Tailwind (planned)
├── shared/                    — Shared types & utilities
├── docker-compose.yml         — Local service orchestration
├── biome.json                 — Linting & formatting rules
├── deno.json                  — Deno config & tasks
├── .github/workflows/         — CI/CD pipelines
└── docs/                      — Documentation
```

## Development

### Commands

```bash
# Type check
deno task check

# Run tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint

# Start development server
deno task dev
```

### Code Quality

All code follows veta-trading-platform standards:

- **No `any` types** — enforced by Biome linter
- **Strict TypeScript** — strict mode enabled
- **Validation** — all external input validated with Zod
- **Testing** — unit tests for all business logic
- **Formatting** — auto-formatted with Biome

## Architecture

### Backend (Deno)

- **HTTP Server**: Deno native HTTP server
- **Postgres**: Users, tradesmen, reviews (source of truth)
- **Neo4j**: Relationship graph for fraud detection
- **Zod**: Runtime validation for all schemas

### Services

- **graph-service** (Neo4j): Relationship queries, connection inference
- **db-service** (Postgres): Users, tradesmen, reviews, ratings
- **api-gateway** (Deno): HTTP API, request routing, validation

## Roadmap

### Phase 1 (Current)
- [x] Basic review submission
- [x] User-declared relationships
- [x] Graph visualization API
- [x] Local Docker setup
- [ ] Frontend (React + Tailwind)
- [ ] Production Docker Compose

### Phase 2
- [ ] External review scraping (via licensed APIs)
- [ ] Relationship inference (spouse/friend detection)
- [ ] Media uploads (images, audio)
- [ ] Fly.io deployment

### Phase 3
- [ ] LLM-powered review analysis
- [ ] Automated fraud scoring
- [ ] GDPR compliance audit & DPIA
- [ ] Advanced analytics dashboard

## Testing

```bash
# Run all tests
deno task test

# Tests include:
# - Unit tests (business logic)
# - Integration tests (database operations)
# - Smoke tests (API endpoints)
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities and security practices.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and code standards.

## License

MIT — See [LICENSE](LICENSE)

## Author

[Miles Burton](https://milesburton.com)

## Inspiration

Built following the quality standards of [veta-trading-platform](https://github.com/milesburton/veta-trading-platform).
