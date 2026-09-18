-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('reviewer', 'tradesman', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tradesmen table
CREATE TABLE tradesmen (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  trade_category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  tradesman_id INTEGER NOT NULL REFERENCES tradesmen(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO users (email, name, role) VALUES
  ('john@example.com', 'John Smith', 'tradesman'),
  ('jane@example.com', 'Jane Doe', 'reviewer'),
  ('bob@example.com', 'Bob Johnson', 'reviewer'),
  ('alice@example.com', 'Alice Williams', 'reviewer'),
  ('charlie@example.com', 'Charlie Brown', 'tradesman');

INSERT INTO tradesmen (user_id, business_name, trade_category, description) VALUES
  (1, 'John Plumbing', 'plumbing', 'Professional plumbing services in London'),
  (5, 'Charlie Electrical', 'electrical', 'Certified electrical contractor');

INSERT INTO reviews (tradesman_id, reviewer_id, rating, text) VALUES
  (1, 2, 5, 'Excellent work, very professional!'),
  (1, 3, 4, 'Good service, minor delays'),
  (1, 4, 5, 'Highly recommended!'),
  (2, 2, 3, 'Average work, overpriced');

CREATE INDEX idx_reviews_tradesman ON reviews(tradesman_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_tradesmen_user ON tradesmen(user_id);
