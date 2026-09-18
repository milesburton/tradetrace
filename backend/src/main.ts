import { initializeDb, closeDb } from "./lib/db.ts";
import { initializeGraph, closeGraph } from "./lib/graph.ts";
import { logger } from "./lib/logger.ts";
import { errorResponse } from "./lib/http.ts";
import {
  handleGetTradesmen,
  handleGetTradesman,
  handleCreateTradesman,
  handleGetTradersmanReviews,
} from "./routes/tradesmen.ts";
import { handleCreateReview, handleGetReviews } from "./routes/reviews.ts";
import { handleCreateRelationship, handleGetTradersmanGraph, handleHealthCheck } from "./routes/graph.ts";

const port = parseInt(Deno.env.get("PORT") || "3000");
const dbUrl = Deno.env.get("DATABASE_URL") || "postgresql://postgres:password@localhost:5432/tradetrace";
const neo4jUri = Deno.env.get("NEO4J_URI") || "bolt://localhost:7687";
const neo4jUser = Deno.env.get("NEO4J_USER") || "neo4j";
const neo4jPassword = Deno.env.get("NEO4J_PASSWORD") || "password";

initializeDb(dbUrl);
initializeGraph(neo4jUri, neo4jUser, neo4jPassword);

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  logger.info(`${request.method} ${pathname}`);

  if (pathname === "/api/health" && request.method === "GET") {
    return await handleHealthCheck();
  }

  if (pathname === "/api/tradesmen" && request.method === "GET") {
    return await handleGetTradesmen();
  }

  if (pathname === "/api/tradesmen" && request.method === "POST") {
    return await handleCreateTradesman(request);
  }

  const tradersmanMatch = pathname.match(/^\/api\/tradesmen\/(\d+)$/);
  if (tradersmanMatch && request.method === "GET") {
    const id = parseInt(tradersmanMatch[1]);
    return await handleGetTradesman(id);
  }

  const reviewsMatch = pathname.match(/^\/api\/tradesmen\/(\d+)\/reviews$/);
  if (reviewsMatch && request.method === "GET") {
    const id = parseInt(reviewsMatch[1]);
    return await handleGetTradersmanReviews(id);
  }

  const graphMatch = pathname.match(/^\/api\/tradesmen\/(\d+)\/graph$/);
  if (graphMatch && request.method === "GET") {
    const id = parseInt(graphMatch[1]);
    return await handleGetTradersmanGraph(id);
  }

  if (pathname === "/api/reviews" && request.method === "GET") {
    return await handleGetReviews();
  }

  if (pathname === "/api/reviews" && request.method === "POST") {
    return await handleCreateReview(request);
  }

  if (pathname === "/api/relationships" && request.method === "POST") {
    return await handleCreateRelationship(request);
  }

  return errorResponse("Not found", 404);
};

logger.info("Starting tradetrace server", { port });

Deno.serve({ port, hostname: "0.0.0.0" }, handler);

const shutdown = async () => {
  logger.info("Shutting down...");
  await closeDb();
  await closeGraph();
  Deno.exit(0);
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);
