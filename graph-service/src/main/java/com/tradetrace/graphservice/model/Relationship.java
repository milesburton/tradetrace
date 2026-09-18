package com.tradetrace.graphservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Relationship {
  private Long person1Id;
  private Long person2Id;
  private String type;
}
