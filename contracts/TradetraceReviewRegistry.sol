// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TradetraceReviewRegistry
 * @dev Immutable registry for tradesman reviews on Ethereum
 * Stores cryptographic proofs of reviews to prevent tampering
 */
contract TradetraceReviewRegistry {
  // Review structure stored on-chain
  struct ReviewRecord {
    uint256 reviewId;
    uint256 tradersmanId;
    bytes32 reviewHash;
    address reviewer;
    uint8 rating;
    uint256 timestamp;
    bool disputed;
  }

  // Mapping: reviewId => ReviewRecord
  mapping(uint256 => ReviewRecord) public reviews;

  // Mapping: tradersmanId => reviewIds
  mapping(uint256 => uint256[]) public tradersmanReviews;

  // Event emitted when review is recorded
  event ReviewRecorded(
    uint256 indexed reviewId,
    uint256 indexed tradersmanId,
    bytes32 indexed reviewHash,
    address reviewer,
    uint8 rating,
    uint256 timestamp
  );

  // Event emitted when review is disputed
  event ReviewDisputed(uint256 indexed reviewId, address indexed disputer);

  // Counter for review IDs
  uint256 private reviewCounter = 0;

  // Owner of the contract
  address public owner;

  // Mapping: tradersmanId => owner address (can dispute reviews)
  mapping(uint256 => address) public tradersmanOwners;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  modifier onlyTradersmanOwner(uint256 tradersmanId) {
    require(
      msg.sender == tradersmanOwners[tradersmanId],
      "Only tradesman owner can call this function"
    );
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  /**
   * @dev Register a new review on the blockchain
   * @param tradersmanId ID of the tradesman being reviewed
   * @param reviewHash Keccak256 hash of the review content
   * @param reviewer Address of the reviewer
   * @param rating Rating (1-5)
   * @return reviewId ID of the recorded review
   */
  function recordReview(
    uint256 tradersmanId,
    bytes32 reviewHash,
    address reviewer,
    uint8 rating
  ) external onlyOwner returns (uint256) {
    require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
    require(reviewHash != bytes32(0), "Review hash cannot be empty");

    reviewCounter++;
    uint256 reviewId = reviewCounter;

    reviews[reviewId] = ReviewRecord({
      reviewId: reviewId,
      tradersmanId: tradersmanId,
      reviewHash: reviewHash,
      reviewer: reviewer,
      rating: rating,
      timestamp: block.timestamp,
      disputed: false
    });

    tradersmanReviews[tradersmanId].push(reviewId);

    emit ReviewRecorded(reviewId, tradersmanId, reviewHash, reviewer, rating, block.timestamp);

    return reviewId;
  }

  /**
   * @dev Get review record by ID
   * @param reviewId ID of the review
   * @return ReviewRecord struct
   */
  function getReview(uint256 reviewId) external view returns (ReviewRecord memory) {
    return reviews[reviewId];
  }

  /**
   * @dev Get all review IDs for a tradesman
   * @param tradersmanId ID of the tradesman
   * @return Array of review IDs
   */
  function getTradersmanReviews(uint256 tradersmanId)
    external
    view
    returns (uint256[] memory)
  {
    return tradersmanReviews[tradersmanId];
  }

  /**
   * @dev Verify a review hash matches stored record
   * @param reviewId ID of the review
   * @param reviewHash Hash to verify
   * @return true if hash matches stored record
   */
  function verifyReviewHash(uint256 reviewId, bytes32 reviewHash)
    external
    view
    returns (bool)
  {
    return reviews[reviewId].reviewHash == reviewHash;
  }

  /**
   * @dev Register a tradesman owner (for dispute resolution)
   * @param tradersmanId ID of the tradesman
   * @param ownerAddress Address of the tradesman owner
   */
  function registerTradersmanOwner(uint256 tradersmanId, address ownerAddress)
    external
    onlyOwner
  {
    tradersmanOwners[tradersmanId] = ownerAddress;
  }

  /**
   * @dev Dispute a review (mark as disputed, not deleted for immutability)
   * @param reviewId ID of the review to dispute
   */
  function disputeReview(uint256 reviewId)
    external
    onlyTradersmanOwner(reviews[reviewId].tradersmanId)
  {
    require(reviews[reviewId].reviewId != 0, "Review does not exist");
    require(!reviews[reviewId].disputed, "Review already disputed");

    reviews[reviewId].disputed = true;
    emit ReviewDisputed(reviewId, msg.sender);
  }

  /**
   * @dev Get total number of reviews recorded
   * @return Total review count
   */
  function getReviewCount() external view returns (uint256) {
    return reviewCounter;
  }
}
