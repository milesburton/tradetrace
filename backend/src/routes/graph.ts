import { logger } from "../lib/logger.ts";
import { jsonResponse, errorResponse, parseJsonBody } from "../lib/http.ts";
import { RelationshipSchema } from "../schemas/index.ts";
import { createRelationship, getTradersmanGraph } from "../lib/graph.ts";

export async function handleCreateRelationship(request: Request): Promise<Response> {
  try {
    const body = await parseJsonBody(request);
    const validated = RelationshipSchema.parse(body);

    await createRelationship(validated.person1_id, validated.person2_id, validated.type);

    return jsonResponse({ status: "created" }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create relationship", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to create relationship", 500);
  }
}

export async function handleGetTradersmanGraph(id: number): Promise<Response> {
  try {
    const graph = await getTradersmanGraph(id);
    return jsonResponse(graph);
  } catch (error) {
    logger.error("Failed to fetch graph", { error: error instanceof Error ? error.message : String(error) });
    return errorResponse("Failed to fetch graph", 500);
  }
}

export async function handleHealthCheck(): Promise<Response> {
  return jsonResponse({ status: "ok" });
}
