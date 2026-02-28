require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Loads the .env file

module.exports = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};