# 🚀 Quick Start Guide - 5 Minutes to Your First DApp!

Follow these steps to get your StudentToken Faucet running:

## ✅ Step 1: Start Local Blockchain (Terminal 1)

```bash
npx hardhat node
```

**Keep this running!** You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

## ✅ Step 2: Deploy Contract (Terminal 2)

Open a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

**Copy the contract address** from the output!

## ✅ Step 3: Configure MetaMask

### Add Network:
1. Open MetaMask → Networks → Add Network
2. Enter:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency**: `ETH`

### Import Test Account:
1. MetaMask → Import Account
2. Paste private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. You now have 10,000 test ETH! 💰

### Add STC Token:
1. MetaMask → Import Tokens
2. Paste contract address (from Step 2)
3. Symbol auto-fills as "STC"
4. Click "Add"

## ✅ Step 4: Start Frontend (Terminal 3)

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173/`

## ✅ Step 5: Claim Tokens! 🎉

1. Click "Connect Wallet"
2. Click "Claim Free Tokens"
3. Approve in MetaMask
4. Watch your balance increase!

---

## 🎓 You're Done!

You just:
- ✅ Ran a local blockchain
- ✅ Deployed a smart contract
- ✅ Connected a wallet
- ✅ Executed a transaction
- ✅ Claimed ERC20 tokens

**Welcome to Web3!** 🚀

---

## 🐛 Problems?

**"Cannot connect wallet"**
- Make sure MetaMask is on "Hardhat Local" network
- Check Terminal 1 is still running

**"Contract not found"**
- Make sure you ran Step 2 (deploy)
- Check `frontend/src/contracts/` has files

**"Transaction failed"**
- Wait 60 seconds between claims
- Check you have test ETH

**Still stuck?** Check the full [README.md](README.md) for detailed troubleshooting!
