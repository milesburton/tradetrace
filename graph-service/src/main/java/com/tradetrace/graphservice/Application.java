package com.tradetrace.graphservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;

@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

  @Bean
  public Driver neo4jDriver() {
    String uri = System.getenv().getOrDefault("NEO4J_URI", "bolt://localhost:7687");
    String user = System.getenv().getOrDefault("NEO4J_USER", "neo4j");
    String password = System.getenv().getOrDefault("NEO4J_PASSWORD", "password");
    return GraphDatabase.driver(uri, AuthTokens.basic(user, password));
  }
}
