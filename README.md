# Union Bridge Round Trip Example

This repository demonstrates a simulated round trip test for Rootstock’s Union Bridge, allowing developers to deposit BTC (simulated), mint RBTC, use it in a dApp, and burn RBTC to withdraw BTC (simulated). It’s a companion to the article "Rootstock’s Union Bridge: A Comprehensive Guide to Trustless Bitcoin Swaps for Smart Contracts."

## Prerequisites

- Node.js and npm
- Hardhat
- MetaMask configured for Rootstock Testnet. Follow [how to set it up here](https://dev.rootstock.io/dev-tools/wallets/metamask/)
- Testnet RBTC (get from [Rootstock’s faucet](https://faucet.rootstock.io))

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/michojekunle/union-bridge-example.git
   cd union-bridge-example
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Hardhat for Rootstock Testnet (edit hardhat.config.js with your Testnet details).
   
   `hardhat.config.js`

   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require("dotenv").config();

   module.exports = {
     solidity: {
       version: "0.8.27",
       settings: {
         optimizer: {
           enabled: true,
           runs: 200,
         },
       },
     },
     networks: {
       rskTestnet: {
         url:
           process.env.ROOTSTOCK_TESTNET_RPC_URL ||
           "https://public-node.testnet.rsk.co",
         accounts: [process.env.PRIVATE_KEY || "0xYourPrivateKey"],
         chainId: 31,
       },
       rskMainnetFork: {
         url: "http://localhost:8545",
         chainId: 30,
       },
     },
     mocha: {
       timeout: 40000,
     },
   };
   ```

   `.env`

   Create a .env file in the project root:

   ```bash
   ROOTSTOCK_TESTNET_RPC_URL=your-alchemy-testnet-rpc-url
   PRIVATE_KEY=your-private-key
   ```

4. Deployment

   Deploy the contracts:

    ```
    npx hardhat run scripts/deploy.js --network rskTestnet
    ```

   Note the deployed addresses of SimulatedUnionBridge and CharityDApp.

## Running the Round Trip

Simulate Interaction:
    
    npx hardhat run scripts/interact.js --network rskTestnet

Replace bridgeAddress and userAddress in the script with actual values.

## Testing

Run the test suite:
    
    npx hardhat test
    

## Directory Structure

- `/contracts`: Smart contracts (SimulatedUnionBridge.sol, CharityDApp.sol).

- `/scripts`: Deployment and interaction scripts.

- `/test`: Test files.
