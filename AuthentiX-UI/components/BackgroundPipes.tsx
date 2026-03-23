import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg from 'react-native-svg';
import SingleChainLine from './SingleChainLine'; // <-- Import the new component!

export default function BackgroundPipes() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg height="100%" width="100%">
        {/* We render 4 separate lines with slightly varied subtleties */}
        <SingleChainLine opacity={0.15} />
        <SingleChainLine opacity={0.12} />
        <SingleChainLine opacity={0.18} />
        <SingleChainLine opacity={0.1} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, 
  },
});