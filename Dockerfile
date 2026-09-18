FROM denoland/deno:latest

WORKDIR /app

COPY deno.json deno.lock* ./
COPY backend ./backend
COPY migrations ./migrations

RUN deno cache --reload backend/src/main.ts

EXPOSE 3000

ENV PORT=3000
ENV DATABASE_URL=postgresql://postgres:password@postgres:5432/tradetrace
ENV NEO4J_URI=bolt://neo4j:7687

CMD ["deno", "run", "--allow-all", "backend/src/main.ts"]
