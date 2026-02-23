// ============================================================================
// DEPLOYMENT SCRIPT FOR STUDENTTOKEN FAUCET
// ============================================================================
// This script deploys the StudentToken contract to the blockchain
// It will run when you execute: npx hardhat run scripts/deploy.js
// ============================================================================

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Starting StudentToken Faucet Deployment...\n");

  // STEP 1: Get the deployer's wallet address
  // The deployer is the account that will deploy the contract
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contract with account:", deployer.address);
  
  // Check deployer's balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // STEP 2: Get the contract factory
  // This prepares the contract for deployment
  console.log("📦 Preparing StudentToken contract...");
  const StudentToken = await hre.ethers.getContractFactory("StudentToken");

  // STEP 3: Deploy the contract
  // This sends a transaction to create the contract on the blockchain
  console.log("⏳ Deploying contract to network...");
  const studentToken = await StudentToken.deploy();
  
  // Wait for the deployment transaction to be mined
  await studentToken.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await studentToken.getAddress();

  console.log("\n✅ StudentToken deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  
  // STEP 4: Display token information
  const name = await studentToken.name();
  const symbol = await studentToken.symbol();
  const decimals = await studentToken.decimals();
  const totalSupply = await studentToken.totalSupply();
  
  console.log("\n📊 Token Information:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals.toString());
  console.log("   Initial Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("   Tokens per Claim:", "10", symbol);
  console.log("   Claim Cooldown:", "60 seconds (1 minute)");

  // STEP 5: Save contract address and ABI for frontend
  // The frontend needs this information to interact with the contract
  console.log("\n💾 Saving contract info for frontend...");
  
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save contract address
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ StudentToken: contractAddress }, null, 2)
  );

  // Get and save the contract ABI (Application Binary Interface)
  // ABI tells the frontend how to interact with the contract
  const artifact = await hre.artifacts.readArtifact("StudentToken");
  fs.writeFileSync(
    path.join(contractsDir, "StudentToken.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("✅ Contract info saved to frontend/src/contracts/");

  // STEP 6: Display instructions for students
  console.log("\n" + "=".repeat(70));
  console.log("🎓 NEXT STEPS FOR STUDENTS");
  console.log("=".repeat(70));
  console.log("\n1️⃣  Add token to MetaMask:");
  console.log("   - Open MetaMask");
  console.log("   - Click 'Import tokens'");
  console.log("   - Paste contract address:", contractAddress);
  console.log("   - Token symbol should auto-fill as 'STC'");
  console.log("   - Click 'Add Custom Token'");
  
  console.log("\n2️⃣  Start the frontend:");
  console.log("   cd frontend");
  console.log("   npm install");
  console.log("   npm run dev");
  
  console.log("\n3️⃣  Connect your wallet and claim tokens!");
  console.log("   - Open the app in your browser");
  console.log("   - Click 'Connect Wallet'");
  console.log("   - Click 'Claim Free Tokens'");
  console.log("   - Approve the transaction in MetaMask");
  console.log("   - Watch your STC balance increase! 🎉");
  
  console.log("\n" + "=".repeat(70));
  console.log("✨ Deployment Complete! Happy Learning! ✨");
  console.log("=".repeat(70) + "\n");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
