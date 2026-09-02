# AuthentiX ⛓️📦
**Web3 Supply Chain Provenance & Anti-Counterfeiting Engine**

AuthentiX is a decentralized, real-time supply chain tracking application designed to eliminate counterfeit goods and ensure product authenticity. Built on the Polygon blockchain using React Native Web and Solidity, it allows manufacturers to tokenize physical assets and consumers to verify an item's immutable history. 

Counterfeit products cost the global economy billions annually and pose severe risks in critical sectors like pharmaceuticals and aerospace. Existing tracking solutions rely on centralized databases, which are vulnerable to hacking, data manipulation, and insider fraud. AuthentiX replaces these vulnerable centralized databases with a trustless, decentralized ledger, ensuring that product provenance is transparent, tamper-proof, and universally verifiable.

---

## 🌟 Key Features

*   **Manufacturer Minting Node:** Secure authorization for verified creators to mint product data (Name, Batch, Description) directly to the blockchain.
*   **Cryptographic Transfer Protocol:** A secure hand-off mechanism allowing current owners to transfer the digital asset to a new wallet address, establishing a transparent chain of custody.
*   **Real-Time Provenance Tracking:** A public decryption engine that allows anyone to enter a Product ID and query the Polygon Mainnet to verify the item's origin and current owner.
*   **Enterprise-Grade UI:** A sleek, cross-platform React Native interface featuring dynamic transaction receipts and active node visualizations.
*   **Fault-Tolerant Transactions:** Implements EIP-1559 manual gas fee overrides (30 Gwei) via Ethers.js to ensure reliable network execution regardless of MetaMask's default estimations.

---

## 🛠️ Tech Stack

**Frontend & User Interface:**
*   React Native (Expo Web)
*   TypeScript

**Web3 & Blockchain:**
*   Solidity (Smart Contracts)
*   Polygon Amoy Testnet (Layer-2 EVM Network)
*   Ethers.js & MetaMask (Wallet Authentication & Cryptographic Signing)

---

## ⚙️ System Architecture

AuthentiX utilizes a Blockchain-Only architecture, eliminating traditional backend servers.
1.  **Wallet Authentication Module:** Verifies cryptographic identity using MetaMask.
2.  **Smart Contract Module:** Deployed on Polygon Amoy, dictating how assets are minted, stored, and transferred.
3.  **Transaction Processing Module:** Handles the submission of transactions and network confirmations.
4.  **Data Visualization Module:** Interprets raw hexadecimal blockchain data and renders it into human-readable product cards and receipts.

---

## 🚀 Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) installed
*   [MetaMask Browser Extension](https://metamask.io/) installed and configured to the **Polygon Amoy Testnet**
*   Test MATIC tokens for paying gas fees

### Running the Frontend Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/AuthentiX.git](https://github.com/yourusername/AuthentiX.git)
