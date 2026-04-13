import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';

export default function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A7A35" />
      <Text style={styles.text}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: '500',
  },
});
