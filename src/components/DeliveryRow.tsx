import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DeliveryResponse } from '../types';
import { DELIVERY_STATUS_LABELS } from '../utils/enumLabels';

interface DeliveryRowProps {
  item: DeliveryResponse;
}

export default function DeliveryRow({ item }: DeliveryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>ID: <Text style={styles.value}>{item.id}</Text></Text>
      <Text style={styles.label}>Order: <Text style={styles.value}>{item.order_id}</Text></Text>
      <Text style={styles.label}>Status: <Text style={styles.status}>{DELIVERY_STATUS_LABELS[item.status]}</Text></Text>
      {item.pickup_time && (
        <Text style={styles.label}>Pickup: <Text style={styles.value}>{new Date(item.pickup_time).toLocaleString()}</Text></Text>
      )}
      {item.delivered_time && (
        <Text style={styles.label}>Delivered: <Text style={styles.value}>{new Date(item.delivered_time).toLocaleString()}</Text></Text>
      )}
      {item.notes && (
        <Text style={styles.label}>Notes: <Text style={styles.value}>{item.notes}</Text></Text>
      )}
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
  status: { color: '#1565C0', fontWeight: '600' },
});
