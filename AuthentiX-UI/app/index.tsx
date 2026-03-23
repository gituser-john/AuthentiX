import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import BackgroundPipes from '../components/BackgroundPipes';

// === THE FULL-LENGTH 40-CHAR NODE TERMINAL ===
const LiveNodeTerminal = () => {
  // 40 dashes for the initial state
  const [displayedHash, setDisplayedHash] = useState("0x" + "-".repeat(40));

  useEffect(() => {
    const chars = "0123456789abcdef"; // Lowercase hex looks a bit more "terminal"
    let lockedCount = 0;
    let targetHash = Array.from({length: 40}, () => chars[Math.floor(Math.random() * chars.length)]);
    let isPaused = false;

    // 1. The Scrambler (Super fast blur)
    const scrambleInterval = setInterval(() => {
      if (isPaused) return;
      let currentStr = "0x";
      for (let i = 0; i < 40; i++) {
        if (i < lockedCount) {
          currentStr += targetHash[i];
        } else {
          currentStr += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayedHash(currentStr);
    }, 30);

    // 2. The Locker (Sweeps across all 40 characters quickly)
    const lockInterval = setInterval(() => {
      if (isPaused) return;

      // Lock 1 character every 40ms (~1.6 seconds to sweep the whole string)
      if (lockedCount < 40) {
        lockedCount++;
      } else {
        isPaused = true;
        setTimeout(() => {
          lockedCount = 0;
          targetHash = Array.from({length: 40}, () => chars[Math.floor(Math.random() * chars.length)]);
          isPaused = false;
        }, 2000); // Wait 2 seconds before syncing the next block
      }
    }, 40); 

    return () => {
      clearInterval(scrambleInterval);
      clearInterval(lockInterval);
    };
  }, []);

  return (
    <View style={styles.terminalContainer}>
      <View style={styles.terminalHeader}>
        <View style={styles.liveIndicator} />
        <Text style={styles.terminalTitle}>NODE ACTIVE : SYNCING BLOCKS</Text>
      </View>
      <Text style={styles.terminalText}>{displayedHash}</Text>
    </View>
  );
};

// === THE MAIN LANDING PAGE ===
export default function Home() {
  return (
    <View style={styles.container}>
      {/* The animated sci-fi background */}
      <BackgroundPipes /> 
      
      <View style={styles.hero}>
        <Text style={styles.headline}>Provenance,</Text>
        <Text style={styles.headline}>Perfected.</Text>
        <Text style={styles.subtext}>
          The immutable supply chain engine built on the Polygon network. 
          Tracking truth from origin to destination.
        </Text>
      </View>

      {/* The absolute-positioned terminal in the corner */}
      <LiveNodeTerminal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  hero: {
    maxWidth: 800,
    width: '90%',
    alignItems: 'flex-start',
  },
  headline: {
    fontSize: 85,
    fontWeight: '900',
    letterSpacing: -4,
    color: '#000000',
    lineHeight: 90,
  },
  subtext: {
    fontSize: 22,
    color: '#86868B', 
    marginTop: 20,
    fontWeight: '500',
    maxWidth: 500,
    lineHeight: 32,
  },

  // Terminal Styles
  terminalContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: 'rgba(26, 32, 44, 0.85)', // Dark, slightly transparent Apple-style glass
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' } as any),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#10B981', // Glowing Green
    marginRight: 8,
  },
  terminalTitle: {
    fontSize: 10, 
    fontWeight: '800', 
    color: '#A0AEC0', 
    letterSpacing: 1.5,
  },
  terminalText: {
    fontFamily: 'monospace', 
    color: '#A0AEC0', 
    fontSize: 13, 
    letterSpacing: 1.5, 
  }
});