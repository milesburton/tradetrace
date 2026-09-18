import { Driver, auth } from "neo4j";

let driver: Driver | null = null;

export interface GraphNode {
  id: string;
  name: string;
  type: "trader" | "reviewer" | "connected";
  userId: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function initializeGraph(uri: string, user: string, password: string): Driver {
  driver = Driver.create(uri, auth.basic(user, password));
  return driver;
}

export function getGraph(): Driver {
  if (!driver) {
    throw new Error("Graph driver not initialized. Call initializeGraph first.");
  }
  return driver;
}

export async function closeGraph(): Promise<void> {
  if (driver) {
    await driver.close();
  }
}

export async function createPerson(userId: number, name: string): Promise<void> {
  const session = getGraph().session();
  try {
    await session.run("MERGE (p:Person {user_id: $user_id}) SET p.name = $name", {
      user_id: userId,
      name,
    });
  } finally {
    await session.close();
  }
}

export async function createRelationship(
  person1Id: number,
  person2Id: number,
  type: string,
): Promise<void> {
  const session = getGraph().session();
  try {
    await session.run(
      `MATCH (p1:Person {user_id: $p1}), (p2:Person {user_id: $p2})
       CREATE (p1)-[r:KNOWS {type: $type}]->(p2)`,
      {
        p1: person1Id,
        p2: person2Id,
        type,
      },
    );
  } finally {
    await session.close();
  }
}

export async function getTradersmanGraph(tradersmanId: number): Promise<Graph> {
  const session = getGraph().session();
  try {
    const result = await session.run(
      `MATCH (t:Tradesman {tradesman_id: $tradesman_id})
       OPTIONAL MATCH (reviewer:Person)-[:REVIEWED]->(t)
       OPTIONAL MATCH (reviewer)-[k:KNOWS]-(connected:Person)
       RETURN DISTINCT reviewer, k, connected, t`,
      { tradesman_id: tradersmanId },
    );

    const nodes = new Map<number, GraphNode>();
    const edges = new Set<string>();

    nodes.set(tradersmanId, {
      id: `tradesman-${tradersmanId}`,
      name: `Tradesman ${tradersmanId}`,
      type: "trader",
      userId: tradersmanId,
    });

    for (const record of result.records) {
      const reviewer = record.get("reviewer");
      const connected = record.get("connected");
      const k = record.get("k");

      if (reviewer) {
        const reviewerId = reviewer.properties.user_id;
        nodes.set(reviewerId, {
          id: `reviewer-${reviewerId}`,
          name: reviewer.properties.name,
          type: "reviewer",
          userId: reviewerId,
        });
        edges.add(`${reviewerId}->reviewed->${tradersmanId}`);
      }

      if (connected && k) {
        const connectedId = connected.properties.user_id;
        nodes.set(connectedId, {
          id: `connected-${connectedId}`,
          name: connected.properties.name,
          type: "connected",
          userId: connectedId,
        });
        edges.add(`${reviewerId}->knows:${k.properties.type}->${connectedId}`);
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges).map((e) => {
        const [source, rel, target] = e.split("->");
        return { source, target, type: rel };
      }),
    };
  } finally {
    await session.close();
  }
}
