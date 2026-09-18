-- Blockchain records for review immutability
CREATE TABLE blockchain_records (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  blockchain_tx_hash VARCHAR(255) NOT NULL UNIQUE,
  blockchain_review_id BIGINT NOT NULL UNIQUE,
  review_hash VARCHAR(255) NOT NULL,
  contract_address VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL DEFAULT 'sepolia',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_blockchain_records_review ON blockchain_records(review_id);
CREATE INDEX idx_blockchain_records_tx_hash ON blockchain_records(blockchain_tx_hash);
CREATE INDEX idx_blockchain_records_status ON blockchain_records(status);

-- View: Reviews with blockchain status
CREATE VIEW reviews_with_blockchain AS
SELECT
  r.id as review_id,
  r.tradesman_id,
  r.reviewer_id,
  r.rating,
  r.text,
  r.created_at,
  br.blockchain_tx_hash,
  br.blockchain_review_id,
  br.review_hash,
  br.status as blockchain_status,
  br.confirmed_at,
  CASE WHEN br.id IS NOT NULL THEN true ELSE false END as is_blockchain_recorded
FROM reviews r
LEFT JOIN blockchain_records br ON r.id = br.review_id;
