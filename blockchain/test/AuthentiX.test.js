const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuthentiX Smart Contract", function () {
  it("Should mint a product and transfer ownership successfully", async function () {
    
    // 1. Get some fake test accounts provided by Hardhat
    const [manufacturer, distributor] = await ethers.getSigners();
    console.log("Manufacturer Address:", manufacturer.address);
    console.log("Distributor Address:", distributor.address);

    // 2. Deploy the contract to our local fake blockchain
    const AuthentiX = await ethers.getContractFactory("AuthentiX");
    const authentix = await AuthentiX.deploy();
    console.log("Contract deployed!");

    // 3. Simulate Phase 1: MINTING
    console.log("\n--- Minting Product ---");
    // Manufacturer calls the mint function
    await authentix.connect(manufacturer).mintProduct("Gaming Laptop", "GL-2026", "High-end gaming laptop");
    
    // Fetch the product from the blockchain to verify
    const product = await authentix.getProduct(1);
    expect(product.name).to.equal("Gaming Laptop");
    expect(product.currentOwner).to.equal(manufacturer.address);
    console.log("Success: Product minted by Manufacturer.");

    // 4. Simulate Phase 2: TRANSFERRING
    console.log("\n--- Transferring Product ---");
    // Manufacturer transfers the product to the Distributor
    await authentix.connect(manufacturer).transferProduct(1, distributor.address);

    // Fetch the product again to check the new owner
    const updatedProduct = await authentix.getProduct(1);
    expect(updatedProduct.currentOwner).to.equal(distributor.address);
    console.log("Success: Product transferred to Distributor.");
  });
});