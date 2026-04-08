import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useCatalog } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type { HomeStackParamList } from '../navigation/types';
import type { CatalogItem } from '../types';

type HomeNavProp = StackNavigationProp<HomeStackParamList, 'ProductList'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user, logout } = useAuth();
  const { products, loading, error, refetch } = useCatalog();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hello, {user?.name ?? 'User'}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search products..."
        clearButtonMode="while-editing"
      />

      {/* List */}
      <FlatList<CatalogItem>
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
          />
        )}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <EmptyState message="No products available at this time." />
        }
        contentContainerStyle={filtered.length === 0 ? styles.flex : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F1F8E9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2E7D32',
  },
  welcome: { fontSize: 16, fontWeight: '700', color: '#fff' },
  role: { fontSize: 12, color: '#C8E6C9' },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1B5E20', borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  search: {
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
});
