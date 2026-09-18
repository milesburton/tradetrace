package com.tradetrace.graphservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Graph {
  private List<GraphNode> nodes;
  private List<GraphEdge> edges;
}
