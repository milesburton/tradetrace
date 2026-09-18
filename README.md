# tradetrace

> Transparent tradesman reviews with relationship mapping to expose hidden bias and fake endorsements.
> **Blockchain-immutable reviews on Ethereum + Neo4j relationship graphs + fraud detection network.**

[![CI](https://github.com/milesburton/tradetrace/actions/workflows/ci.yml/badge.svg)](https://github.com/milesburton/tradetrace/actions/workflows/ci.yml)
[![Deploy to Fly.io](https://github.com/milesburton/tradetrace/actions/workflows/deploy-fly.yml/badge.svg)](https://github.com/milesburton/tradetrace/actions/workflows/deploy-fly.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-tradetrace.fly.dev-blue)](https://tradetrace.fly.dev)

## Overview

tradetrace builds trust in tradesman reviews through three mechanisms:

1. **Blockchain Immutability** — Reviews recorded on Ethereum with Keccak256 hashes, preventing tampering
2. **Relationship Mapping** — Neo4j graph reveals who knows whom, exposing planted reviews from family/friends
3. **Transparent Scoring** — Declared relationships flagged so reviewers can judge review credibility

**Key Features**:
- ✅ Reviews stored immutably on Ethereum Sepolia testnet
- ✅ Cryptographic proof of review integrity (hash verification)
- ✅ Neo4j graph database for relationship mapping and fraud detection
- ✅ Declared relationships (spouse, friend, family, colleague)
- ✅ Public blockchain verification (Etherscan integration)
- ✅ GDPR-compliant personal data handling
- ✅ Deno/TypeScript production stack with Biome linting

**Public Demo**: https://tradetrace.fly.dev

This is a working prototype. See [CONTRIBUTING.md](CONTRIBUTING.md) for development standards and [DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting details.

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

### Phase 1 (✅ Complete)
- [x] Basic review submission + Postgres storage
- [x] User-declared relationships + Neo4j graph
- [x] Graph visualization API
- [x] Ethereum blockchain immutability (Keccak256 hashes)
- [x] Local Docker development setup
- [x] Production-grade code quality (Biome, Zod, Deno)
- [x] Fly.io deployment (free tier)
- [x] GitHub Actions CI/CD

### Phase 2 (Current)
- [ ] Frontend UI (React + Tailwind)
- [ ] Blockchain verification page (Etherscan integration)
- [ ] Review dispute resolution
- [ ] Media uploads (images, audio)

### Phase 3
- [ ] External review scraping (licensed APIs: Google, Trustpilot)
- [ ] Relationship inference (spouse/friend ML detection)
- [ ] LLM-powered review analysis (Claude API)
- [ ] Automated fraud scoring dashboard
- [ ] GDPR compliance audit & DPIA

### Phase 4
- [ ] Polygon/Arbitrum layer 2 scaling (cheaper gas)
- [ ] IPFS integration for media storage
- [ ] Advanced analytics + heatmaps
- [ ] Mobile app (React Native)

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

**tradetrace is deployed on Fly.io free tier** at https://tradetrace.fly.dev

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for setup, configuration, and scaling details.

### Quick Deploy

```bash
# 1. Install Flyctl
curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. Deploy
cd tradetrace
flyctl launch --name tradetrace
flyctl secrets set DB_PASSWORD=... NEO4J_PASSWORD=... INFURA_KEY=...
flyctl deploy

# 3. View live
open https://tradetrace.fly.dev
```

**Free Tier Specs**:
- 3 shared CPU instances across London, Amsterdam, Sydney
- 3GB Postgres database
- Neo4j community edition (self-hosted)
- 160GB bandwidth/month
- Cost: **$0/month**

### GitHub CI/CD

Push to `main` → GitHub Actions automatically deploys to Fly.io (see [deploy-fly.yml](.github/workflows/deploy-fly.yml))

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
