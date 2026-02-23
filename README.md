# 🎓 StudentToken Faucet - Educational ERC20 DApp

A simple, educational decentralized application (DApp) designed to teach students about ERC20 tokens, smart contracts, and blockchain interactions.

## 📚 What You'll Learn

This project demonstrates:

- **ERC20 Tokens**: Standard for creating fungible tokens on Ethereum
- **Smart Contracts**: Self-executing code on the blockchain
- **Wallet Integration**: Connecting MetaMask to a DApp
- **Blockchain Transactions**: Sending and confirming transactions
- **Gas Fees**: Understanding transaction costs
- **Events**: Logging and tracking blockchain activity
- **Web3 Development**: Building frontend apps that interact with smart contracts

## 🎯 Project Overview

**StudentToken (STC)** is an ERC20 token with a built-in faucet that allows users to claim free tokens for learning purposes.

### Features

- ✅ Claim 10 free STC tokens
- ✅ 1-minute cooldown between claims
- ✅ Real-time balance updates
- ✅ Transaction status tracking
- ✅ Educational comments throughout the code
- ✅ Clean, modern UI

## 🛠️ Technology Stack

### Smart Contract
- **Solidity** ^0.8.20
- **OpenZeppelin** ERC20 implementation
- **Hardhat** development environment

### Frontend
- **React** with Vite
- **ethers.js** v6 for blockchain interaction
- **MetaMask** for wallet connection

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MetaMask** browser extension - [Install](https://metamask.io/)
3. **Git** (optional) - [Download](https://git-scm.com/)

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start Local Blockchain

Open a new terminal and run:

```bash
npx hardhat node
```

This starts a local Ethereum network on `http://127.0.0.1:8545/`

**Keep this terminal running!** It simulates a blockchain on your computer.

You'll see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

### Step 3: Configure MetaMask

1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
5. Click "Save"

### Step 4: Import Test Account

To get test ETH for transactions:

1. In MetaMask, click the account icon (top right)
2. Select "Import Account"
3. Paste this private key from Hardhat:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Import"

**⚠️ IMPORTANT**: This is a test account. NEVER use this private key on mainnet!

### Step 5: Deploy Smart Contract

Open a new terminal and run:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

You should see output like:

```
🚀 Starting StudentToken Faucet Deployment...

📝 Deploying contract with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Account balance: 10000.0 ETH

✅ StudentToken deployed successfully!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📊 Token Information:
   Name: StudentToken
   Symbol: STC
   Decimals: 18
   Initial Supply: 1000000.0 STC
   Tokens per Claim: 10 STC
   Claim Cooldown: 60 seconds (1 minute)
```

**Copy the contract address** - you'll need it!

### Step 6: Add STC Token to MetaMask

1. Open MetaMask
2. Make sure you're on "Hardhat Local" network
3. Click "Import tokens" (at the bottom)
4. Paste the contract address from Step 5
5. Token symbol should auto-fill as "STC"
6. Click "Add Custom Token"
7. Click "Import Tokens"

You should now see STC in your token list!

### Step 7: Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

The app will start at `http://localhost:5173/`

### Step 8: Use the DApp!

1. Open `http://localhost:5173/` in your browser
2. Click "Connect Wallet"
3. Approve the connection in MetaMask
4. Click "Claim Free Tokens"
5. Confirm the transaction in MetaMask
6. Wait a few seconds for confirmation
7. Watch your STC balance increase! 🎉

## 📖 Understanding the Code

### Smart Contract (`contracts/StudentToken.sol`)

The contract has three main components:

#### 1. State Variables
```solidity
mapping(address => uint256) public lastClaimed;  // Tracks claim times
uint256 public constant CLAIM_COOLDOWN = 60;     // 1 minute wait
uint256 public constant TOKENS_PER_CLAIM = 10 * 10**18;  // 10 tokens
```

#### 2. Claim Function
```solidity
function claimTokens() external {
    require(
        block.timestamp >= lastClaimed[msg.sender] + CLAIM_COOLDOWN,
        "Wait before claiming again"
    );
    _mint(msg.sender, TOKENS_PER_CLAIM);
    lastClaimed[msg.sender] = block.timestamp;
    emit TokensClaimed(msg.sender, TOKENS_PER_CLAIM, block.timestamp);
}
```

**What happens:**
1. Checks if enough time has passed
2. Mints (creates) new tokens
3. Updates last claim time
4. Emits an event

#### 3. Helper Functions
```solidity
function canClaim(address user) external view returns (bool)
function timeUntilNextClaim(address user) external view returns (uint256)
```

These are "view" functions - they only read data (no gas cost).

### Frontend (`frontend/src/App.jsx`)

Key functions:

#### Connect Wallet
```javascript
const connectWallet = async () => {
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
    });
    setAccount(accounts[0]);
}
```

#### Claim Tokens
```javascript
const claimTokens = async () => {
    const tx = await contract.claimTokens();  // Send transaction
    await tx.wait();  // Wait for confirmation
    await loadBalance();  // Refresh balance
}
```

#### Read Balance
```javascript
const loadBalance = async () => {
    const balance = await contract.balanceOf(account);
    const formatted = ethers.formatEther(balance);
    setBalance(formatted);
}
```

## 🔍 Key Concepts Explained

### What is a Blockchain?

A blockchain is a distributed ledger (database) that records transactions across many computers. Once data is recorded, it cannot be changed retroactively.

### What is a Smart Contract?

A smart contract is code that runs on the blockchain. It:
- Executes automatically when conditions are met
- Cannot be changed after deployment
- Is transparent (anyone can verify the code)
- Doesn't require intermediaries

### What is ERC20?

ERC20 is a standard for creating tokens on Ethereum. All ERC20 tokens have the same basic functions:
- `balanceOf(address)` - Check token balance
- `transfer(to, amount)` - Send tokens
- `approve(spender, amount)` - Allow someone to spend your tokens
- `transferFrom(from, to, amount)` - Transfer on behalf of someone

### What is msg.sender?

`msg.sender` is a special variable in Solidity that represents the address calling the function. It's how the blockchain knows WHO is interacting with the contract.

### What are Gas Fees?

Gas is the fee required to execute a transaction on Ethereum. It:
- Pays for computation on the network
- Prevents spam and infinite loops
- Is paid in ETH
- Varies based on network congestion

**Reading data is FREE, writing data costs gas.**

### What is a Transaction?

A transaction is an action that changes the blockchain state. It:
- Must be signed by your private key
- Costs gas
- Takes time to be confirmed (mined into a block)
- Is permanent once confirmed

### What are Events?

Events are logs emitted by smart contracts. They:
- Record important actions
- Can be read by frontend applications
- Are cheaper than storing data in variables
- Cannot be accessed by other contracts

## 🎯 Learning Exercises

Try these challenges to deepen your understanding:

### Beginner
1. ✅ Claim tokens and watch the transaction in MetaMask
2. ✅ Try claiming again immediately (should fail)
3. ✅ Wait 60 seconds and claim again
4. ✅ Check your balance in MetaMask

### Intermediate
1. 🔧 Modify the cooldown time to 30 seconds
2. 🔧 Change the tokens per claim to 5 STC
3. 🔧 Add a function to check total tokens claimed by all users
4. 🔧 Customize the frontend colors

### Advanced
1. 🚀 Add a maximum claim limit per address
2. 🚀 Implement a referral system
3. 🚀 Add an admin function to pause the faucet
4. 🚀 Create a leaderboard of top claimers

## 📁 Project Structure

```
DAPP1/
├── contracts/
│   ├── StudentToken.sol          # ERC20 token with faucet
│   └── Lock.sol                  # (Hardhat default, can delete)
├── scripts/
│   └── deploy.js                 # Deployment script
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── App.css              # Styles
│   │   ├── contracts/           # Contract ABI & address (auto-generated)
│   │   │   ├── StudentToken.json
│   │   │   └── contract-address.json
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.js             # Hardhat configuration
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### "Cannot read properties of undefined"
- Make sure you deployed the contract first
- Check that contract files exist in `frontend/src/contracts/`

### "Nonce too high" error
- Reset your MetaMask account: Settings → Advanced → Clear activity tab data

### "Insufficient funds" error
- Make sure you imported the test account with 10000 ETH
- Check you're on the Hardhat Local network

### Frontend won't connect
- Ensure Hardhat node is running (`npx hardhat node`)
- Check MetaMask is on the correct network (Hardhat Local)
- Try refreshing the page

### Transaction fails
- Check the console (F12) for detailed error messages
- Make sure you waited 60 seconds between claims
- Verify you have enough ETH for gas

## 🔒 Security Notes

**This is an educational project. DO NOT use in production without:**

1. ✅ Comprehensive security audits
2. ✅ Rate limiting mechanisms
3. ✅ Access controls
4. ✅ Proper testing
5. ✅ Gas optimization

**NEVER:**
- ❌ Use test private keys on mainnet
- ❌ Share your real private keys
- ❌ Deploy without testing
- ❌ Store private keys in code

## 📚 Additional Resources

### Learn More
- [Ethereum.org](https://ethereum.org/en/developers/docs/) - Official Ethereum docs
- [Solidity Docs](https://docs.soliditylang.org/) - Solidity documentation
- [OpenZeppelin](https://docs.openzeppelin.com/) - Secure contract library
- [ethers.js](https://docs.ethers.org/) - Ethereum library documentation
- [Hardhat](https://hardhat.org/docs) - Development environment

### Video Tutorials
- [Ethereum Explained](https://www.youtube.com/watch?v=jxLkbJozKbY)
- [Smart Contracts Tutorial](https://www.youtube.com/watch?v=M576WGiDBdQ)
- [Web3 Development Course](https://www.youtube.com/watch?v=gyMwXuJrbJQ)

## 🤝 Contributing

This is an educational project. Feel free to:
- Report issues
- Suggest improvements
- Add more educational comments
- Create additional learning exercises

## 📄 License

MIT License - feel free to use this for educational purposes!

## 🎉 Congratulations!

You've successfully built and deployed your first DApp! You now understand:

✅ How ERC20 tokens work  
✅ How to write smart contracts  
✅ How to deploy to a blockchain  
✅ How to build a Web3 frontend  
✅ How wallets interact with DApps  
✅ How transactions work  

Keep learning and building! 🚀

---

**Built with ❤️ for education**

Questions? Check the code comments - they're designed to teach!
