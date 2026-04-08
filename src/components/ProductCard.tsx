import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CatalogItem } from '../types';
import { CATEGORY_LABELS, QUALITY_GRADE_LABELS } from '../utils/enumLabels';

interface ProductCardProps {
  item: CatalogItem;
  onPress: (id: string) => void;
}

export default function ProductCard({ item, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.id)}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
      <Text style={styles.price}>
        {item.currency} {item.base_price.toFixed(2)}
      </Text>
      <Text style={styles.quantity}>Qty: {item.total_quantity}</Text>
      {item.quality_grade && (
        <Text style={styles.grade}>{QUALITY_GRADE_LABELS[item.quality_grade]}</Text>
      )}
      {item.farmer?.name && (
        <Text style={styles.farmer}>Farmer: {item.farmer.name}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1B5E20', marginBottom: 4 },
  category: { fontSize: 13, color: '#558B2F', marginBottom: 2 },
  price: { fontSize: 15, fontWeight: '600', color: '#2E7D32', marginBottom: 2 },
  quantity: { fontSize: 13, color: '#616161', marginBottom: 2 },
  grade: { fontSize: 12, color: '#F57F17', marginBottom: 2 },
  farmer: { fontSize: 12, color: '#757575' },
});
