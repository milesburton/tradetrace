# tradetrace

A tradesman review platform with transparent relationship mapping to expose hidden bias and fake endorsements.

## Architecture

```
docker-compose.yml
├── web (Bun + TypeScript)       — HTTP API + minimal frontend
├── postgres                     — users, tradesmen, reviews
├── graph-service (Java)         — Neo4j queries and graph APIs
└── neo4j                        — relationship graph store
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Bun (for local web development, optional if using containers)
- Java 17+ (for local graph-service development, optional if using containers)

### Local Development with Docker

```bash
docker-compose up
```

This brings up:
- **Web API**: http://localhost:3000
- **Neo4j Browser**: http://localhost:7474 (default credentials: neo4j/password)
- **Postgres**: localhost:5432 (postgres/password)

### Database Setup

Postgres migrations run automatically on container startup. Neo4j is initialized with default schema.

## Project Structure

```
tradetrace/
├── docker-compose.yml           — Service orchestration
├── web/                         — Bun/TypeScript web app
│   ├── src/
│   │   ├── index.ts            — Server entry point
│   │   ├── routes/             — API endpoints
│   │   └── db/                 — Postgres client & queries
│   ├── public/                 — Static assets & frontend
│   └── package.json
├── graph-service/               — Java graph service
│   ├── pom.xml
│   ├── src/main/java/
│   │   └── com/tradetrace/graphservice/
│   │       ├── Application.java
│   │       ├── controller/     — REST endpoints
│   │       ├── service/        — Neo4j logic
│   │       └── model/          — Data models
│   └── Dockerfile
└── migrations/                  — SQL migrations
    └── 001_initial.sql
```

## API Endpoints

### Review API (web service)
- `POST /api/tradesmen` — Create a tradesman
- `POST /api/reviews` — Submit a review
- `GET /api/tradesmen/:id/reviews` — Get reviews for a tradesman
- `GET /api/tradesmen/:id` — Get tradesman details

### Graph API (graph-service)
- `POST /api/relationships` — Declare a relationship (KNOWS edge)
- `GET /api/tradesmen/:id/graph` — Get relationship graph for visualization

## Development

### Web (Bun)
```bash
cd web
bun install
bun run dev
```

### Graph Service (Java)
```bash
cd graph-service
mvn spring-boot:run
```

## Testing

Seed data is populated automatically on startup (see `docker-compose.yml`).

To manually test:
```bash
# Create a tradesman
curl -X POST http://localhost:3000/api/tradesmen \
  -H "Content-Type: application/json" \
  -d '{"business_name":"John Plumbing","trade_category":"plumbing"}'

# Submit a review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"tradesman_id":1,"reviewer_id":1,"rating":5,"text":"Great work!"}'

# Get graph for tradesman
curl http://localhost:3000/api/tradesmen/1/graph
```

## License

Proprietary — milesburton.com

## Next Steps

- [ ] Media upload support (images, audio)
- [ ] External review aggregation (Phase 2)
- [ ] Relationship inference / fraud detection
- [ ] GDPR compliance review & DPIA
- [ ] Fly.io deployment
