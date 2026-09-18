import { query, queryOne } from "../lib/db.ts";
import { logger } from "../lib/logger.ts";
import { jsonResponse, errorResponse, parseJsonBody } from "../lib/http.ts";
import { CreateReviewSchema } from "../schemas/index.ts";
import { generateReviewHash, recordReviewOnBlockchain } from "../lib/blockchain.ts";

export async function handleCreateReview(request: Request): Promise<Response> {
  try {
    const body = await parseJsonBody(request);
    const validated = CreateReviewSchema.parse(body);

    // Insert review into database
    const reviewResult = await query(
      `INSERT INTO reviews (tradesman_id, reviewer_id, rating, text) VALUES ($1, $2, $3, $4) RETURNING *`,
      [validated.tradesman_id, validated.reviewer_id, validated.rating, validated.text ?? null],
    );

    const review = reviewResult[0] as Record<string, unknown>;
    const reviewId = review.id as number;

    // Get reviewer email for blockchain hash
    const reviewerUser = await queryOne(
      `SELECT email FROM users WHERE id = $1`,
      [validated.reviewer_id],
    ) as Record<string, unknown> | null;

    if (!reviewerUser) {
      logger.warn("Reviewer not found for blockchain recording", { reviewerId: validated.reviewer_id });
      return jsonResponse(review, { status: 201 });
    }

    try {
      // Generate cryptographic hash of review
      const reviewHash = generateReviewHash(
        validated.tradesman_id,
        reviewerUser.email as string,
        validated.rating,
        validated.text ?? "",
      );

      // Record on blockchain (async, non-blocking)
      const blockchainRecord = await recordReviewOnBlockchain(
        validated.tradesman_id,
        reviewHash,
        reviewerUser.email as string,
        validated.rating,
      );

      // Store blockchain record in database
      await query(
        `INSERT INTO blockchain_records (review_id, blockchain_tx_hash, blockchain_review_id, review_hash, contract_address, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          reviewId,
          blockchainRecord.blockchainTxHash,
          blockchainRecord.blockchainReviewId,
          blockchainRecord.reviewHash,
          "0x...", // Contract address would be set from env
          "confirmed",
        ],
      );

      logger.info("Review recorded on blockchain", {
        reviewId,
        txHash: blockchainRecord.blockchainTxHash,
      });
    } catch (blockchainError) {
      // Log blockchain error but don't fail the review creation
      logger.warn("Failed to record review on blockchain", {
        reviewId,
        error: blockchainError instanceof Error ? blockchainError.message : String(blockchainError),
      });
    }

    return jsonResponse(review, { status: 201 });
  } catch (error) {
    logger.error("Failed to create review", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to create review", 500);
  }
}

export async function handleGetReviews(): Promise<Response> {
  try {
    const reviews = await query(
      `SELECT r.*, br.blockchain_tx_hash, br.status as blockchain_status
       FROM reviews r
       LEFT JOIN blockchain_records br ON r.id = br.review_id
       ORDER BY r.created_at DESC LIMIT 100`,
      [],
    );
    return jsonResponse(reviews);
  } catch (error) {
    logger.error("Failed to fetch reviews", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch reviews", 500);
  }
}

export async function handleGetReviewBlockchainStatus(reviewId: number): Promise<Response> {
  try {
    const record = await queryOne(
      `SELECT * FROM blockchain_records WHERE review_id = $1`,
      [reviewId],
    );

    if (!record) {
      return errorResponse("Review not recorded on blockchain", 404);
    }

    return jsonResponse(record);
  } catch (error) {
    logger.error("Failed to fetch blockchain status", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch blockchain status", 500);
  }
}
