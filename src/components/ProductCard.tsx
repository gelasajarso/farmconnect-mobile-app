import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CatalogItem } from '../types';
import { CATEGORY_LABELS, QUALITY_GRADE_LABELS } from '../utils/enumLabels';

const CATEGORY_EMOJI: Record<string, string> = {
  GRAINS: '🌾', VEGETABLES: '🥦', FRUITS: '🍎',
  DAIRY: '🥛', MEAT: '🥩', SPICES: '🌶️', OTHER: '📦',
};

interface ProductCardProps {
  item: CatalogItem;
  onPress: (id: string) => void;
}

export default function ProductCard({ item, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.id)} activeOpacity={0.75}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{CATEGORY_EMOJI[item.category] ?? '📦'}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{item.currency} {item.base_price.toFixed(2)}</Text>
          <Text style={styles.unit}>per unit</Text>
        </View>
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>Qty: {item.total_quantity.toLocaleString()}</Text>
        {item.quality_grade && (
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>{QUALITY_GRADE_LABELS[item.quality_grade]}</Text>
          </View>
        )}
        {item.farmer?.name && (
          <Text style={styles.farmer} numberOfLines={1}>🧑‍🌾 {item.farmer.name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2FAF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  titleBlock: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#0D1B0F', marginBottom: 2 },
  category: { fontSize: 12, color: '#6B8F71', fontWeight: '500' },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '800', color: '#1A7A35' },
  unit: { fontSize: 11, color: '#9E9E9E', marginTop: 1 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  meta: { fontSize: 12, color: '#888', fontWeight: '500' },
  gradeBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  gradeText: { fontSize: 11, color: '#F57F17', fontWeight: '700' },
  farmer: { flex: 1, fontSize: 12, color: '#888', textAlign: 'right' },
});
