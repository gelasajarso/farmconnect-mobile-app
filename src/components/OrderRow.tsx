import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { OrderDTO } from '../types';
import { ORDER_STATUS_LABELS } from '../utils/enumLabels';

interface OrderRowProps {
  item: OrderDTO;
}

export default function OrderRow({ item }: OrderRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Order ID: <Text style={styles.value}>{item.id}</Text></Text>
      <Text style={styles.label}>Product: <Text style={styles.value}>{item.product_id}</Text></Text>
      <Text style={styles.label}>Qty: <Text style={styles.value}>{item.quantity}</Text></Text>
      <Text style={styles.label}>Unit Price: <Text style={styles.value}>{item.unit_price.toFixed(2)}</Text></Text>
      <Text style={styles.label}>Total: <Text style={styles.value}>{item.total_price.toFixed(2)}</Text></Text>
      <Text style={styles.label}>Status: <Text style={styles.status}>{ORDER_STATUS_LABELS[item.status]}</Text></Text>
      <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(item.created_at).toLocaleDateString()}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginVertical: 5,
    marginHorizontal: 16,
    elevation: 1,
  },
  label: { fontSize: 13, color: '#616161', marginBottom: 2 },
  value: { color: '#212121', fontWeight: '500' },
  status: { color: '#2E7D32', fontWeight: '600' },
});
