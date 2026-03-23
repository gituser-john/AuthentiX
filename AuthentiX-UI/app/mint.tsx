import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract';

export default function MintScreen() {
  const [walletAddress, setWalletAddress] = useState("");
  
  // Form States
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [description, setDescription] = useState("");
  
  // New UI States
  const [isMinting, setIsMinting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [txDetails, setTxDetails] = useState<any>(null);

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
      setErrorMessage("MetaMask is not installed. Please install it to continue.");
    }
  };

  const handleMint = async () => {
    setErrorMessage(""); // Clear old errors
    if (!productName || !batchNumber || !description) {
      setErrorMessage("Please fill out all asset details before minting.");
      return;
    }
    
    try {
      setIsMinting(true);
      setStatusText("APPROVING IN WALLET...");
      
      const win = window as any;
      const provider = new ethers.BrowserProvider(win.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.mintProduct(productName, batchNumber, description, {
              maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
              maxFeePerGas: ethers.parseUnits("30", "gwei")
            });
      
      setStatusText("MINING ON POLYGON..."); // Dynamic UI update!
      const receipt = await tx.wait();
      
      // Store the receipt data to show on the success card
      setTxDetails({
        hash: tx.hash,
        block: receipt.blockNumber
      });
      
      // Clear the form
      setProductName(""); setBatchNumber(""); setDescription("");
    } catch (error: any) {
      console.error("Minting failed:", error);
      setErrorMessage(error.message.includes("rejected") ? "Transaction was rejected in your wallet." : "Transaction failed. Check your connection and try again.");
    } finally {
      setIsMinting(false);
      setStatusText("");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.contentWrapper}>
        
        <Text style={styles.pageTitle}>Mint.</Text>
        <Text style={styles.pageSubtitle}>Tokenize a physical asset on the Polygon network.</Text>

        {!walletAddress ? (
          <View style={styles.authContainer}>
            <View style={styles.authIconPlaceholder}><Text style={styles.authIconText}>🦊</Text></View>
            <Text style={styles.authTitle}>Authentication Required</Text>
            <Text style={styles.authSubtitle}>Connect your Web3 wallet to authorize as a Manufacturer.</Text>
            <Pressable style={({ hovered }) => [styles.connectButton, hovered && styles.buttonHover]} onPress={connectWallet}>
              <Text style={styles.connectButtonText}>Connect MetaMask</Text>
            </Pressable>
            {errorMessage ? <Text style={styles.errorTextAuth}>{errorMessage}</Text> : null}
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.walletBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.walletText}>MANUFACTURER: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</Text>
            </View>

            {/* --- INLINE ERROR BANNER --- */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠ {errorMessage}</Text>
              </View>
            ) : null}

            {/* --- SUCCESS RECEIPT CARD --- */}
            {txDetails ? (
              <View style={styles.successCard}>
                <View style={styles.successIcon}><Text style={{fontSize: 30}}>✅</Text></View>
                <Text style={styles.successTitle}>Asset Successfully Minted</Text>
                <Text style={styles.successSubtitle}>The product data is now permanently inscribed on the blockchain.</Text>
                
                <View style={styles.receiptBox}>
                  <Text style={styles.receiptLabel}>TRANSACTION HASH</Text>
                  <Text style={styles.receiptData}>{txDetails.hash}</Text>
                  
                  <Text style={[styles.receiptLabel, {marginTop: 15}]}>BLOCK NUMBER</Text>
                  <Text style={styles.receiptData}>{txDetails.block}</Text>
                </View>

                <Pressable style={styles.resetButton} onPress={() => setTxDetails(null)}>
                  <Text style={styles.resetButtonText}>Mint Another Asset</Text>
                </Pressable>
              </View>
            ) : (
              // --- THE FORM ---
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ASSET NAME</Text>
                  <TextInput style={styles.input} placeholder="e.g., Rolex Submariner" placeholderTextColor="#A0AEC0" value={productName} onChangeText={setProductName} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>BATCH NUMBER</Text>
                  <TextInput style={styles.input} placeholder="e.g., BATCH-001" placeholderTextColor="#A0AEC0" value={batchNumber} onChangeText={setBatchNumber} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>DESCRIPTION</Text>
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Asset details, origin, and specifications..." placeholderTextColor="#A0AEC0" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
                </View>

                {isMinting ? (
                  <View style={styles.mintingState}>
                    <ActivityIndicator size="large" color="#000000" />
                    <Text style={styles.mintingText}>{statusText}</Text>
                  </View>
                ) : (
                  <Pressable style={({ hovered }) => [styles.submitButton, hovered && styles.buttonHover]} onPress={handleMint}>
                    <Text style={styles.submitButtonText}>Mint to Blockchain</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
  contentWrapper: { width: '100%', maxWidth: 600, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 100 },
  pageTitle: { fontSize: 60, fontWeight: '900', color: '#000000', letterSpacing: -2, marginBottom: 5 },
  pageSubtitle: { fontSize: 18, color: '#718096', marginBottom: 40, fontWeight: '500' },
  
  authContainer: { alignItems: 'center', backgroundColor: '#F7FAFC', padding: 50, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 20 },
  authIconPlaceholder: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, marginBottom: 20 },
  authIconText: { fontSize: 40 },
  authTitle: { fontSize: 22, fontWeight: '800', color: '#1A202C', marginBottom: 10 },
  authSubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  connectButton: { backgroundColor: '#F6851B', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, transition: 'all 0.2s ease' } as any, 
  connectButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorTextAuth: { color: '#E53E3E', marginTop: 20, fontWeight: '600', textAlign: 'center' },

  formContainer: { width: '100%' },
  walletBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F0FFF4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginBottom: 20 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#276749', marginRight: 10 },
  walletText: { fontFamily: 'monospace', color: '#276749', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  
  errorBanner: { backgroundColor: '#FFF5F5', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FEB2B2', marginBottom: 25 },
  errorBannerText: { color: '#C53030', fontSize: 14, fontWeight: '700' },

  inputGroup: { marginBottom: 25 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 8, marginLeft: 5 },
  input: { width: '100%', backgroundColor: '#F7FAFC', padding: 20, borderRadius: 16, fontSize: 16, color: '#1A202C', fontWeight: '500', borderWidth: 1, borderColor: '#EDF2F7' },
  textArea: { minHeight: 120, paddingTop: 20, textAlignVertical: 'top' },
  
  submitButton: { backgroundColor: '#000000', width: '100%', paddingVertical: 20, borderRadius: 16, alignItems: 'center', marginTop: 10, transition: 'all 0.2s ease' } as any,
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  buttonHover: { transform: [{ translateY: -2 }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },

  mintingState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginTop: 10 },
  mintingText: { marginTop: 15, fontSize: 12, fontWeight: '800', color: '#4A5568', letterSpacing: 2 },

  // Success Receipt Styles
  successCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.05, shadowRadius: 40, elevation: 10 },
  successIcon: { width: 70, height: 70, backgroundColor: '#F0FFF4', borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1A202C', marginBottom: 10, textAlign: 'center' },
  successSubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  receiptBox: { width: '100%', backgroundColor: '#F7FAFC', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 30 },
  receiptLabel: { fontSize: 10, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 6 },
  receiptData: { fontFamily: 'monospace', color: '#2D3748', fontSize: 13, fontWeight: '600' },
  resetButton: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#CBD5E0', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 16, width: '100%', alignItems: 'center' },
  resetButtonText: { color: '#4A5568', fontSize: 15, fontWeight: '700' }
});