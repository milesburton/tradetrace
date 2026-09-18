import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { Pool } from "pg";
import axios from "axios";

const app = new Elysia({ prefix: "/api" }).use(cors());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const graphServiceUrl = process.env.GRAPH_SERVICE_URL || "http://localhost:8080";

// Routes

// Get all tradesmen
app.get("/tradesmen", async () => {
  const res = await pool.query("SELECT * FROM tradesmen");
  return res.rows;
});

// Get tradesman by ID with reviews
app.get("/tradesmen/:id", async ({ params }) => {
  const tradesmen = await pool.query("SELECT * FROM tradesmen WHERE id = $1", [
    params.id,
  ]);
  const reviews = await pool.query(
    "SELECT r.*, u.name, u.email FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.tradesman_id = $1 ORDER BY r.created_at DESC",
    [params.id]
  );

  if (tradesmen.rows.length === 0) {
    return { error: "Tradesman not found" };
  }

  return {
    ...tradesmen.rows[0],
    reviews: reviews.rows,
  };
});

// Get reviews for a tradesman
app.get("/tradesmen/:id/reviews", async ({ params }) => {
  const res = await pool.query(
    "SELECT r.*, u.name, u.email FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.tradesman_id = $1 ORDER BY r.created_at DESC",
    [params.id]
  );
  return res.rows;
});

// Get relationship graph for tradesman
app.get("/tradesmen/:id/graph", async ({ params }) => {
  try {
    const response = await axios.get(`${graphServiceUrl}/api/tradesmen/${params.id}/graph`);
    return response.data;
  } catch (error) {
    return { error: "Failed to fetch graph data" };
  }
});

// Create tradesman
app.post("/tradesmen", async ({ body }) => {
  const { business_name, trade_category, description } = body as any;

  // Create user first
  const userRes = await pool.query(
    "INSERT INTO users (email, name, role) VALUES ($1, $2, 'tradesman') RETURNING id",
    [`${business_name.toLowerCase().replace(/\s+/g, ".")}@tradetrace.local`, business_name]
  );

  const userId = userRes.rows[0].id;

  // Create tradesman
  const res = await pool.query(
    "INSERT INTO tradesmen (user_id, business_name, trade_category, description) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, business_name, trade_category, description || null]
  );

  // Create node in Neo4j
  try {
    await axios.post(`${graphServiceUrl}/api/people`, {
      user_id: userId,
      name: business_name,
    });
  } catch (e) {
    console.error("Failed to create Neo4j node:", e);
  }

  return res.rows[0];
});

// Submit a review
app.post("/reviews", async ({ body }) => {
  const { tradesman_id, reviewer_id, rating, text } = body as any;

  const res = await pool.query(
    "INSERT INTO reviews (tradesman_id, reviewer_id, rating, text) VALUES ($1, $2, $3, $4) RETURNING *",
    [tradesman_id, reviewer_id, rating, text || null]
  );

  // Create REVIEWED relationship in Neo4j
  try {
    await axios.post(`${graphServiceUrl}/api/reviewed`, {
      reviewer_id,
      tradesman_id,
    });
  } catch (e) {
    console.error("Failed to create Neo4j relationship:", e);
  }

  return res.rows[0];
});

// Declare a relationship (KNOWS edge)
app.post("/relationships", async ({ body }) => {
  const { person1_id, person2_id, type } = body as any;

  try {
    const response = await axios.post(`${graphServiceUrl}/api/relationships`, {
      person1_id,
      person2_id,
      type,
    });
    return response.data;
  } catch (error) {
    return { error: "Failed to create relationship" };
  }
});

// Health check
app.get("/health", () => ({ status: "ok" }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});
