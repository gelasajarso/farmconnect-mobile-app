import React from 'react';
import { FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useDeliveries } from '../hooks/useDeliveries';
import DeliveryRow from '../components/DeliveryRow';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { DeliveryResponse } from '../types';

export default function DeliveryAssignmentsScreen() {
  const { deliveries, loading, error, refetch } = useDeliveries();

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.flex}>
      <FlatList<DeliveryResponse>
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DeliveryRow item={item} />}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <EmptyState message="No deliveries assigned to you at this time." />
        }
        contentContainerStyle={deliveries.length === 0 ? styles.flex : styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F1F8E9' },
  list: { paddingVertical: 8 },
});
