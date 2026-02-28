import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  
  // Minting States
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [description, setDescription] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  // Transfer States (NEW)
  const [transferId, setTransferId] = useState("");
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Searching States
  const [searchId, setSearchId] = useState("");
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Connect Wallet
  const connectWallet = async () => {
    const win = window as any;
    if (typeof win !== "undefined" && typeof win.ethereum !== "undefined") {
      try {
        const accounts = await win.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error("User rejected request:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // 2. Mint Product
  const handleMint = async () => {
    if (!productName || !batchNumber || !description) {
      alert("Please fill out all fields!");
      return;
    }
    try {
      setIsMinting(true);
      const win = window as any;
      const provider = new ethers.BrowserProvider(win.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.mintProduct(productName, batchNumber, description);
      alert("Transaction sent! Waiting for confirmation...");
      await tx.wait();
      alert("🎉 Success! Product minted.");
      
      setProductName(""); setBatchNumber(""); setDescription("");
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Transaction failed.");
    } finally {
      setIsMinting(false);
    }
  };

  // 3. Transfer Ownership (NEW)
  const handleTransfer = async () => {
    if (!transferId || !newOwnerAddress) {
      alert("Please enter the Product ID and the New Owner's Address!");
      return;
    }
    try {
      setIsTransferring(true);
      const win = window as any;
      const provider = new ethers.BrowserProvider(win.ethereum);
      
      // We need a signer because we are modifying the blockchain
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Call the transferProduct function from your smart contract
      //const tx = await contract.transferProduct(transferId, newOwnerAddress);
      // We add an "overrides" object to manually set the gas fee to 30 Gwei
      const tx = await contract.transferProduct(transferId, newOwnerAddress, {
        maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.parseUnits("30", "gwei")
      });
      alert("Transfer initiated! Waiting for network confirmation...");
      
      await tx.wait();
      alert("🤝 Success! Ownership has been securely transferred.");
      
      setTransferId(""); setNewOwnerAddress("");
    } catch (error: any) {
      console.error("Transfer failed:", error);
      // Catch specific smart contract errors
      if (error.message.includes("You are not the owner")) {
        alert("Transfer Failed: You do not own this product!");
      } else {
        alert("Transaction failed or rejected.");
      }
    } finally {
      setIsTransferring(false);
    }
  };

  // 4. Search Product
  const handleSearch = async () => {
    if (!searchId) return;
    try {
      setIsSearching(true);
      const win = window as any;
      const provider = new ethers.BrowserProvider(win.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const product = await contract.getProduct(searchId);
      
      setFetchedProduct({
        id: product[0].toString(),
        name: product[1],
        batch: product[2],
        desc: product[3],
        owner: product[4]
      });
    } catch (error) {
      console.error("Search failed:", error);
      alert("Product not found! Make sure you entered a valid ID.");
      setFetchedProduct(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AuthentiX</Text>
      <Text style={styles.subtitle}>Decentralized Product Provenance</Text>

      {!walletAddress ? (
        <TouchableOpacity style={styles.button} onPress={connectWallet}>
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.dashboard}>
          <View style={styles.connectedBox}>
            <Text style={styles.connectedText}>Connected Wallet:</Text>
            <Text style={styles.addressText}>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </Text>
          </View>

          {/* --- MINTING SECTION --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mint New Product</Text>
            <TextInput style={styles.input} placeholder="Product Name" value={productName} onChangeText={setProductName} />
            <TextInput style={styles.input} placeholder="Batch Number" value={batchNumber} onChangeText={setBatchNumber} />
            <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
            {isMinting ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <TouchableOpacity style={styles.mintButton} onPress={handleMint}>
                <Text style={styles.buttonText}>Mint to Blockchain</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* --- TRANSFER SECTION (NEW) --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Transfer Ownership</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Product ID (e.g., 1)" 
              value={transferId} 
              onChangeText={setTransferId} 
              keyboardType="numeric"
            />
            <TextInput 
              style={styles.input} 
              placeholder="New Owner's Wallet Address (0x...)" 
              value={newOwnerAddress} 
              onChangeText={setNewOwnerAddress} 
            />
            {isTransferring ? (
              <ActivityIndicator size="large" color="#e83e8c" />
            ) : (
              <TouchableOpacity style={styles.transferButton} onPress={handleTransfer}>
                <Text style={styles.buttonText}>Transfer Product</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* --- SEARCH SECTION --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Track Product</Text>
            <TextInput style={styles.input} placeholder="Enter Product ID" value={searchId} onChangeText={setSearchId} keyboardType="numeric" />
            {isSearching ? (
              <ActivityIndicator size="large" color="#17a2b8" />
            ) : (
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.buttonText}>Search Blockchain</Text>
              </TouchableOpacity>
            )}

            {fetchedProduct && (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>✅ Verified Authentic</Text>
                <Text style={styles.resultText}><Text style={styles.bold}>ID:</Text> {fetchedProduct.id}</Text>
                <Text style={styles.resultText}><Text style={styles.bold}>Name:</Text> {fetchedProduct.name}</Text>
                <Text style={styles.resultText}><Text style={styles.bold}>Batch:</Text> {fetchedProduct.batch}</Text>
                <Text style={styles.resultText}><Text style={styles.bold}>Info:</Text> {fetchedProduct.desc}</Text>
                <Text style={styles.resultText}><Text style={styles.bold}>Current Owner:</Text></Text>
                <Text style={styles.ownerText}>{fetchedProduct.owner}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f5f5', alignItems: 'center', paddingVertical: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  dashboard: { width: '100%', maxWidth: 450, paddingHorizontal: 20 },
  connectedBox: { padding: 10, backgroundColor: '#e0ffe0', borderRadius: 8, borderColor: '#00cc00', borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  connectedText: { fontSize: 14, color: '#333' },
  addressText: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { width: '100%', backgroundColor: '#fafafa', padding: 12, borderRadius: 8, borderColor: '#ddd', borderWidth: 1, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  mintButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  transferButton: { backgroundColor: '#e83e8c', padding: 15, borderRadius: 8, alignItems: 'center' }, // Pink/Purple to stand out
  searchButton: { backgroundColor: '#17a2b8', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#28a745', marginBottom: 10 },
  resultText: { fontSize: 15, marginBottom: 5, color: '#333' },
  bold: { fontWeight: 'bold' },
  ownerText: { fontSize: 13, color: '#dc3545', marginTop: 2 },
});