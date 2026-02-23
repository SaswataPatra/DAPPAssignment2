// Quick script to check token balance
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const accountToCheck = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  console.log("\n🔍 Checking StudentToken Balance...\n");
  console.log("Contract:", contractAddress);
  console.log("Account:", accountToCheck);
  
  const StudentToken = await hre.ethers.getContractAt("StudentToken", contractAddress);
  
  // Get token info
  const name = await StudentToken.name();
  const symbol = await StudentToken.symbol();
  const decimals = await StudentToken.decimals();
  const totalSupply = await StudentToken.totalSupply();
  
  console.log("\n📊 Token Info:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals.toString());
  console.log("  Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  
  // Get balance
  const balance = await StudentToken.balanceOf(accountToCheck);
  console.log("\n💰 Balance:");
  console.log("  Raw:", balance.toString());
  console.log("  Formatted:", hre.ethers.formatEther(balance), symbol);
  
  console.log("\n✅ Done!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
