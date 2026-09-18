package com.tradetrace.graphservice.service;

import com.tradetrace.graphservice.model.Graph;
import com.tradetrace.graphservice.model.GraphNode;
import com.tradetrace.graphservice.model.GraphEdge;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Result;
import org.neo4j.driver.Record;
import org.neo4j.driver.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphService {

  @Autowired
  private Driver driver;

  public void createPerson(Long userId, String name) {
    try (Session session = driver.session()) {
      session.run(
        "MERGE (p:Person {user_id: $user_id}) SET p.name = $name",
        Map.of("user_id", userId, "name", name)
      );
    }
  }

  public void createRelationship(Long person1Id, Long person2Id, String type) {
    try (Session session = driver.session()) {
      String query = String.format(
        "MATCH (p1:Person {user_id: $p1}), (p2:Person {user_id: $p2}) " +
        "CREATE (p1)-[r:KNOWS {type: $type}]->(p2)",
        type
      );
      session.run(query, Map.of("p1", person1Id, "p2", person2Id, "type", type));
    }
  }

  public void createReviewedRelationship(Long reviewerId, Long trademanId) {
    try (Session session = driver.session()) {
      session.run(
        "MATCH (r:Person {user_id: $reviewer}) " +
        "MERGE (t:Tradesman {tradesman_id: $tradesman}) " +
        "CREATE (r)-[:REVIEWED]->(t)",
        Map.of("reviewer", reviewerId, "tradesman", trademanId)
      );
    }
  }

  public Graph getTradersmanGraph(Long trademanId) {
    try (Session session = driver.session()) {
      // Get all reviewers and their connections
      String query =
        "MATCH (t:Tradesman {tradesman_id: $tradesman_id}) " +
        "OPTIONAL MATCH (reviewer:Person)-[:REVIEWED]->(t) " +
        "OPTIONAL MATCH (reviewer)-[k:KNOWS]-(connected:Person) " +
        "RETURN DISTINCT reviewer, k, connected, t";

      Result result = session.run(query, Map.of("tradesman_id", trademanId));

      Map<Long, GraphNode> nodesMap = new HashMap<>();
      Set<GraphEdge> edges = new HashSet<>();

      while (result.hasNext()) {
        Record record = result.next();

        // Add tradesman node
        nodesMap.putIfAbsent(trademanId, new GraphNode(trademanId, "Tradesman", "tradesman"));

        Value reviewerValue = record.get("reviewer");
        if (!reviewerValue.isNull()) {
          Long reviewerId = reviewerValue.get("user_id").asLong();
          String reviewerName = reviewerValue.get("name").asString();
          nodesMap.putIfAbsent(reviewerId, new GraphNode(reviewerId, reviewerName, "reviewer"));

          // Add REVIEWED edge
          edges.add(new GraphEdge(reviewerId, trademanId, "REVIEWED"));
        }

        Value kValue = record.get("k");
        Value connectedValue = record.get("connected");
        if (!kValue.isNull() && !connectedValue.isNull()) {
          Long connectedId = connectedValue.get("user_id").asLong();
          String connectedName = connectedValue.get("name").asString();
          String relationType = kValue.get("type").asString();

          nodesMap.putIfAbsent(connectedId, new GraphNode(connectedId, connectedName, "connected"));

          // Add KNOWS edge
          edges.add(new GraphEdge(record.get("reviewer").get("user_id").asLong(), connectedId, "KNOWS:" + relationType));
        }
      }

      return new Graph(new ArrayList<>(nodesMap.values()), new ArrayList<>(edges));
    }
  }
}
