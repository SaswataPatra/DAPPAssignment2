// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================================
// EDUCATIONAL ERC20 TOKEN FAUCET
// ============================================================================
// This contract demonstrates how ERC20 tokens work on the blockchain.
// Students will learn about:
// - Token creation and minting
// - Wallet addresses and balances
// - Smart contract functions
// - Time-based restrictions
// - Blockchain events
// ============================================================================

// Import OpenZeppelin's ERC20 implementation
// OpenZeppelin provides secure, tested implementations of token standards
// ERC20 is a standard interface for fungible tokens (like coins/currency)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title StudentToken
 * @dev Educational ERC20 token with a faucet for students to claim free tokens
 * 
 * WHAT IS AN ERC20 TOKEN?
 * - ERC20 is a standard for creating tokens on Ethereum
 * - Tokens are like digital coins that can be transferred between wallets
 * - They have a name, symbol, and can be divided into smaller units (decimals)
 * 
 * WHAT IS A FAUCET?
 * - A faucet gives away free tokens for testing/learning
 * - Users can claim tokens without having to buy them
 * - Perfect for educational purposes!
 */
contract StudentToken is ERC20 {
    
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================
    // These variables are stored permanently on the blockchain
    
    /**
     * @dev Tracks the last time each wallet claimed tokens
     * 
     * WHAT IS A MAPPING?
     * - Like a dictionary or lookup table
     * - Key: wallet address → Value: timestamp
     * - Allows us to check when someone last claimed tokens
     * 
     * WHAT IS AN ADDRESS?
     * - A unique identifier for a wallet (like 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
     * - Every user has their own address
     * 
     * WHAT IS uint256?
     * - An unsigned integer (positive whole number)
     * - Can store very large numbers
     * - Used here to store Unix timestamps (seconds since 1970)
     */
    mapping(address => uint256) public lastClaimed;
    
    /**
     * @dev How long users must wait between claims (in seconds)
     * 60 seconds = 1 minute
     * 
     * WHY HAVE A COOLDOWN?
     * - Prevents abuse (users claiming too many tokens)
     * - Teaches about blockchain time and restrictions
     * - Makes the faucet fair for everyone
     */
    uint256 public constant CLAIM_COOLDOWN = 60; // 1 minute
    
    /**
     * @dev How many tokens to give per claim
     * 10 * 10^18 = 10 tokens (because decimals = 18)
     * 
     * WHY MULTIPLY BY 10^18?
     * - Tokens can be divided into tiny pieces (like cents in a dollar)
     * - 18 decimals is standard for ERC20 tokens
     * - 1 token = 1,000,000,000,000,000,000 smallest units
     * - This allows for precise calculations
     */
    uint256 public constant TOKENS_PER_CLAIM = 10 * 10**18; // 10 STC tokens
    
    // ========================================================================
    // EVENTS
    // ========================================================================
    // Events are like notifications that get recorded on the blockchain
    // They help track what happened in the contract
    
    /**
     * @dev Emitted when someone claims tokens from the faucet
     * 
     * WHAT ARE EVENTS?
     * - Logs that are stored on the blockchain
     * - Can be read by frontend applications
     * - Help track contract activity
     * - Cannot be modified once emitted
     * 
     * PARAMETERS:
     * @param claimer - The wallet address that claimed tokens
     * @param amount - How many tokens were claimed
     * @param timestamp - When the claim happened
     */
    event TokensClaimed(
        address indexed claimer,
        uint256 amount,
        uint256 timestamp
    );
    
    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    // Runs ONCE when the contract is deployed to the blockchain
    
    /**
     * @dev Initializes the token with name and symbol
     * 
     * WHAT HAPPENS HERE?
     * 1. Creates the token with name "StudentToken" and symbol "STC"
     * 2. Mints 1,000,000 tokens to the deployer's wallet
     * 3. Sets up the contract for use
     * 
     * WHAT IS msg.sender?
     * - The wallet address that called this function
     * - In constructor: the person deploying the contract
     * - In other functions: the person calling that function
     * - This is how blockchain knows WHO is interacting
     */
    constructor() ERC20("StudentToken", "STC") {
        // Mint initial supply to the contract deployer
        // This gives the deployer 1 million tokens to start
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    // ========================================================================
    // FAUCET FUNCTION
    // ========================================================================
    // This is the main function students will interact with
    
    /**
     * @dev Allows users to claim free tokens from the faucet
     * 
     * HOW IT WORKS:
     * 1. Check if user has waited long enough since last claim
     * 2. Mint new tokens to the user's wallet
     * 3. Record the current time as their last claim time
     * 4. Emit an event to log the claim
     * 
     * WHAT IS 'external'?
     * - Means this function can be called from outside the contract
     * - Users can call it from their wallet or a website
     * 
     * WHAT IS 'require'?
     * - A safety check that must pass or the transaction fails
     * - If it fails, all changes are reverted (undone)
     * - Protects the contract from invalid operations
     */
    function claimTokens() external {
        // STEP 1: Check if enough time has passed since last claim
        // block.timestamp = current time on the blockchain (in seconds)
        require(
            block.timestamp >= lastClaimed[msg.sender] + CLAIM_COOLDOWN,
            "Wait 1 minute before claiming again"
        );
        
        // STEP 2: Mint (create) new tokens and send to the caller
        // _mint is from OpenZeppelin's ERC20 contract
        // It increases the total supply and the user's balance
        _mint(msg.sender, TOKENS_PER_CLAIM);
        
        // STEP 3: Update the last claimed time for this user
        // This prevents them from claiming again too soon
        lastClaimed[msg.sender] = block.timestamp;
        
        // STEP 4: Emit an event to record this claim
        // This creates a permanent log on the blockchain
        // Frontend apps can listen for this event
        emit TokensClaimed(msg.sender, TOKENS_PER_CLAIM, block.timestamp);
    }
    
    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================
    // Additional functions to help users interact with the contract
    
    /**
     * @dev Check how long until a user can claim again
     * 
     * WHAT IS 'view'?
     * - Means this function only READS data, doesn't change anything
     * - View functions are FREE (no gas cost)
     * - Perfect for checking information
     * 
     * @param user The wallet address to check
     * @return seconds until next claim (0 if can claim now)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimed[user] + CLAIM_COOLDOWN;
        
        // If enough time has passed, return 0 (can claim now)
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        
        // Otherwise, return how many seconds left to wait
        return nextClaimTime - block.timestamp;
    }
    
    /**
     * @dev Check if a user can claim tokens right now
     * 
     * @param user The wallet address to check
     * @return true if user can claim, false if they must wait
     */
    function canClaim(address user) external view returns (bool) {
        return block.timestamp >= lastClaimed[user] + CLAIM_COOLDOWN;
    }
}

// ============================================================================
// KEY CONCEPTS SUMMARY FOR STUDENTS
// ============================================================================
//
// 1. BLOCKCHAIN BASICS:
//    - Blockchain is a permanent, public ledger
//    - Transactions are recorded forever
//    - Anyone can verify what happened
//
// 2. SMART CONTRACTS:
//    - Code that runs on the blockchain
//    - Cannot be changed after deployment
//    - Executes automatically when called
//
// 3. GAS FEES:
//    - Every transaction costs "gas" (paid in ETH)
//    - Gas pays for computation on the network
//    - Reading data is free, writing data costs gas
//
// 4. WALLET ADDRESSES:
//    - Your unique identifier on the blockchain
//    - Like a bank account number
//    - Controls your tokens and assets
//
// 5. TRANSACTIONS:
//    - Actions that change blockchain state
//    - Must be signed by your wallet
//    - Take time to be confirmed (mined into a block)
//
// 6. ERC20 TOKENS:
//    - Standard for creating tokens
//    - Can be transferred between wallets
//    - Have balances tracked by the contract
//
// ============================================================================
