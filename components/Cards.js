// screens/Cards.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Match card size from HomeScreen
const CARD_WIDTH = Math.round(width * 0.85);
const CARD_HEIGHT = 500;

export function Card({ item }) {
  // Avoid crash if item is undefined
  if (!item) return null;

  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});