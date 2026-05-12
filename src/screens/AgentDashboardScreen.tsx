import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

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
const stats = [
  { label: 'Total Farmers', value: '156', change: '+12', icon: 'people', color: '#4CAF50' },
  { label: 'Active Merchants', value: '89', change: '+8', icon: 'storefront', color: '#2196F3' },
  { label: 'Pending Onboarding', value: '23', change: '-3', icon: 'time', color: '#FF9800' },
  { label: 'This Month', value: '45', change: '+15', icon: 'calendar', color: '#9C27B0' },
];

const recentActivities = [
  { id: '1', type: 'farmer', name: 'Dawit Bekele', action: 'Onboarded', time: '2 hours ago', status: 'completed' },
  { id: '2', type: 'merchant', name: 'Hanna Solomon', action: 'Verified', time: '4 hours ago', status: 'completed' },
  { id: '3', type: 'farmer', name: 'Kaleb Alemu', action: 'Contacted', time: '6 hours ago', status: 'pending' },
  { id: '4', type: 'merchant', name: 'Sara Tesfaye', action: 'Registered', time: '1 day ago', status: 'pending' },
];

const quickActions = [
  { title: 'Onboard Farmer', icon: 'person-add', screen: 'AgentOnboarding', color: '#4CAF50' },
  { title: 'View Region', icon: 'map', screen: 'AgentRegion', color: '#2196F3' },
  { title: 'Manage Farmers', icon: 'people', screen: 'AgentFarmers', color: '#FF9800' },
  { title: 'Reports', icon: 'bar-chart', screen: 'AgentReports', color: '#9C27B0' },
];

export default function AgentDashboardScreen() {
  const { user } = useAuth();

  const renderStatCard = (stat: typeof stats[0]) => (
    <View key={stat.label} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
        <Ionicons name={stat.icon as any} size={24} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <View style={[
        styles.changeBadge,
        { backgroundColor: stat.change.startsWith('+') ? '#E8F5E8' : '#FFEBEE' }
      ]}>
        <Text style={[
          styles.changeText,
          { color: stat.change.startsWith('+') ? '#2E7D32' : '#C62828' }
        ]}>
          {stat.change}
        </Text>
      </View>
    </View>
  );

  const renderActivityItem = (activity: typeof recentActivities[0]) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={[
        styles.activityIcon,
        { backgroundColor: activity.type === 'farmer' ? '#E8F5E8' : '#E3F2FD' }
      ]}>
        <Ionicons 
          name={activity.type === 'farmer' ? 'leaf' : 'storefront' as any} 
          size={16} 
          color={activity.type === 'farmer' ? '#2E7D32' : '#1976D2'} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityAction}>{activity.action}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
      <View style={[
        styles.activityStatus,
        { backgroundColor: activity.status === 'completed' ? '#E8F5E8' : '#FFF3E0' }
      ]}>
        <Text style={[
          styles.activityStatusText,
          { color: activity.status === 'completed' ? '#2E7D32' : '#F57C00' }
        ]}>
          {activity.status}
        </Text>
      </View>
    </View>
  );

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <TouchableOpacity key={action.title} style={styles.quickAction}>
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon as any} size={24} color={G.white} />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Agent'}! 👋</Text>
            <Text style={styles.subtitle}>Here's your overview today</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AG'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map(renderStatCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {recentActivities.map(renderActivityItem)}
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Onboarding Rate</Text>
              <Text style={styles.performanceValue}>87%</Text>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceFill, { width: '87%' }]} />
              </View>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Response Time</Text>
              <Text style={styles.performanceValue}>2.4 hrs</Text>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceFill, { width: '75%' }]} />
              </View>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Satisfaction</Text>
              <Text style={styles.performanceValue}>4.8/5</Text>
              <View style={styles.performanceBar}>
                <View style={[styles.performanceFill, { width: '96%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          <View style={styles.tasksList}>
            <View style={styles.taskItem}>
              <View style={styles.taskIcon}>
                <Ionicons name="person-add" size={20} color={G.white} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>3 pending onboarding requests</Text>
                <Text style={styles.taskSubtitle}>Review and approve new applications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={G.sub} />
            </View>
            <View style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: G.warning }]}>
                <Ionicons name="map" size={20} color={G.white} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>Region visit scheduled</Text>
                <Text style={styles.taskSubtitle}>Oromia region - Tomorrow 10:00 AM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={G.sub} />
            </View>
            <View style={styles.taskItem}>
              <View style={[styles.taskIcon, { backgroundColor: G.info }]}>
                <Ionicons name="bar-chart" size={20} color={G.white} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>Monthly report due</Text>
                <Text style={styles.taskSubtitle}>Submit by end of week</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={G.sub} />
            </View>
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
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: G.white,
    fontSize: 16,
    fontWeight: '700',
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
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: G.text,
  },
  statLabel: {
    fontSize: 12,
    color: G.sub,
    marginTop: 4,
  },
  changeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
    textAlign: 'center',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
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
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  activityAction: {
    fontSize: 13,
    color: G.sub,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: G.sub,
    marginTop: 2,
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 20,
  },
  performanceItem: {
    gap: 8,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: G.primary,
  },
  performanceBar: {
    height: 6,
    backgroundColor: G.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceFill: {
    height: '100%',
    backgroundColor: G.primary,
    borderRadius: 3,
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
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
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  taskSubtitle: {
    fontSize: 12,
    color: G.sub,
    marginTop: 2,
  },
});
