import React from 'react';
import { FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useOrders } from '../hooks/useOrders';
import OrderRow from '../components/OrderRow';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { OrderDTO } from '../types';

export default function MerchantOrdersScreen() {
  const { orders, loading, error, refetch } = useOrders();

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.flex}>
      <FlatList<OrderDTO>
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderRow item={item} />}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <EmptyState message="You have no orders yet." />
        }
        contentContainerStyle={orders.length === 0 ? styles.flex : styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F1F8E9' },
  list: { paddingVertical: 8 },
});
