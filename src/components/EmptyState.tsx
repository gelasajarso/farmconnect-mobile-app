import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message: string;
  emoji?: string;
}

export default function EmptyState({ message, emoji = '📭' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
