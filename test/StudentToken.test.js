// ============================================================================
// STUDENTTOKEN TESTS
// ============================================================================
// These tests verify that the StudentToken contract works correctly
// Run with: npx hardhat test
// ============================================================================

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StudentToken Faucet", function () {
  let studentToken;
  let owner;
  let user1;
  let user2;

  // Deploy contract before each test
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const StudentToken = await ethers.getContractFactory("StudentToken");
    studentToken = await StudentToken.deploy();
    await studentToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await studentToken.name()).to.equal("StudentToken");
      expect(await studentToken.symbol()).to.equal("STC");
    });

    it("Should have 18 decimals", async function () {
      expect(await studentToken.decimals()).to.equal(18);
    });

    it("Should mint initial supply to deployer", async function () {
      const deployerBalance = await studentToken.balanceOf(owner.address);
      expect(deployerBalance).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Claiming Tokens", function () {
    it("Should allow user to claim tokens", async function () {
      await studentToken.connect(user1).claimTokens();
      
      const balance = await studentToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("10"));
    });

    it("Should emit TokensClaimed event", async function () {
      const tx = await studentToken.connect(user1).claimTokens();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(studentToken, "TokensClaimed")
        .withArgs(user1.address, ethers.parseEther("10"), block.timestamp);
    });

    it("Should update lastClaimed timestamp", async function () {
      await studentToken.connect(user1).claimTokens();
      
      const lastClaimed = await studentToken.lastClaimed(user1.address);
      expect(lastClaimed).to.be.greaterThan(0);
    });

    it("Should fail if claiming too soon", async function () {
      await studentToken.connect(user1).claimTokens();
      
      await expect(
        studentToken.connect(user1).claimTokens()
      ).to.be.revertedWith("Wait 1 minute before claiming again");
    });

    it("Should allow claiming after cooldown period", async function () {
      await studentToken.connect(user1).claimTokens();
      
      // Fast forward 60 seconds
      await time.increase(60);
      
      await studentToken.connect(user1).claimTokens();
      
      const balance = await studentToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("20"));
    });

    it("Should allow multiple users to claim", async function () {
      await studentToken.connect(user1).claimTokens();
      await studentToken.connect(user2).claimTokens();
      
      const balance1 = await studentToken.balanceOf(user1.address);
      const balance2 = await studentToken.balanceOf(user2.address);
      
      expect(balance1).to.equal(ethers.parseEther("10"));
      expect(balance2).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Helper Functions", function () {
    it("Should return correct canClaim status", async function () {
      expect(await studentToken.canClaim(user1.address)).to.be.true;
      
      await studentToken.connect(user1).claimTokens();
      expect(await studentToken.canClaim(user1.address)).to.be.false;
      
      await time.increase(60);
      expect(await studentToken.canClaim(user1.address)).to.be.true;
    });

    it("Should return correct timeUntilNextClaim", async function () {
      expect(await studentToken.timeUntilNextClaim(user1.address)).to.equal(0);
      
      await studentToken.connect(user1).claimTokens();
      
      const timeLeft = await studentToken.timeUntilNextClaim(user1.address);
      expect(timeLeft).to.be.greaterThan(0);
      expect(timeLeft).to.be.lessThanOrEqual(60);
      
      await time.increase(60);
      expect(await studentToken.timeUntilNextClaim(user1.address)).to.equal(0);
    });
  });

  describe("Token Supply", function () {
    it("Should increase total supply when tokens are claimed", async function () {
      const initialSupply = await studentToken.totalSupply();
      
      await studentToken.connect(user1).claimTokens();
      
      const newSupply = await studentToken.totalSupply();
      expect(newSupply).to.equal(initialSupply + ethers.parseEther("10"));
    });
  });
});
