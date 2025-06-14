require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    rskTestnet: {
      url: process.env.ROOTSTOCK_TESTNET_RPC_URL || "https://public-node.testnet.rsk.co",
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