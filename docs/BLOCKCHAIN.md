# Blockchain Integration

tradetrace uses Ethereum smart contracts to record review hashes immutably, proving that reviews cannot be altered after submission.

## Architecture

### Smart Contract: TradetraceReviewRegistry

**Network**: Ethereum Sepolia Testnet (for development/testing)

**Purpose**: Store cryptographic proofs of reviews to prevent tampering

**Key Features**:
- Reviews are recorded as immutable transaction records
- Each review has a Keccak256 hash stored on-chain
- Tradesman owners can dispute reviews (marks as disputed, not deleted for immutability)
- Full audit trail available on-chain

### Data Flow

```
1. Review submitted to API
   ↓
2. Review stored in Postgres database
   ↓
3. Review hash generated: keccak256(tradesman_id + reviewer_email + rating + text)
   ↓
4. Hash recorded on Ethereum smart contract
   ↓
5. Transaction hash stored in blockchain_records table
   ↓
6. Review API response includes blockchain status
```

### Database Schema

**blockchain_records table**:
```sql
CREATE TABLE blockchain_records (
  id SERIAL PRIMARY KEY,
  review_id INTEGER UNIQUE REFERENCES reviews(id),
  blockchain_tx_hash VARCHAR(255) UNIQUE,  -- Ethereum transaction hash
  blockchain_review_id BIGINT UNIQUE,       -- ID assigned by smart contract
  review_hash VARCHAR(255),                 -- Keccak256 hash of review
  contract_address VARCHAR(255),            -- Smart contract address
  network VARCHAR(50),                      -- "sepolia" or "mainnet"
  status VARCHAR(50),                       -- "pending", "confirmed", "failed"
  created_at TIMESTAMP,
  confirmed_at TIMESTAMP
);
```

## Deployment

### 1. Deploy Smart Contract

Compile and deploy `TradetraceReviewRegistry.sol` to Ethereum Sepolia:

```bash
# Using Hardhat
npx hardhat compile
npx hardhat deploy --network sepolia

# Using Foundry
forge build
forge create --network sepolia --private-key $ETH_PRIVATE_KEY contracts/TradetraceReviewRegistry.sol:TradetraceReviewRegistry
```

### 2. Configure Environment

```bash
# .env (never commit private key!)
ETH_CONTRACT_ADDRESS=0x123abc...
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETH_PRIVATE_KEY=0xabc123... # Account must have Sepolia ETH
```

### 3. Get Testnet ETH

Free Sepolia ETH from faucets:
- [Infura Faucet](https://www.infura.io/faucet/sepolia)
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

### 4. Start tradetrace

```bash
docker-compose up
deno task dev
```

Reviews will now be automatically recorded on-chain.

## API Endpoints

### Submit Review (with blockchain recording)

```bash
POST /api/reviews
Content-Type: application/json

{
  "tradesman_id": 1,
  "reviewer_id": 2,
  "rating": 5,
  "text": "Excellent work!"
}
```

**Response**:
```json
{
  "id": 42,
  "tradesman_id": 1,
  "reviewer_id": 2,
  "rating": 5,
  "text": "Excellent work!",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get Review with Blockchain Status

```bash
GET /api/reviews/42/blockchain
```

**Response**:
```json
{
  "id": 5,
  "review_id": 42,
  "blockchain_tx_hash": "0x1234...",
  "blockchain_review_id": 1001,
  "review_hash": "0xabcd...",
  "contract_address": "0x123abc...",
  "network": "sepolia",
  "status": "confirmed",
  "created_at": "2024-01-15T10:31:00Z",
  "confirmed_at": "2024-01-15T10:32:00Z"
}
```

## Verification

### Verify Review on Etherscan

Use the transaction hash to view on-chain proof:

```
https://sepolia.etherscan.io/tx/0x1234...
```

### Verify Review Hash

Check that stored hash matches computed hash:

```bash
# Backend verifies via smart contract's verifyReviewHash()
GET /api/reviews/42/blockchain
# Returns blockchain_record with review_hash

# Compute locally:
const hash = keccak256(abiEncodePacked(
  'uint256', trademan_id,
  'address', reviewer,
  'uint8', rating,
  'string', review_text
));
// Compare with blockchain_record.review_hash
```

## Production Migration

### Mainnet Deployment

1. Deploy to Ethereum mainnet (requires real ETH for gas)
2. Update `ETH_RPC_URL` to mainnet endpoint
3. Set `ETH_PRIVATE_KEY` to mainnet account
4. Update migration to use mainnet network identifier
5. Monitor gas costs (1 review ≈ 0.001-0.01 ETH depending on network)

### Cost Optimization

Current approach (hash-based) costs ~$0.50-2.00 per review on Ethereum mainnet.

**Alternatives for production**:
1. **Polygon** (~$0.01 per review) — cheaper, Ethereum-compatible
2. **Arbitrum** (~$0.02 per review) — faster finality
3. **Optimism** (~$0.03 per review) — cheaper than mainnet
4. **Arweave** (~$0.001 per review) — permanent storage

## Troubleshooting

### Blockchain Recording Failed

If blockchain recording fails, the review is still created in the database (graceful degradation). Check logs:

```bash
docker-compose logs api | grep blockchain
```

### Transaction Pending

Transactions may be pending if gas price is too low. Check on Etherscan:

```
https://sepolia.etherscan.io/address/0x...
```

### Contract Deployment Failed

Ensure:
1. Private key account has testnet ETH
2. RPC URL is correct
3. Contract compiled with Solidity ≥0.8.20

## Future Enhancements

- [ ] Batch record multiple reviews (gas optimization)
- [ ] IPFS integration for full review content
- [ ] Zero-knowledge proofs for privacy
- [ ] Layer 2 scaling (Polygon/Arbitrum)
- [ ] Multi-signature wallet for security
- [ ] Review dispute resolution via smart contract

## References

- [TradetraceReviewRegistry Contract](../contracts/TradetraceReviewRegistry.sol)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io)
- [Solidity Documentation](https://docs.soliditylang.org/en/v0.8.20/)
- [Web3.js Documentation](https://docs.web3js.org/)
