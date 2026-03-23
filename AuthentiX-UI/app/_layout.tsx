import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Link, Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <View style={styles.masterContainer}>
      
      {/* The Floating Apple-Style Nav Pill */}
      <View style={styles.navWrapper}>
        <View style={styles.navPill}>
          <Link href="/" asChild>
            <Pressable><Text style={styles.logo}>AuthentiX.</Text></Pressable>
          </Link>
          
          <View style={styles.linksContainer}>
            <Link href="/mint" asChild>
              <Pressable style={({ hovered }) => [styles.navItem, hovered && styles.navItemHover]}><Text style={styles.navText}>Mint</Text></Pressable>
            </Link>
            <Link href="/transfer" asChild>
              <Pressable style={({ hovered }) => [styles.navItem, hovered && styles.navItemHover]}><Text style={styles.navText}>Transfer</Text></Pressable>
            </Link>
            <Link href="/track" asChild>
              <Pressable style={({ hovered }) => [styles.navItem, hovered && styles.navItemHover]}><Text style={styles.navText}>Track</Text></Pressable>
            </Link>
          </View>
        </View>
      </View>

      {/* This <Slot /> is where your individual pages will render! */}
      <View style={styles.pageContent}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Stark Apple White
  },
  navWrapper: {
    position: 'absolute',
    top: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 100, // Keeps it on top of everything
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.8)' : '#FFFFFF',
    width: '90%',
    maxWidth: 900,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50, // Perfect pill shape
    // The "Expensive" Drop Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' } as any), // Frosted glass effect for web
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#000000',
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 25,
  },
  navItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    transition: 'all 0.2s ease', // Tell TypeScript to ignore this web-only CSS
  } as any,
  navItemHover: {
    backgroundColor: '#F5F5F7',
  },
  navText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  pageContent: {
    flex: 1,
    paddingTop: 120, // Pushes content below the floating nav
  }
});