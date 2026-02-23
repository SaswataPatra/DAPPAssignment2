// ============================================================================
// STUDENTTOKEN FAUCET - EDUCATIONAL DAPP
// ============================================================================
// This React app demonstrates how to interact with a smart contract
// Students will learn about:
// - Connecting a wallet (MetaMask)
// - Reading data from blockchain
// - Sending transactions
// - Handling blockchain events
// ============================================================================

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Import contract ABI and address (will be created after deployment)
// ABI = Application Binary Interface (tells us how to interact with the contract)
// Note: Using dynamic import because Vite uses ES modules, not CommonJS
let StudentTokenABI, contractAddress;

// We'll load these dynamically in the component
const loadContractData = async () => {
  try {
    const tokenData = await import('./contracts/StudentToken.json');
    const addressData = await import('./contracts/contract-address.json');
    
    StudentTokenABI = tokenData.abi;
    contractAddress = addressData.StudentToken;
    
    console.log('✅ Contract files loaded successfully!');
    console.log('📍 Contract Address:', contractAddress);
    console.log('📄 ABI loaded:', StudentTokenABI ? 'Yes' : 'No');
    
    return { abi: StudentTokenABI, address: contractAddress };
  } catch (error) {
    console.error('❌ Contract files not found!');
    console.error('Error:', error.message);
    console.log('⚠️ Please deploy the contract first: npx hardhat run scripts/deploy.js --network localhost');
    return null;
  }
};

function App() {
  // ========================================================================
  // STATE VARIABLES
  // ========================================================================
  // React state to track the app's current status
  
  const [account, setAccount] = useState(null);              // Connected wallet address
  const [balance, setBalance] = useState('0');               // User's STC token balance
  const [isLoading, setIsLoading] = useState(false);         // Loading state for transactions
  const [message, setMessage] = useState('');                // Status messages
  const [canClaim, setCanClaim] = useState(true);            // Whether user can claim now
  const [timeUntilClaim, setTimeUntilClaim] = useState(0);   // Seconds until next claim
  const [contract, setContract] = useState(null);            // Contract instance
  const [contractData, setContractData] = useState(null);    // Contract ABI and address
  
  // Load contract data on mount
  useEffect(() => {
    console.log('📦 Loading contract data...');
    loadContractData().then(data => {
      if (data) {
        setContractData(data);
        StudentTokenABI = data.abi;
        contractAddress = data.address;
      }
    });
  }, []);

  // ========================================================================
  // CONNECT WALLET
  // ========================================================================
  // This function connects to the user's MetaMask wallet
  
  const connectWallet = async () => {
    console.log('\n🔌 === CONNECT WALLET STARTED ===');
    try {
      // Check if MetaMask is installed
      // window.ethereum is injected by MetaMask browser extension
      if (!window.ethereum) {
        console.error('❌ MetaMask not found!');
        setMessage('❌ Please install MetaMask to use this DApp!');
        return;
      }
      console.log('✅ MetaMask detected');

      setIsLoading(true);
      setMessage('🔌 Connecting to MetaMask...');

      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🌐 Current Chain ID:', chainId, '(Expected: 0x7a69 for Hardhat Local)');
      
      if (chainId !== '0x7a69') {
        console.warn('⚠️ WARNING: Not on Hardhat Local network (Chain ID: 31337 / 0x7a69)');
        console.warn('Current network:', chainId);
        setMessage('⚠️ Please switch to Hardhat Local network (Chain ID: 31337)');
      }

      // Request account access from MetaMask
      // This will open a MetaMask popup asking user to connect
      console.log('📝 Requesting accounts from MetaMask...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Get the first account (wallet address)
      const userAccount = accounts[0];
      console.log('✅ Account connected:', userAccount);
      setAccount(userAccount);
      setMessage(`✅ Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`);

      // Initialize contract connection
      console.log('🔗 Initializing contract connection...');
      await initializeContract(userAccount);

      setIsLoading(false);
      console.log('✅ === CONNECT WALLET COMPLETED ===\n');
    } catch (error) {
      console.error('❌ === CONNECT WALLET FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      setMessage('❌ Failed to connect wallet: ' + error.message);
      setIsLoading(false);
    }
  };

  // ========================================================================
  // INITIALIZE CONTRACT
  // ========================================================================
  // Sets up the connection to the smart contract
  
  const initializeContract = async (userAccount) => {
    console.log('\n🔗 === INITIALIZE CONTRACT STARTED ===');
    try {
      // Wait for contract data to load if not already loaded
      let abi = StudentTokenABI;
      let address = contractAddress;
      
      if (!abi || !address) {
        console.log('⏳ Contract data not loaded yet, loading now...');
        const data = await loadContractData();
        if (!data) {
          console.error('❌ Failed to load contract data!');
          setMessage('⚠️ Contract not deployed. Please run: npx hardhat run scripts/deploy.js --network localhost');
          return;
        }
        abi = data.abi;
        address = data.address;
        StudentTokenABI = abi;
        contractAddress = address;
        setContractData(data);
      }
      
      if (!address || !abi) {
        console.error('❌ Contract address or ABI missing!');
        console.log('Contract Address:', address);
        console.log('ABI exists:', !!abi);
        setMessage('⚠️ Contract not deployed. Please run: npx hardhat run scripts/deploy.js --network localhost');
        return;
      }

      console.log('📍 Using Contract Address:', address);
      console.log('👤 User Account:', userAccount);

      // Create a provider to read from the blockchain
      // Provider = connection to the blockchain network
      console.log('🌐 Creating provider...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get network info
      const network = await provider.getNetwork();
      console.log('🌐 Connected to network:', {
        name: network.name,
        chainId: network.chainId.toString()
      });
      
      // Create a signer to send transactions
      // Signer = account that can sign and send transactions
      console.log('✍️ Getting signer...');
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      console.log('✅ Signer address:', signerAddress);
      
      // Create contract instance
      // This allows us to call contract functions
      console.log('📄 Creating contract instance...');
      const tokenContract = new ethers.Contract(
        address,
        abi,
        signer
      );

      // Test contract connection
      console.log('🧪 Testing contract connection...');
      try {
        const name = await tokenContract.name();
        const symbol = await tokenContract.symbol();
        const decimals = await tokenContract.decimals();
        console.log('✅ Contract connected successfully!');
        console.log('📊 Token Info:', { name, symbol, decimals: decimals.toString() });
      } catch (testError) {
        console.error('❌ Contract connection test failed!');
        console.error('This usually means:');
        console.error('1. Hardhat node is not running');
        console.error('2. Contract not deployed to this network');
        console.error('3. Wrong contract address');
        throw testError;
      }

      setContract(tokenContract);
      console.log('✅ Contract instance saved to state');

      // Load initial data
      console.log('📊 Loading initial data...');
      await loadBalance(tokenContract, userAccount);
      await checkClaimStatus(tokenContract, userAccount);

      // Listen for TokensClaimed events
      // This updates the UI when tokens are claimed
      console.log('👂 Setting up event listener for TokensClaimed...');
      tokenContract.on('TokensClaimed', (claimer, amount, timestamp) => {
        console.log('🎉 TokensClaimed event received!', {
          claimer,
          amount: ethers.formatEther(amount),
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString()
        });
        if (claimer.toLowerCase() === userAccount.toLowerCase()) {
          console.log('✅ Event is for current user, refreshing data...');
          loadBalance(tokenContract, userAccount);
          checkClaimStatus(tokenContract, userAccount);
        }
      });

      console.log('✅ === INITIALIZE CONTRACT COMPLETED ===\n');
    } catch (error) {
      console.error('❌ === INITIALIZE CONTRACT FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setMessage('❌ Error connecting to contract: ' + error.message);
    }
  };

  // ========================================================================
  // LOAD BALANCE
  // ========================================================================
  // Reads the user's token balance from the blockchain
  
  const loadBalance = async (tokenContract, userAccount) => {
    console.log('\n💰 === LOAD BALANCE STARTED ===');
    console.log('Account:', userAccount);
    try {
      // Call balanceOf function on the contract
      // This is a READ operation (free, no gas cost)
      console.log('📞 Calling balanceOf...');
      const balance = await tokenContract.balanceOf(userAccount);
      console.log('✅ Balance received (raw):', balance.toString());
      
      // Convert from wei (smallest unit) to tokens
      // formatEther converts 18 decimal places to human-readable format
      const formattedBalance = ethers.formatEther(balance);
      console.log('✅ Balance (formatted):', formattedBalance, 'STC');
      setBalance(formattedBalance);

      console.log('✅ === LOAD BALANCE COMPLETED ===\n');
    } catch (error) {
      console.error('❌ === LOAD BALANCE FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
    }
  };

  // ========================================================================
  // CHECK CLAIM STATUS
  // ========================================================================
  // Checks if user can claim tokens or needs to wait
  
  const checkClaimStatus = async (tokenContract, userAccount) => {
    console.log('\n⏰ === CHECK CLAIM STATUS STARTED ===');
    console.log('Account:', userAccount);
    try {
      // Check if user can claim now
      console.log('📞 Calling canClaim...');
      const canClaimNow = await tokenContract.canClaim(userAccount);
      console.log('✅ Can claim now:', canClaimNow);
      setCanClaim(canClaimNow);

      // Get time until next claim
      console.log('📞 Calling timeUntilNextClaim...');
      const timeLeft = await tokenContract.timeUntilNextClaim(userAccount);
      console.log('✅ Time left:', Number(timeLeft), 'seconds');
      setTimeUntilClaim(Number(timeLeft));

      console.log('✅ === CHECK CLAIM STATUS COMPLETED ===\n');
    } catch (error) {
      console.error('❌ === CHECK CLAIM STATUS FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
    }
  };

  // ========================================================================
  // CLAIM TOKENS
  // ========================================================================
  // Sends a transaction to claim free tokens from the faucet
  
  const claimTokens = async () => {
    console.log('\n🎁 === CLAIM TOKENS STARTED ===');
    
    if (!contract || !account) {
      console.error('❌ Contract or account not available');
      console.log('Contract:', !!contract);
      console.log('Account:', account);
      setMessage('❌ Please connect your wallet first');
      return;
    }

    if (!canClaim) {
      console.warn('⏳ Cannot claim yet, time left:', timeUntilClaim, 'seconds');
      setMessage(`⏳ Please wait ${timeUntilClaim} seconds before claiming again`);
      return;
    }

    try {
      setIsLoading(true);
      setMessage('📝 Preparing transaction...');
      console.log('📝 Preparing to call claimTokens()...');

      // Call claimTokens function on the contract
      // This is a WRITE operation (costs gas)
      console.log('📤 Sending transaction...');
      const tx = await contract.claimTokens();
      
      console.log('✅ Transaction sent!');
      console.log('📤 Transaction hash:', tx.hash);
      console.log('📤 Transaction details:', {
        from: tx.from,
        to: tx.to,
        data: tx.data,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit?.toString()
      });
      setMessage(`⏳ Transaction sent! Hash: ${tx.hash.substring(0, 10)}...`);

      // Wait for transaction to be mined (confirmed on blockchain)
      // This can take a few seconds
      setMessage('⛏️ Waiting for confirmation...');
      console.log('⏳ Waiting for transaction to be mined...');
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed!');
      console.log('📦 Block number:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());
      console.log('✅ Status:', receipt.status === 1 ? 'Success' : 'Failed');
      console.log('📋 Logs:', receipt.logs);

      setMessage('🎉 Successfully claimed 10 STC tokens!');

      // Refresh balance and claim status
      console.log('🔄 Refreshing balance and claim status...');
      await loadBalance(contract, account);
      await checkClaimStatus(contract, account);

      setIsLoading(false);
      console.log('✅ === CLAIM TOKENS COMPLETED ===\n');
    } catch (error) {
      console.error('❌ === CLAIM TOKENS FAILED ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error data:', error.data);
      console.error('Error stack:', error.stack);
      
      // Handle specific errors
      if (error.message.includes('Wait') || error.message.includes('wait')) {
        console.log('⏳ Cooldown period not elapsed');
        setMessage('⏳ You need to wait before claiming again');
      } else if (error.message.includes('user rejected') || error.code === 'ACTION_REJECTED') {
        console.log('❌ User rejected transaction');
        setMessage('❌ Transaction cancelled by user');
      } else {
        setMessage('❌ Error: ' + error.message);
      }
      
      setIsLoading(false);
    }
  };

  // ========================================================================
  // REFRESH DATA
  // ========================================================================
  // Manually refresh balance and claim status
  
  const refreshData = async () => {
    console.log('\n🔄 === REFRESH DATA STARTED ===');
    if (contract && account) {
      setMessage('🔄 Refreshing data...');
      await loadBalance(contract, account);
      await checkClaimStatus(contract, account);
      setMessage('✅ Data refreshed!');
      console.log('✅ === REFRESH DATA COMPLETED ===\n');
    } else {
      console.warn('⚠️ Cannot refresh: contract or account missing');
      console.log('Contract:', !!contract);
      console.log('Account:', account);
    }
  };

  // ========================================================================
  // COUNTDOWN TIMER
  // ========================================================================
  // Update countdown every second
  
  useEffect(() => {
    if (timeUntilClaim > 0 && !canClaim) {
      const timer = setInterval(() => {
        setTimeUntilClaim(prev => {
          if (prev <= 1) {
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeUntilClaim, canClaim]);

  // ========================================================================
  // HANDLE ACCOUNT CHANGES
  // ========================================================================
  // Detect when user switches accounts in MetaMask
  
  useEffect(() => {
    if (window.ethereum) {
      console.log('👂 Setting up MetaMask event listeners...');
      
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('\n🔄 === ACCOUNT CHANGED ===');
        console.log('New accounts:', accounts);
        if (accounts.length > 0) {
          console.log('✅ Switching to account:', accounts[0]);
          setAccount(accounts[0]);
          if (contract) {
            console.log('🔗 Re-initializing contract with new account...');
            initializeContract(accounts[0]);
          }
        } else {
          console.log('❌ No accounts available, disconnecting...');
          setAccount(null);
          setBalance('0');

        }
      });

      // Detect network changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('\n🌐 === NETWORK CHANGED ===');
        console.log('New Chain ID:', chainId);
        console.log('🔄 Reloading page...');
        window.location.reload();
      });
      
      console.log('✅ Event listeners set up');
    }
  }, [contract]);

  // ========================================================================
  // RENDER UI
  // ========================================================================
  
  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>🎓 StudentToken Faucet</h1>
          <p className="subtitle">Learn about ERC20 tokens by claiming free STC tokens!</p>
        </header>

        {/* Educational Info Box */}
        <div className="info-box">
          <h3>📚 What is this?</h3>
          <p>
            This is an educational DApp (Decentralized Application) that demonstrates how 
            <strong> ERC20 tokens</strong> work on the blockchain.
          </p>
          <ul>
            <li><strong>Wallet:</strong> Your unique address on the blockchain (like a bank account)</li>
            <li><strong>Smart Contract:</strong> Code running on the blockchain that manages tokens</li>
            <li><strong>Transaction:</strong> An action that changes the blockchain (costs gas)</li>
            <li><strong>Gas Fee:</strong> Payment for computation (paid in ETH)</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {!account ? (
            // Not connected - show connect button
            <div className="connect-section">
              <p className="instruction">Connect your MetaMask wallet to get started</p>
              <button 
                className="btn btn-primary btn-large"
                onClick={connectWallet}
                disabled={isLoading}
              >
                {isLoading ? '🔄 Connecting...' : '🦊 Connect Wallet'}
              </button>
            </div>
          ) : (
            // Connected - show faucet interface
            <div className="faucet-section">
              {/* Wallet Info */}
              <div className="wallet-info">
                <div className="info-card">
                  <span className="label">Connected Wallet</span>
                  <span className="value address">
                    {account.substring(0, 6)}...{account.substring(38)}
                  </span>
                </div>
                <div className="info-card">
                  <span className="label">Your STC Balance</span>
                  <span className="value balance">{parseFloat(balance).toFixed(2)} STC</span>
                </div>
              </div>

              {/* Claim Button */}
              <div className="claim-section">
                <h2>💧 Token Faucet</h2>
                <p className="claim-info">
                  Click below to claim <strong>10 free STC tokens</strong>
                </p>
                <p className="claim-info small">
                  You can claim once every 60 seconds
                </p>
                
                <button
                  className={`btn btn-large ${canClaim ? 'btn-success' : 'btn-disabled'}`}
                  onClick={claimTokens}
                  disabled={isLoading || !canClaim}
                >
                  {isLoading ? '⏳ Processing...' : 
                   canClaim ? '🎁 Claim Free Tokens' : 
                   `⏰ Wait ${timeUntilClaim}s`}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  🔄 Refresh Balance
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div className="message-box">
                  {message}
                </div>
              )}

              {/* Educational Tips */}
              <div className="tips-box">
                <h3>💡 What happens when you claim?</h3>
                <ol>
                  <li>Your wallet signs a transaction</li>
                  <li>Transaction is sent to the blockchain</li>
                  <li>Smart contract checks if you can claim</li>
                  <li>Contract mints (creates) 10 new tokens</li>
                  <li>Tokens are added to your wallet balance</li>
                  <li>Event is logged on the blockchain</li>
                </ol>
                <p className="tip">
                  💡 <strong>Tip:</strong> Check your browser console (F12) to see detailed logs!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {account && (
          <div className="debug-box">
            <h3>🐛 Debug Info</h3>
            <div className="debug-item">
              <strong>Contract Address:</strong> {contractData?.address || 'Not loaded'}
            </div>
            <div className="debug-item">
              <strong>Connected Account:</strong> {account}
            </div>
            <div className="debug-item">
              <strong>Contract Loaded:</strong> {contract ? '✅ Yes' : '❌ No'}
            </div>
            <div className="debug-item">
              <strong>Can Claim:</strong> {canClaim ? '✅ Yes' : `❌ No (${timeUntilClaim}s left)`}
            </div>
            <p className="debug-tip">
              💡 Open browser console (F12) to see detailed logs!
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>Built with ❤️ for learning | Contract: {contractData?.address ? `${contractData.address.substring(0, 10)}...` : 'Not deployed'}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
