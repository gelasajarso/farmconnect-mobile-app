import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

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

// Mock data
const regionData = {
  name: 'Oromia Region',
  totalFarmers: 156,
  activeMerchants: 89,
  monthlyGrowth: '+12%',
  coverage: '78%',
};

const districts = [
  { name: 'Addis Ababa', farmers: 45, merchants: 28, status: 'active', lastVisit: '2024-01-15' },
  { name: 'Bishoftu', farmers: 32, merchants: 18, status: 'active', lastVisit: '2024-01-10' },
  { name: 'Adama', farmers: 28, merchants: 15, status: 'active', lastVisit: '2024-01-08' },
  { name: 'Jimma', farmers: 24, merchants: 12, status: 'pending', lastVisit: '2024-01-05' },
  { name: 'Hawassa', farmers: 27, merchants: 16, status: 'active', lastVisit: '2024-01-12' },
];

const upcomingVisits = [
  { id: '1', district: 'Jimma', date: '2024-01-20', purpose: 'Onboarding new farmers', farmers: 8 },
  { id: '2', district: 'Shashemene', date: '2024-01-22', purpose: 'Merchant verification', merchants: 5 },
  { id: '3', district: 'Bishoftu', date: '2024-01-25', purpose: 'Training session', participants: 15 },
];

const performanceMetrics = [
  { label: 'Onboarding Success', value: '87%', target: '90%' },
  { label: 'Farmer Retention', value: '92%', target: '85%' },
  { label: 'Merchant Satisfaction', value: '4.6/5', target: '4.5/5' },
  { label: 'Coverage Rate', value: '78%', target: '80%' },
];

export default function AgentRegionScreen() {
  const { user } = useAuth();

  const renderStatCard = (label: string, value: string, icon: string, color: string) => (
    <View key={label} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderDistrictItem = (district: typeof districts[0]) => (
    <TouchableOpacity key={district.name} style={styles.districtItem}>
      <View style={styles.districtHeader}>
        <Text style={styles.districtName}>{district.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: district.status === 'active' ? '#E8F5E8' : '#FFF3E0' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: district.status === 'active' ? '#2E7D32' : '#F57C00' }
          ]}>
            {district.status}
          </Text>
        </View>
      </View>
      <View style={styles.districtStats}>
        <View style={styles.districtStat}>
          <Ionicons name="leaf" size={14} color={G.primary} />
          <Text style={styles.districtStatText}>{district.farmers} farmers</Text>
        </View>
        <View style={styles.districtStat}>
          <Ionicons name="storefront" size={14} color={G.info} />
          <Text style={styles.districtStatText}>{district.merchants} merchants</Text>
        </View>
      </View>
      <Text style={styles.lastVisit}>Last visit: {district.lastVisit}</Text>
    </TouchableOpacity>
  );

  const renderVisitItem = (visit: typeof upcomingVisits[0]) => (
    <View key={visit.id} style={styles.visitItem}>
      <View style={styles.visitDate}>
        <Text style={styles.visitDay}>{new Date(visit.date).getDate()}</Text>
        <Text style={styles.visitMonth}>{new Date(visit.date).toLocaleDateString('en', { month: 'short' })}</Text>
      </View>
      <View style={styles.visitContent}>
        <Text style={styles.visitDistrict}>{visit.district}</Text>
        <Text style={styles.visitPurpose}>{visit.purpose}</Text>
        <View style={styles.visitParticipants}>
          <Text style={styles.visitParticipantsText}>
            {visit.farmers ? `${visit.farmers} farmers` : `${visit.merchants} merchants`}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.visitAction}>
        <Ionicons name="chevron-forward" size={20} color={G.sub} />
      </TouchableOpacity>
    </View>
  );

  const renderMetricItem = (metric: typeof performanceMetrics[0]) => (
    <View key={metric.label} style={styles.metricItem}>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <Text style={styles.metricTarget}>Target: {metric.target}</Text>
      <View style={styles.metricBar}>
        <View
          style={[
            styles.metricFill,
            {
              width: `${Math.min(100, (parseFloat(metric.value) / parseFloat(metric.target)) * 100)}%`,
              backgroundColor: parseFloat(metric.value) >= parseFloat(metric.target) ? G.success : G.warning
            }
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Region Overview</Text>
            <Text style={styles.subtitle}>{regionData.name}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="map" size={20} color={G.white} />
          </TouchableOpacity>
        </View>

        {/* Region Stats */}
        <View style={styles.statsContainer}>
          {renderStatCard('Total Farmers', regionData.totalFarmers.toString(), 'people', G.primary)}
          {renderStatCard('Active Merchants', regionData.activeMerchants.toString(), 'storefront', G.info)}
          {renderStatCard('Monthly Growth', regionData.monthlyGrowth, 'trending-up', G.success)}
          {renderStatCard('Coverage Rate', regionData.coverage, 'map', G.warning)}
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsContainer}>
            {performanceMetrics.map(renderMetricItem)}
          </View>
        </View>

        {/* Districts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Districts</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.districtsList}>
            {districts.map(renderDistrictItem)}
          </View>
        </View>

        {/* Upcoming Visits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Visits</Text>
          <View style={styles.visitsList}>
            {upcomingVisits.map(renderVisitItem)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: G.primary }]}>
                <Ionicons name="calendar" size={20} color={G.white} />
              </View>
              <Text style={styles.actionTitle}>Schedule Visit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: G.info }]}>
                <Ionicons name="document-text" size={20} color={G.white} />
              </View>
              <Text style={styles.actionTitle}>Generate Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: G.success }]}>
                <Ionicons name="people" size={20} color={G.white} />
              </View>
              <Text style={styles.actionTitle}>View Farmers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: G.warning }]}>
                <Ionicons name="storefront" size={20} color={G.white} />
              </View>
              <Text style={styles.actionTitle}>View Merchants</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  statLabel: {
    fontSize: 12,
    color: G.sub,
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: G.primary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: G.white,
  },
  metricsContainer: {
    gap: 16,
  },
  metricItem: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: G.primary,
    marginBottom: 2,
  },
  metricTarget: {
    fontSize: 12,
    color: G.sub,
    marginBottom: 8,
  },
  metricBar: {
    height: 6,
    backgroundColor: G.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 3,
  },
  districtsList: {
    gap: 12,
  },
  districtItem: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  districtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  districtName: {
    fontSize: 16,
    fontWeight: '700',
    color: G.text,
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
  districtStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  districtStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  districtStatText: {
    fontSize: 13,
    color: G.sub,
  },
  lastVisit: {
    fontSize: 12,
    color: G.sub,
  },
  visitsList: {
    gap: 12,
  },
  visitItem: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  visitDate: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  visitDay: {
    fontSize: 18,
    fontWeight: '700',
    color: G.white,
  },
  visitMonth: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  visitContent: {
    flex: 1,
  },
  visitDistrict: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  visitPurpose: {
    fontSize: 13,
    color: G.sub,
    marginTop: 2,
  },
  visitParticipants: {
    marginTop: 4,
  },
  visitParticipantsText: {
    fontSize: 12,
    color: G.primary,
    fontWeight: '500',
  },
  visitAction: {
    padding: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: G.text,
    textAlign: 'center',
  },
});
