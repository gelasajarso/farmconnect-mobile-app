import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, SafeAreaView, Platform,
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
import type { CatalogItem, Category } from '../types';
import { CATEGORY_LABELS } from '../utils/enumLabels';

type HomeNavProp = StackNavigationProp<HomeStackParamList, 'ProductList'>;

const CATEGORIES: (Category | 'ALL')[] = ['ALL', 'GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'SPICES', 'OTHER'];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuth();
  const { products, loading, error, refetch } = useCatalog();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === 'ALL' || p.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [products, query, activeCategory]);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Marketplace</Text>
          <Text style={styles.sub}>Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search products, categories…"
          placeholderTextColor="#9E9E9E"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === item && styles.filterChipActive]}
            onPress={() => setActiveCategory(item)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, activeCategory === item && styles.filterTextActive]}>
              {item === 'ALL' ? 'All' : CATEGORY_LABELS[item as Category]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      <Text style={styles.resultCount}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</Text>

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
        removeClippedSubviews
        ListEmptyComponent={<EmptyState message="No products match your search." emoji="🔍" />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : styles.listPad}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F9F7' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A7A35',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 18,
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: '#A8D5B5', marginTop: 2, fontWeight: '500' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#0D1B0F', fontWeight: '500' },

  filterList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  filterChipActive: { backgroundColor: '#1A7A35', borderColor: '#1A7A35' },
  filterText: { fontSize: 13, color: '#666', fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  resultCount: {
    fontSize: 12, color: '#9E9E9E', fontWeight: '600',
    marginHorizontal: 20, marginBottom: 4,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  listPad: { paddingBottom: 24 },
  emptyFlex: { flex: 1 },
});
