import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract';

// === THE NEW CONTINUOUS DECRYPTOR BADGE ===
const ContinuousDecryptor = () => {
  const [displayedHash, setDisplayedHash] = useState("0x----------");

  useEffect(() => {
    const chars = "0123456789ABCDEF";
    let lockedCount = 0;
    // Generate the initial 10-character target code
    let targetHash = Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]);
    let isPaused = false;

    // 1. The Scrambler: Runs super fast, randomizing unlocked characters
    const scrambleInterval = setInterval(() => {
      if (isPaused) return;
      let currentStr = "0x";
      for (let i = 0; i < 10; i++) {
        if (i < lockedCount) {
          currentStr += targetHash[i]; // Keep locked characters solid
        } else {
          currentStr += chars[Math.floor(Math.random() * chars.length)]; // Scramble the rest
        }
      }
      setDisplayedHash(currentStr);
    }, 30);

    // 2. The Locker: Locks in one character from left to right every 100ms
    const lockInterval = setInterval(() => {
      if (isPaused) return;

      if (lockedCount < 10) {
        lockedCount++;
      } else {
        // Once fully decoded, pause to let the user admire it, then restart the loop
        isPaused = true;
        setTimeout(() => {
          lockedCount = 0;
          targetHash = Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]);
          isPaused = false;
        }, 1200); // Wait 1.2 seconds before cracking a new code
      }
    }, 100);

    return () => {
      clearInterval(scrambleInterval);
      clearInterval(lockInterval);
    };
  }, []);

  return (
    <View style={styles.activeBadge}>
      <View style={styles.liveIndicator} />
      <Text style={styles.badgeText}>{displayedHash}</Text>
    </View>
  );
};

// === THE MAIN TRACK SCREEN ===
export default function TrackScreen() {
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false); // New state to trigger the badge

  const handleSearch = async () => {
    if (!searchId) return;
    
    setHasStarted(true); // Triggers the continuous header animation forever!
    setFetchedProduct(null);
    setIsSearching(true);
    
    try {
      const win = window as any;
      const provider = new ethers.BrowserProvider(win.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // We keep a shorter 1.5s artificial delay for the actual data card so the UX is snappy
      const [product] = await Promise.all([
        contract.getProduct(searchId),
        new Promise(resolve => setTimeout(resolve, 1500)) 
      ]);
      
      setFetchedProduct({
        id: product[0].toString(),
        name: product[1],
        batch: product[2],
        desc: product[3],
        owner: product[4]
      });
    } catch (error) {
      console.error("Search failed:", error);
      alert("Product not found! Ensure the ID exists on the blockchain.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        
        {/* --- NEW HEADER LAYOUT --- */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Track.</Text>
          {hasStarted && <ContinuousDecryptor />}
        </View>
        <Text style={styles.pageSubtitle}>Verify the immutable history of any product.</Text>

        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Product ID (e.g., 1)" 
            placeholderTextColor="#A0AEC0"
            value={searchId} 
            onChangeText={setSearchId} 
            keyboardType="numeric"
          />
          <Pressable 
            style={({ hovered }) => [styles.button, hovered && styles.buttonHover]} 
            onPress={handleSearch}
          >
            <Text style={styles.buttonText}>Verify Provenance</Text>
          </Pressable>
        </View>

        {/* --- DYNAMIC RENDER SECTION --- */}
        <View style={styles.resultsArea}>
          {isSearching && <ActivityIndicator size="large" color="#000000" />}

          {fetchedProduct && !isSearching && (
            <View style={styles.resultCard}>
              <View style={styles.verifiedHeader}>
                <Text style={styles.verifiedText}>✓ VERIFIED ON-CHAIN</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>ASSET NAME</Text>
                <Text style={styles.dataValue}>{fetchedProduct.name}</Text>
              </View>
              
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>BATCH NUMBER</Text>
                <Text style={styles.dataValue}>{fetchedProduct.batch}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>DESCRIPTION</Text>
                <Text style={styles.dataValue}>{fetchedProduct.desc}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>CURRENT OWNER WALLET</Text>
                <Text style={styles.ownerValue}>{fetchedProduct.owner}</Text>
              </View>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
  contentWrapper: { width: '100%', maxWidth: 600, paddingHorizontal: 20, paddingTop: 40 },
  
  // Header Styles
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  pageTitle: { fontSize: 60, fontWeight: '900', color: '#000000', letterSpacing: -2 },
  pageSubtitle: { fontSize: 18, color: '#718096', marginBottom: 40, fontWeight: '500' },
  
  // Continuous Decryptor Badge Styles
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A202C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 10 }, // Tiny green "active" light
  badgeText: { fontFamily: 'monospace', color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  
  // Input & Button Styles
  inputGroup: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  input: { flex: 1, backgroundColor: '#F7FAFC', padding: 20, borderRadius: 16, fontSize: 18, color: '#1A202C', fontWeight: '600' },
  button: { backgroundColor: '#000000', paddingHorizontal: 30, justifyContent: 'center', borderRadius: 16, transition: 'all 0.2s ease' } as any,
  buttonHover: { transform: [{ translateY: -2 }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  resultsArea: { minHeight: 300, justifyContent: 'center', alignItems: 'center' },

  // Data Card Styles
  resultCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.05, shadowRadius: 40, elevation: 10, borderWidth: 1, borderColor: '#F0F4F8' },
  verifiedHeader: { backgroundColor: '#F0FFF4', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 25 },
  verifiedText: { color: '#276749', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  dataRow: { marginBottom: 20 },
  dataLabel: { fontSize: 11, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 4 },
  dataValue: { fontSize: 18, fontWeight: '600', color: '#1A202C' },
  ownerValue: { fontSize: 14, fontWeight: '600', color: '#E53E3E', fontFamily: 'monospace', marginTop: 4, backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8, overflow: 'hidden' },
});