import { query } from "../lib/db.ts";
import { logger } from "../lib/logger.ts";
import { jsonResponse, errorResponse, parseJsonBody } from "../lib/http.ts";
import { CreateReviewSchema } from "../schemas/index.ts";

export async function handleCreateReview(request: Request): Promise<Response> {
  try {
    const body = await parseJsonBody(request);
    const validated = CreateReviewSchema.parse(body);

    const review = await query(
      `INSERT INTO reviews (tradesman_id, reviewer_id, rating, text) VALUES ($1, $2, $3, $4) RETURNING *`,
      [validated.tradesman_id, validated.reviewer_id, validated.rating, validated.text ?? null],
    );

    return jsonResponse(review[0], { status: 201 });
  } catch (error) {
    logger.error("Failed to create review", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to create review", 500);
  }
}

export async function handleGetReviews(): Promise<Response> {
  try {
    const reviews = await query("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 100", []);
    return jsonResponse(reviews);
  } catch (error) {
    logger.error("Failed to fetch reviews", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch reviews", 500);
  }
}
