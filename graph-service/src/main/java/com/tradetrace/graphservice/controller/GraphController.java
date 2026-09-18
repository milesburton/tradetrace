package com.tradetrace.graphservice.controller;

import com.tradetrace.graphservice.model.Graph;
import com.tradetrace.graphservice.model.Relationship;
import com.tradetrace.graphservice.service.GraphService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GraphController {

  @Autowired
  private GraphService graphService;

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }

  @PostMapping("/people")
  public Map<String, Object> createPerson(@RequestBody Map<String, Object> body) {
    Long userId = ((Number) body.get("user_id")).longValue();
    String name = (String) body.get("name");
    graphService.createPerson(userId, name);
    return Map.of("status", "created", "user_id", userId);
  }

  @PostMapping("/relationships")
  public Map<String, Object> createRelationship(@RequestBody Relationship relationship) {
    graphService.createRelationship(relationship.getPerson1Id(), relationship.getPerson2Id(), relationship.getType());
    return Map.of("status", "created");
  }

  @PostMapping("/reviewed")
  public Map<String, Object> createReviewedRelationship(@RequestBody Map<String, Object> body) {
    Long reviewerId = ((Number) body.get("reviewer_id")).longValue();
    Long trademanId = ((Number) body.get("tradesman_id")).longValue();
    graphService.createReviewedRelationship(reviewerId, trademanId);
    return Map.of("status", "created");
  }

  @GetMapping("/tradesmen/{id}/graph")
  public Graph getTradersmanGraph(@PathVariable Long id) {
    return graphService.getTradersmanGraph(id);
  }
}
