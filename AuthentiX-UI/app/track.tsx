import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract';

const ContinuousDecryptor = () => {
  const [displayedHash, setDisplayedHash] = useState("0x----------");

  useEffect(() => {
    const chars = "0123456789ABCDEF";
    let lockedCount = 0;
    let targetHash = Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]);
    let isPaused = false;

    const scrambleInterval = setInterval(() => {
      if (isPaused) return;
      let currentStr = "0x";
      for (let i = 0; i < 10; i++) {
        if (i < lockedCount) {
          currentStr += targetHash[i];
        } else {
          currentStr += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayedHash(currentStr);
    }, 30);

    const lockInterval = setInterval(() => {
      if (isPaused) return;
      if (lockedCount < 10) {
        lockedCount++;
      } else {
        isPaused = true;
        setTimeout(() => {
          lockedCount = 0;
          targetHash = Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]);
          isPaused = false;
        }, 1200); 
      }
    }, 100);

    return () => { clearInterval(scrambleInterval); clearInterval(lockInterval); };
  }, []);

  return (
    <View style={styles.activeBadge}>
      <View style={styles.liveIndicator} />
      <Text style={styles.badgeText}>{displayedHash}</Text>
    </View>
  );
};

export default function TrackScreen() {
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handleSearch = async () => {
    if (!searchId) return;
    
    setHasStarted(true);
    setFetchedProduct(null);
    setIsSearching(true);
    
    try {
      const win = window as any;
      const provider = new ethers.BrowserProvider(win.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      const [product, history] = await Promise.all([
        contract.getProduct(searchId),
        contract.getOwnershipHistory(searchId),
        new Promise(resolve => setTimeout(resolve, 1500)) 
      ]);
      
      setFetchedProduct({
        id: product[0].toString(),
        name: product[1],
        batch: product[2],
        desc: product[3],
        owner: product[4],
        history: history
      });
    } catch (error) {
      console.error("Search failed:", error);
      alert("Product not found! Ensure the ID exists on the blockchain.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentWrapper}>
        
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

              <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>CHAIN OF CUSTODY TIMELINE</Text>
                
                {fetchedProduct.history.map((wallet: string, index: number) => {
                  const isFirst = index === 0;
                  const isLast = index === fetchedProduct.history.length - 1;
                  
                  return (
                    <View key={index} style={styles.timelineNode}>
                      {!isLast && <View style={styles.timelineLine} />}
                      
                      <View style={[styles.timelineDot, isLast && styles.timelineDotActive]} />
                      
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineRole}>
                          {isFirst ? "MANUFACTURER (ORIGIN)" : isLast ? "CURRENT OWNER" : "INTERMEDIARY"}
                        </Text>
                        <Text style={[styles.timelineAddress, isLast && styles.timelineAddressActive]}>
                          {wallet}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

            </View>
          )}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#FAFAFA', alignItems: 'center', paddingBottom: 60 },
  contentWrapper: { width: '100%', maxWidth: 600, paddingHorizontal: 20, paddingTop: 40, flex: 1 },
  
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  pageTitle: { fontSize: 60, fontWeight: '900', color: '#000000', letterSpacing: -2 },
  pageSubtitle: { fontSize: 18, color: '#718096', marginBottom: 40, fontWeight: '500' },
  
  activeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A202C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 10 },
  badgeText: { fontFamily: 'monospace', color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  
  inputGroup: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  input: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, fontSize: 18, color: '#1A202C', fontWeight: '600', borderWidth: 1, borderColor: '#EDF2F7' },
  button: { backgroundColor: '#000000', paddingHorizontal: 30, justifyContent: 'center', borderRadius: 16 },
  buttonHover: { transform: [{ translateY: -2 }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  resultsArea: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 40 },

  resultCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 30, elevation: 5, borderWidth: 1, borderColor: '#EDF2F7' },
  verifiedHeader: { backgroundColor: '#F0FFF4', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 25 },
  verifiedText: { color: '#276749', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  dataRow: { marginBottom: 20 },
  dataLabel: { fontSize: 11, fontWeight: '800', color: '#A0AEC0', letterSpacing: 1.5, marginBottom: 4 },
  dataValue: { fontSize: 18, fontWeight: '600', color: '#1A202C' },

  timelineContainer: { marginTop: 20, paddingTop: 30, borderTopWidth: 1, borderColor: '#EDF2F7' },
  timelineTitle: { fontSize: 12, fontWeight: '900', color: '#A0AEC0', letterSpacing: 2, marginBottom: 25 },
  timelineNode: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  timelineLine: { position: 'absolute', left: 5, top: 15, bottom: -25, width: 2, backgroundColor: '#E2E8F0' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#CBD5E0', marginRight: 15, marginTop: 4, zIndex: 1, borderWidth: 2, borderColor: '#FFFFFF' },
  timelineDotActive: { backgroundColor: '#10B981' }, 
  timelineContent: { flex: 1 },
  timelineRole: { fontSize: 10, fontWeight: '800', color: '#718096', letterSpacing: 1, marginBottom: 4 },
  timelineAddress: { fontSize: 13, fontFamily: 'monospace', color: '#718096', fontWeight: '600', backgroundColor: '#F7FAFC', padding: 8, borderRadius: 6, overflow: 'hidden' },
  timelineAddressActive: { color: '#276749', backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#C6F6D5' }, 
});