import { logger } from "./logger.ts";
import { keccak256, toBytes } from "https://esm.sh/viem@2.0.0";

// ABI for TradetraceReviewRegistry contract
const REGISTRY_ABI = [
  {
    type: "function",
    name: "recordReview",
    inputs: [
      { name: "tradersmanId", type: "uint256" },
      { name: "reviewHash", type: "bytes32" },
      { name: "reviewer", type: "address" },
      { name: "rating", type: "uint8" },
    ],
    outputs: [{ name: "reviewId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getReview",
    inputs: [{ name: "reviewId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "reviewId", type: "uint256" },
          { name: "tradersmanId", type: "uint256" },
          { name: "reviewHash", type: "bytes32" },
          { name: "reviewer", type: "address" },
          { name: "rating", type: "uint8" },
          { name: "timestamp", type: "uint256" },
          { name: "disputed", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "verifyReviewHash",
    inputs: [
      { name: "reviewId", type: "uint256" },
      { name: "reviewHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ReviewRecorded",
    inputs: [
      { name: "reviewId", type: "uint256", indexed: true },
      { name: "tradersmanId", type: "uint256", indexed: true },
      { name: "reviewHash", type: "bytes32", indexed: true },
      { name: "reviewer", type: "address" },
      { name: "rating", type: "uint8" },
      { name: "timestamp", type: "uint256" },
    ],
  },
];

export interface BlockchainReview {
  reviewId: bigint;
  tradersmanId: bigint;
  reviewHash: string;
  reviewer: string;
  rating: number;
  timestamp: bigint;
  disputed: boolean;
}

export interface ReviewBlockchainRecord {
  dbReviewId: number;
  blockchainTxHash: string;
  blockchainReviewId: number;
  reviewHash: string;
  timestamp: number;
}

let contractAddress: string | null = null;
let rpcUrl: string | null = null;
let privateKey: string | null = null;

export function initializeBlockchain(
  contract: string,
  rpc: string,
  privKey: string,
): void {
  contractAddress = contract;
  rpcUrl = rpc;
  privateKey = privKey;
  logger.info("Blockchain service initialized", {
    contract: contractAddress,
    network: "sepolia",
  });
}

/**
 * Generate cryptographic hash of review content
 * Matches keccak256(abi.encodePacked(...)) used in smart contract
 */
export function generateReviewHash(
  tradersmanId: number,
  reviewerEmail: string,
  rating: number,
  text: string,
): string {
  const data = `${tradersmanId}:${reviewerEmail}:${rating}:${text}`;
  const hashBytes = keccak256(toBytes(data));
  return hashBytes;
}

/**
 * Record review on blockchain (mock for now, would use ethers.js/viem in production)
 * This demonstrates the integration pattern
 */
export async function recordReviewOnBlockchain(
  tradersmanId: number,
  reviewHash: string,
  reviewerAddress: string,
  rating: number,
): Promise<ReviewBlockchainRecord> {
  if (!contractAddress || !rpcUrl || !privateKey) {
    throw new Error("Blockchain not initialized");
  }

  // In production, this would:
  // 1. Create transaction to call recordReview()
  // 2. Sign with private key
  // 3. Send to Ethereum Sepolia testnet
  // 4. Wait for confirmation
  // 5. Return tx hash and block receipt

  // For now, return mock record demonstrating structure
  const mockTxHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const mockReviewId = Math.floor(Math.random() * 1000000);

  logger.info("Review recorded on blockchain", {
    tradersmanId,
    reviewHash,
    txHash: mockTxHash,
    blockchainReviewId: mockReviewId,
  });

  return {
    dbReviewId: 0, // Will be set by caller
    blockchainTxHash: mockTxHash,
    blockchainReviewId: mockReviewId,
    reviewHash,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

/**
 * Verify review exists and hash matches on-chain record
 */
export async function verifyReviewOnBlockchain(
  reviewId: number,
  reviewHash: string,
): Promise<boolean> {
  if (!contractAddress || !rpcUrl) {
    throw new Error("Blockchain not initialized");
  }

  // In production, would:
  // 1. Call verifyReviewHash() on contract
  // 2. Parse response
  // 3. Return boolean

  logger.debug("Verifying review on blockchain", { reviewId, reviewHash });
  return true; // Mock implementation
}

/**
 * Get review record from blockchain
 */
export async function getBlockchainReview(
  reviewId: number,
): Promise<BlockchainReview | null> {
  if (!contractAddress || !rpcUrl) {
    throw new Error("Blockchain not initialized");
  }

  // In production, would call getReview() and parse tuple response
  logger.debug("Fetching review from blockchain", { reviewId });
  return null; // Mock implementation
}
