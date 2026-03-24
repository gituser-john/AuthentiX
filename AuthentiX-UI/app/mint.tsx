import React, { useState, useEffect, useRef } from 'react';
import { ScrollView,
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  ActivityIndicator, 
  Platform, 
  Alert 
} from 'react-native';
import { ethers } from 'ethers';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract';

export default function MintScreen() {
  const [walletAddress, setWalletAddress] = useState("");
  const qrRef = useRef<any>(null);
  
  // Form States
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [description, setDescription] = useState("");
  
  // UI States
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

  const saveQrToGallery = async () => {
    qrRef.current.toDataURL(async (data: string) => {
      
      if (Platform.OS === 'web') {
        const a = document.createElement("a");
        a.href = `data:image/png;base64,${data}`;
        a.download = `QR_Passport_ID_${txDetails.id}.png`; // Cleaner file name!
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Needed", "Please grant gallery permissions to save the QR code.");
        return;
      }

      if (!txDetails || !FileSystem.cacheDirectory) return;

      const filePath = `${FileSystem.cacheDirectory}qr_id_${txDetails.id}.png`;
      await FileSystem.writeAsStringAsync(filePath, data, { encoding: FileSystem.EncodingType.Base64 });
      await MediaLibrary.saveToLibraryAsync(filePath);
      Alert.alert("Success", "QR Code saved to your gallery!");
    });
  };

  const handleMint = async () => {
    setErrorMessage("");
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
      
      setStatusText("MINING ON POLYGON...");
      const receipt = await tx.wait();

      // 🚀 THE MAGIC: Extract the Product ID from the transaction receipt!
      let mintedId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === "ProductMinted") {
            mintedId = parsed.args.id.toString();
            break;
          }
        } catch (e) { }
      }

      if (!mintedId) throw new Error("Minted successfully, but could not retrieve Product ID.");
      
      setTxDetails({
        hash: tx.hash,
        block: receipt.blockNumber,
        id: mintedId // Saving the extracted ID!
      });
      
      setProductName(""); setBatchNumber(""); setDescription("");
    } catch (error: any) {
      console.error("Minting failed:", error);
      setErrorMessage(error.message.includes("rejected") ? "Transaction was rejected." : "Transaction failed.");
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
            <Pressable style={styles.connectButton} onPress={connectWallet}>
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

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠ {errorMessage}</Text>
              </View>
            )}

            {txDetails ? (
              <View style={styles.successCard}>
                <View style={styles.successIcon}><Text style={{fontSize: 30}}>✅</Text></View>
                <Text style={styles.successTitle}>Asset Minted</Text>
                
                {/* --- QR GENERATION --- */}
                <View style={styles.qrSection}>
                  <QRCode 
                    value={txDetails.hash} 
                    size={160} 
                    {...({ getRef: qrRef } as any)}
                  />
                </View>

                <Pressable style={styles.downloadButton} onPress={saveQrToGallery}>
                  <Text style={styles.downloadButtonText}>Download QR Passport</Text>
                </Pressable>

                <View style={styles.receiptBox}>
                  <Text style={styles.receiptLabel}>TRANSACTION HASH</Text>
                  <Text style={styles.receiptData}>{txDetails.hash.substring(0, 24)}...</Text>
                </View>

                <Pressable style={styles.resetButton} onPress={() => setTxDetails(null)}>
                  <Text style={styles.resetButtonText}>Mint Another Asset</Text>
                </Pressable>
              </View>
            ) : (
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
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Asset details..." placeholderTextColor="#A0AEC0" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
                </View>

                {isMinting ? (
                  <View style={styles.mintingState}>
                    <ActivityIndicator size="large" color="#000000" />
                    <Text style={styles.mintingText}>{statusText}</Text>
                  </View>
                ) : (
                  <Pressable style={styles.submitButton} onPress={handleMint}>
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
  authIconPlaceholder: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  authIconText: { fontSize: 40 },
  authTitle: { fontSize: 22, fontWeight: '800', color: '#1A202C', marginBottom: 20 },
  connectButton: { backgroundColor: '#F6851B', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  connectButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorTextAuth: { color: '#E53E3E', marginTop: 20, fontWeight: '600' },

  formContainer: { width: '100%' },
  walletBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F0FFF4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginBottom: 20 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#276749', marginRight: 10 },
  walletText: { fontFamily: 'monospace', color: '#276749', fontSize: 12, fontWeight: '700' },
  
  errorBanner: { backgroundColor: '#FFF5F5', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FEB2B2', marginBottom: 25 },
  errorBannerText: { color: '#C53030', fontSize: 14, fontWeight: '700' },

  inputGroup: { marginBottom: 25 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 8 },
  input: { width: '100%', backgroundColor: '#F7FAFC', padding: 20, borderRadius: 16, fontSize: 16, color: '#1A202C', borderWidth: 1, borderColor: '#EDF2F7' },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  
  submitButton: { backgroundColor: '#000000', width: '100%', paddingVertical: 20, borderRadius: 16, alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  mintingState: { alignItems: 'center', paddingVertical: 20 },
  mintingText: { marginTop: 15, fontSize: 12, fontWeight: '800', color: '#4A5568', letterSpacing: 2 },

  successCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20 },
  successIcon: { width: 60, height: 60, backgroundColor: '#F0FFF4', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1A202C', marginBottom: 20 },
  
  qrSection: { padding: 15, backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 20 },
  downloadButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, marginBottom: 25 },
  downloadButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  receiptBox: { width: '100%', backgroundColor: '#F7FAFC', padding: 15, borderRadius: 16, marginBottom: 20 },
  receiptLabel: { fontSize: 9, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1, marginBottom: 4 },
  receiptData: { fontFamily: 'monospace', color: '#2D3748', fontSize: 11 },
  resetButton: { width: '100%', alignItems: 'center', padding: 15 },
  resetButtonText: { color: '#718096', fontSize: 14, fontWeight: '600' }
});