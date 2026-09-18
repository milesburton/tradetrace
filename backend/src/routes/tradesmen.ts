import { query, queryOne } from "../lib/db.ts";
import { logger } from "../lib/logger.ts";
import { jsonResponse, errorResponse, parseJsonBody } from "../lib/http.ts";
import { CreateTradersmanSchema, TradersmanSchema, ReviewSchema } from "../schemas/index.ts";
import { createPerson } from "../lib/graph.ts";

export async function handleGetTradesmen(): Promise<Response> {
  try {
    const tradesmen = await query("SELECT * FROM tradesmen", []);
    return jsonResponse(tradesmen);
  } catch (error) {
    logger.error("Failed to fetch tradesmen", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch tradesmen", 500);
  }
}

export async function handleGetTradesman(id: number): Promise<Response> {
  try {
    const tradesman = await queryOne(`SELECT * FROM tradesmen WHERE id = $1`, [id]);
    if (!tradesman) {
      return errorResponse("Tradesman not found", 404);
    }

    const reviews = await query(
      "SELECT r.*, u.name, u.email FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.tradesman_id = $1 ORDER BY r.created_at DESC",
      [id],
    );

    return jsonResponse({ ...tradesman, reviews });
  } catch (error) {
    logger.error("Failed to fetch tradesman", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch tradesman", 500);
  }
}

export async function handleCreateTradesman(request: Request): Promise<Response> {
  try {
    const body = await parseJsonBody(request);
    const validated = CreateTradersmanSchema.parse(body);

    const userResult = await query(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'tradesman') RETURNING id`,
      [
        `${validated.business_name.toLowerCase().replace(/\s+/g, ".")}@tradetrace.local`,
        validated.business_name,
      ],
    );

    const userId = (userResult[0] as Record<string, unknown>).id as number;

    const tradesman = await queryOne(
      `INSERT INTO tradesmen (user_id, business_name, trade_category, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, validated.business_name, validated.trade_category, validated.description ?? null],
    );

    await createPerson(userId, validated.business_name);

    return jsonResponse(tradesman, { status: 201 });
  } catch (error) {
    logger.error("Failed to create tradesman", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to create tradesman", 500);
  }
}

export async function handleGetTradersmanReviews(id: number): Promise<Response> {
  try {
    const reviews = await query(
      "SELECT r.*, u.name, u.email FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.tradesman_id = $1 ORDER BY r.created_at DESC",
      [id],
    );
    return jsonResponse(reviews);
  } catch (error) {
    logger.error("Failed to fetch reviews", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch reviews", 500);
  }
}
