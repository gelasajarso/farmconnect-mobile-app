import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Platform, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import LoadingIndicator from '../components/LoadingIndicator';

// Types
interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface TrackingDelivery {
  id: string;
  orderId: string;
  product: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  agent: DeliveryAgent;
  farmer: DeliveryLocation;
  merchant: DeliveryLocation;
  estimatedArrival: Date;
  progress: number;
}

interface TimelineEvent {
  id: string;
  type: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  timestamp: Date;
  description: string;
  location?: string;
}

// Mock data
const mockDeliveries: TrackingDelivery[] = [
  {
    id: '1',
    orderId: 'ORD-2024-001',
    product: 'Timatim Salata',
    status: 'IN_TRANSIT',
    agent: {
      id: 'agent1',
      name: 'Abel Tadesse',
      phone: '+251911234567',
      location: { latitude: 9.0200, longitude: 38.7460 },
    },
    farmer: {
      latitude: 9.0000,
      longitude: 38.7600,
      address: 'Bole, Addis Ababa',
    },
    merchant: {
      latitude: 9.0400,
      longitude: 38.7300,
      address: 'Merkato, Addis Ababa',
    },
    estimatedArrival: new Date(Date.now() + 45 * 60 * 1000),
    progress: 65,
  },
  {
    id: '2',
    orderId: 'ORD-2024-002',
    product: 'Selata Lettuce',
    status: 'ASSIGNED',
    agent: {
      id: 'agent2',
      name: 'Hanna Solomon',
      phone: '+251911765432',
      location: { latitude: 9.0100, longitude: 38.7500 },
    },
    farmer: {
      latitude: 9.0200,
      longitude: 38.7400,
      address: 'Kazanchis, Addis Ababa',
    },
    merchant: {
      latitude: 9.0000,
      longitude: 38.7600,
      address: 'Bole, Addis Ababa',
    },
    estimatedArrival: new Date(Date.now() + 90 * 60 * 1000),
    progress: 15,
  },
];

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

const STATUS_COLORS = {
  ASSIGNED: G.warning,
  PICKED_UP: G.info,
  IN_TRANSIT: '#FF9800',
  DELIVERED: G.success,
  FAILED: G.error,
};

export default function DeliveryTrackingScreen() {
  const [deliveries, setDeliveries] = useState<TrackingDelivery[]>(mockDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<TrackingDelivery>(mockDeliveries[0]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationPermission();
    startLocationTracking();
    return () => {
      // Cleanup location tracking
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCurrentLocation(location);
    } catch (error) {
      console.error('Location permission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    // Simulate real-time location updates
    const interval = setInterval(() => {
      setDeliveries(prev => prev.map(delivery => ({
        ...delivery,
        agent: {
          ...delivery.agent,
          location: {
            latitude: delivery.agent.location.latitude + (Math.random() - 0.5) * 0.002,
            longitude: delivery.agent.location.longitude + (Math.random() - 0.5) * 0.002,
          },
        },
        progress: Math.min(100, delivery.progress + Math.random() * 2),
      })));
    }, 3000);

    return () => clearInterval(interval);
  };

  const buildTimeline = (delivery: TrackingDelivery): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        id: '1',
        type: 'assigned',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: `Delivery assigned to ${delivery.agent.name}`,
        location: 'Dispatch Center',
      },
      {
        id: '2',
        type: 'picked_up',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        description: 'Package picked up from farmer',
        location: delivery.farmer.address,
      },
    ];

    if (delivery.status === 'IN_TRANSIT' || delivery.status === 'DELIVERED') {
      events.push({
        id: '3',
        type: 'in_transit',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        description: 'Package in transit to merchant',
        location: 'En route',
      });
    }

    if (delivery.status === 'DELIVERED') {
      events.push({
        id: '4',
        type: 'delivered',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        description: 'Package delivered successfully',
        location: delivery.merchant.address,
      });
    }

    return events;
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS] || G.sub;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'Assigned';
      case 'PICKED_UP': return 'Picked Up';
      case 'IN_TRANSIT': return 'In Transit';
      case 'DELIVERED': return 'Delivered';
      case 'FAILED': return 'Failed';
      default: return status;
    }
  };

  const renderDeliveryTab = (delivery: TrackingDelivery) => (
    <TouchableOpacity
      key={delivery.id}
      style={[
        styles.deliveryTab,
        selectedDelivery.id === delivery.id && styles.activeDeliveryTab,
      ]}
      onPress={() => setSelectedDelivery(delivery)}
    >
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(delivery.status) }]} />
      <View style={styles.deliveryTabContent}>
        <Text style={styles.deliveryTabProduct}>{delivery.product}</Text>
        <Text style={styles.deliveryTabInfo}>
          {delivery.orderId} · {delivery.agent.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSummaryCard = (label: string, value: number, icon: string, color: string) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={18} color={G.white} />
      </View>
      <View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    </View>
  );

  const renderDeliveryInfo = () => (
    <View style={styles.deliveryInfo}>
      <View style={styles.infoHeader}>
        <Text style={styles.orderId}>{selectedDelivery.orderId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedDelivery.status) }]}>
          <Text style={styles.statusText}>{getStatusText(selectedDelivery.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.productName}>{selectedDelivery.product}</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${selectedDelivery.progress}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(selectedDelivery.progress)}%</Text>
      </View>

      <View style={styles.agentInfo}>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentInitial}>
            {selectedDelivery.agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.agentDetails}>
          <Text style={styles.agentName}>{selectedDelivery.agent.name}</Text>
          <Text style={styles.agentPhone}>{selectedDelivery.agent.phone}</Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={16} color={G.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.locationInfo}>
        <View style={styles.locationItem}>
          <Ionicons name="leaf" size={16} color={G.primary} />
          <Text style={styles.locationText}>{selectedDelivery.farmer.address}</Text>
        </View>
        <Ionicons name="arrow-down" size={16} color={G.sub} />
        <View style={styles.locationItem}>
          <Ionicons name="storefront" size={16} color={G.primary} />
          <Text style={styles.locationText}>{selectedDelivery.merchant.address}</Text>
        </View>
      </View>
    </View>
  );

  const renderTimeline = () => {
    const timeline = buildTimeline(selectedDelivery);
    return (
      <View style={styles.timeline}>
        <Text style={styles.timelineTitle}>Delivery Timeline</Text>
        {timeline.map((event, index) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineDotContainer}>
              <View style={[
                styles.timelineDot,
                { backgroundColor: getStatusColor(event.type) }
              ]} />
              {index < timeline.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDescription}>{event.description}</Text>
              <Text style={styles.timelineLocation}>{event.location}</Text>
              <Text style={styles.timelineTime}>
                {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMap = () => {
    if (mapError) {
      return (
        <View style={[styles.mapContainer, styles.mapErrorContainer]}>
          <Ionicons name="map-outline" size={48} color={G.sub} />
          <Text style={styles.mapErrorText}>Map unavailable</Text>
          <Text style={styles.mapErrorSubtext}>Please check your internet connection</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => setMapError(false)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: (selectedDelivery.farmer.latitude + selectedDelivery.merchant.latitude) / 2,
            longitude: (selectedDelivery.farmer.longitude + selectedDelivery.merchant.longitude) / 2,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          loadingEnabled={true}
          loadingIndicatorColor={G.primary}
          onMapReady={() => {}}
        >
        {/* Farmer location */}
        <Marker
          coordinate={{
            latitude: selectedDelivery.farmer.latitude,
            longitude: selectedDelivery.farmer.longitude,
          }}
          title="Farmer"
          description={selectedDelivery.farmer.address}
        >
          <View style={styles.markerFarmer}>
            <Ionicons name="leaf" size={16} color={G.white} />
          </View>
        </Marker>

        {/* Merchant location */}
        <Marker
          coordinate={{
            latitude: selectedDelivery.merchant.latitude,
            longitude: selectedDelivery.merchant.longitude,
          }}
          title="Merchant"
          description={selectedDelivery.merchant.address}
        >
          <View style={styles.markerMerchant}>
            <Ionicons name="storefront" size={16} color={G.white} />
          </View>
        </Marker>

        {/* Agent location */}
        <Marker
          coordinate={{
            latitude: selectedDelivery.agent.location.latitude,
            longitude: selectedDelivery.agent.location.longitude,
          }}
          title="Delivery Agent"
          description={selectedDelivery.agent.name}
        >
          <View style={styles.markerAgent}>
            <Ionicons name="bicycle" size={16} color={G.white} />
          </View>
        </Marker>

        {/* Route line */}
        <Polyline
          coordinates={[
            selectedDelivery.farmer,
            selectedDelivery.agent.location,
            selectedDelivery.merchant,
          ]}
          strokeColor={G.primary}
          strokeWidth={3}
          lineDashPattern={[10, 5]}
        />
        </MapView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  const total = deliveries.length;
  const active = deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length;
  const completed = deliveries.filter(d => d.status === 'DELIVERED').length;
  const failed = deliveries.filter(d => d.status === 'FAILED').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Live Tracking</Text>
            <Text style={styles.subtitle}>
              Real-time delivery agent tracking with route visualization
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <Ionicons name="navigate" size={12} color={G.white} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {renderSummaryCard('Total', total, 'car', '#6B7280')}
          {renderSummaryCard('Active', active, 'navigate', G.warning)}
          {renderSummaryCard('Completed', completed, 'checkmark-circle', G.success)}
          {renderSummaryCard('Failed', failed, 'close-circle', G.error)}
        </View>

        {/* Delivery Selector */}
        <View style={styles.deliverySelector}>
          <Text style={styles.selectorTitle}>Select Delivery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {deliveries.map(renderDeliveryTab)}
          </ScrollView>
        </View>

        {/* Map */}
        {renderMap()}

        {/* Delivery Info */}
        {renderDeliveryInfo()}

        {/* Timeline */}
        {renderTimeline()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 13,
    color: G.sub,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: G.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveText: {
    color: G.white,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: G.text,
  },
  summaryLabel: {
    fontSize: 10,
    color: G.sub,
    marginTop: 2,
  },
  deliverySelector: {
    padding: 20,
    paddingTop: 16,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: G.text,
    marginBottom: 12,
  },
  deliveryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: G.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: G.border,
    marginRight: 12,
    minWidth: 200,
  },
  activeDeliveryTab: {
    backgroundColor: '#FFF3E0',
    borderColor: G.warning,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  deliveryTabContent: {
    flex: 1,
  },
  deliveryTabProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  deliveryTabInfo: {
    fontSize: 12,
    color: G.sub,
    marginTop: 2,
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
    ...Platform.select({
      ios: {
        marginTop: 0,
      },
      android: {
        marginTop: 0,
      },
    }),
  },
  markerFarmer: {
    backgroundColor: G.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerMerchant: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerAgent: {
    backgroundColor: G.warning,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryInfo: {
    margin: 20,
    marginTop: 0,
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
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
    color: G.white,
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: G.text,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: G.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: G.primary,
  },
  progressText: {
    fontSize: 12,
    color: G.sub,
    marginTop: 4,
    textAlign: 'right',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: G.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  agentInitial: {
    color: G.white,
    fontSize: 14,
    fontWeight: '700',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  agentPhone: {
    fontSize: 12,
    color: G.sub,
    marginTop: 2,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: G.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    gap: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: G.text,
  },
  timeline: {
    margin: 20,
    marginTop: 0,
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: G.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDotContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: G.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
    marginBottom: 4,
  },
  timelineLocation: {
    fontSize: 12,
    color: G.sub,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 11,
    color: G.sub,
  },
  mapErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
    marginTop: 12,
  },
  mapErrorSubtext: {
    fontSize: 14,
    color: G.sub,
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: G.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: G.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
