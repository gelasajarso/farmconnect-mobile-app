import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  error: '#F44336',
};

// Types
interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  farmSize: string;
  crops: string[];
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  lastActivity: string;
  rating: number;
}

// Mock data
const mockFarmers: Farmer[] = [
  {
    id: '1',
    name: 'Dawit Bekele',
    email: 'dawit@farm.com',
    phone: '+251911234567',
    location: 'Oromia, Addis Ababa',
    farmSize: '2.5 hectares',
    crops: ['Tomatoes', 'Peppers', 'Onions'],
    status: 'active',
    joinDate: '2024-01-15',
    lastActivity: '2024-01-18',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Hanna Solomon',
    email: 'hanna@farm.com',
    phone: '+251911765432',
    location: 'Amhara, Bahir Dar',
    farmSize: '1.8 hectares',
    crops: ['Wheat', 'Barley'],
    status: 'active',
    joinDate: '2024-01-10',
    lastActivity: '2024-01-17',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Kaleb Alemu',
    email: 'kaleb@farm.com',
    phone: '+251911987654',
    location: 'SNNPR, Hawassa',
    farmSize: '3.2 hectares',
    crops: ['Coffee', 'Avocado'],
    status: 'pending',
    joinDate: '2024-01-20',
    lastActivity: '2024-01-20',
    rating: 0,
  },
  {
    id: '4',
    name: 'Sara Tesfaye',
    email: 'sara@farm.com',
    phone: '+251911345678',
    location: 'Tigray, Mekelle',
    farmSize: '1.5 hectares',
    crops: ['Sorghum', 'Millet'],
    status: 'inactive',
    joinDate: '2023-12-01',
    lastActivity: '2024-01-05',
    rating: 4.2,
  },
];

const statusColors = {
  active: { bg: '#E8F5E8', border: '#4CAF50', text: '#2E7D32' },
  pending: { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' },
  inactive: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },
};

export default function AgentFarmersScreen() {
  const [farmers, setFarmers] = useState<Farmer[]>(mockFarmers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  const allStatuses = ['All', 'active', 'pending', 'inactive'];

  const filtered = farmers.filter((farmer) => {
    const matchSearch = farmer.name.toLowerCase().includes(search.toLowerCase()) ||
                      farmer.email.toLowerCase().includes(search.toLowerCase()) ||
                      farmer.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || farmer.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => statusColors[status as keyof typeof statusColors];

  const handleContactFarmer = (farmer: Farmer) => {
    Alert.alert(
      'Contact Farmer',
      `Would you like to contact ${farmer.name}?`,
      [
        { text: 'Call', onPress: () => console.log('Calling:', farmer.phone) },
        { text: 'Email', onPress: () => console.log('Emailing:', farmer.email) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleViewDetails = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
  };

  const renderFarmerCard = (farmer: Farmer) => {
    const colors = getStatusColor(farmer.status);
    return (
      <TouchableOpacity
        key={farmer.id}
        style={styles.farmerCard}
        onPress={() => handleViewDetails(farmer)}
      >
        <View style={styles.farmerHeader}>
          <View style={styles.farmerAvatar}>
            <Text style={styles.avatarText}>
              {farmer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <Text style={styles.farmerLocation}>{farmer.location}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {farmer.status}
            </Text>
          </View>
        </View>

        <View style={styles.farmerDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="expand" size={14} color={G.sub} />
            <Text style={styles.detailText}>{farmer.farmSize}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="leaf" size={14} color={G.sub} />
            <Text style={styles.detailText}>{farmer.crops.join(', ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color={G.sub} />
            <Text style={styles.detailText}>Joined {farmer.joinDate}</Text>
          </View>
        </View>

        {farmer.status === 'active' && farmer.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={G.warning} />
            <Text style={styles.ratingText}>{farmer.rating}</Text>
            <Text style={styles.ratingLabel}>Rating</Text>
          </View>
        )}

        <View style={styles.farmerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleContactFarmer(farmer)}
          >
            <Ionicons name="call" size={16} color={G.primary} />
            <Text style={styles.actionButtonText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => handleViewDetails(farmer)}
          >
            <Ionicons name="information-circle" size={16} color={G.info} />
            <Text style={[styles.actionButtonText, styles.detailsButtonText]}>Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStats = () => {
    const active = farmers.filter(f => f.status === 'active').length;
    const pending = farmers.filter(f => f.status === 'pending').length;
    const inactive = farmers.filter(f => f.status === 'inactive').length;
    const total = farmers.length;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total Farmers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{inactive}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>
    );
  };

  const counts = allStatuses.slice(1).reduce<Record<string, number>>((acc, status) => {
    acc[status] = farmers.filter((f) => f.status === status).length;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Farmers Management</Text>
        <Text style={styles.subtitle}>Manage and monitor farmer accounts</Text>
      </View>

      {/* Stats */}
      {renderStats()}

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {allStatuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              statusFilter === status && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[
              styles.filterText,
              statusFilter === status && styles.filterTextActive,
            ]}>
              {status} {status !== 'All' && counts[status] > 0 && `(${counts[status]})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={G.sub} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search farmers..."
          placeholderTextColor={G.sub}
        />
      </View>

      {/* Farmers List */}
      <ScrollView style={styles.farmersList}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={G.sub} />
            <Text style={styles.emptyText}>No farmers found</Text>
          </View>
        ) : (
          filtered.map(renderFarmerCard)
        )}
      </ScrollView>

      {/* Add Farmer Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color={G.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.surface,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: G.text,
  },
  statLabel: {
    fontSize: 12,
    color: G.sub,
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: G.white,
    borderWidth: 1,
    borderColor: G.border,
  },
  filterChipActive: {
    backgroundColor: G.primary,
    borderColor: G.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: G.sub,
  },
  filterTextActive: {
    color: G.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: G.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: G.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: G.text,
  },
  farmersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  farmerCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: G.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: G.white,
    fontSize: 14,
    fontWeight: '700',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: G.text,
  },
  farmerLocation: {
    fontSize: 13,
    color: G.sub,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  farmerDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: G.sub,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  ratingLabel: {
    fontSize: 12,
    color: G.sub,
  },
  farmerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: G.primary,
  },
  detailsButton: {
    borderColor: G.info,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: G.primary,
  },
  detailsButtonText: {
    color: G.info,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: G.sub,
    marginTop: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
