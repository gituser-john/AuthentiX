const hre = require("hardhat");

async function main() {
  console.log("Preparing deployment...");

  // Grab the contract factory
  const AuthentiX = await hre.ethers.getContractFactory("AuthentiX");

  // Deploy to the network
  const authentix = await AuthentiX.deploy();

  console.log("Waiting for block confirmation...");
  await authentix.waitForDeployment();

  // Get the final live address
  const contractAddress = await authentix.getAddress();
  console.log(`\n🎉 AuthentiX is officially LIVE on Polygon Amoy!`);
  console.log(`Contract Address: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});