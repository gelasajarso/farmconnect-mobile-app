import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadingIndicator from '../components/LoadingIndicator';

// Types
interface OnboardingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: 'FARMER' | 'MERCHANT';
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  notes?: string;
}

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Mock data
const mockRequests: OnboardingRequest[] = [
  {
    id: '1',
    name: 'Dawit Bekele',
    email: 'dawit@farm.com',
    phone: '+251911234567',
    location: 'Oromia, Addis Ababa',
    role: 'FARMER',
    status: 'Pending',
    submittedDate: '2024-01-15',
    notes: 'Experienced in organic farming',
  },
  {
    id: '2',
    name: 'Hanna Solomon',
    email: 'hanna@market.com',
    phone: '+251911765432',
    location: 'Amhara, Bahir Dar',
    role: 'MERCHANT',
    status: 'Approved',
    submittedDate: '2024-01-14',
  },
  {
    id: '3',
    name: 'Kaleb Alemu',
    email: 'kaleb@farm.com',
    phone: '+251911987654',
    location: 'SNNPR, Hawassa',
    role: 'FARMER',
    status: 'Rejected',
    submittedDate: '2024-01-13',
    notes: 'Insufficient documentation',
  },
];

const statusColors = {
  Pending: { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' },
  Approved: { bg: '#E8F5E8', border: '#4CAF50', text: '#2E7D32' },
  Rejected: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },
};

export default function AgentOnboardingScreen() {
  const [requests, setRequests] = useState<OnboardingRequest[]>(mockRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [newModal, setNewModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'FARMER' as 'FARMER' | 'MERCHANT',
    notes: '',
  });

  const allStatuses = ['All', 'Pending', 'Approved', 'Rejected'];

  const filtered = requests.filter((request) => {
    const matchSearch = request.name.toLowerCase().includes(search.toLowerCase()) ||
                      request.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || request.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: action } : request
      )
    );
    setSelectedRequest(null);
  };

  const handleAddRequest = () => {
    if (!newRequest.name || !newRequest.email || !newRequest.phone || !newRequest.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const request: OnboardingRequest = {
      id: Date.now().toString(),
      ...newRequest,
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
    };

    setRequests((prev) => [request, ...prev]);
    setNewRequest({
      name: '',
      email: '',
      phone: '',
      location: '',
      role: 'FARMER',
      notes: '',
    });
    setNewModal(false);
  };

  const getStatusColor = (status: string) => statusColors[status as keyof typeof statusColors];

  const renderRequestCard = (request: OnboardingRequest) => {
    const colors = getStatusColor(request.status);
    return (
      <TouchableOpacity
        key={request.id}
        style={styles.requestCard}
        onPress={() => setSelectedRequest(request)}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestAvatar}>
            <Text style={styles.avatarText}>
              {request.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.requestName}>{request.name}</Text>
            <Text style={styles.requestEmail}>{request.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {request.status}
            </Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call" size={14} color={G.sub} />
            <Text style={styles.detailText}>{request.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={14} color={G.sub} />
            <Text style={styles.detailText}>{request.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color={G.sub} />
            <Text style={styles.detailText}>{request.submittedDate}</Text>
          </View>
        </View>

        <View style={styles.requestFooter}>
          <View style={[styles.roleBadge, {
            backgroundColor: request.role === 'FARMER' ? '#E8F5E8' : '#E3F2FD'
          }]}>
            <Text style={[
              styles.roleText,
              { color: request.role === 'FARMER' ? '#2E7D32' : '#1976D2' }
            ]}>
              {request.role}
            </Text>
          </View>
          {request.notes && (
            <Text style={styles.notesText} numberOfLines={1}>
              {request.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequestModal = () => {
    if (!selectedRequest) return null;

    const colors = getStatusColor(selectedRequest.status);

    return (
      <Modal
        visible={!!selectedRequest}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Onboarding Request</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedRequest(null)}
            >
              <Ionicons name="close" size={24} color={G.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalUserInfo}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {selectedRequest.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={styles.modalUserDetails}>
                <Text style={styles.modalUserName}>{selectedRequest.name}</Text>
                <View style={styles.modalUserMeta}>
                  <View style={[styles.roleBadge, {
                    backgroundColor: selectedRequest.role === 'FARMER' ? '#E8F5E8' : '#E3F2FD'
                  }]}>
                    <Text style={[
                      styles.roleText,
                      { color: selectedRequest.role === 'FARMER' ? '#2E7D32' : '#1976D2' }
                    ]}>
                      {selectedRequest.role}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {selectedRequest.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalInfoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{selectedRequest.email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{selectedRequest.phone}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{selectedRequest.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Submitted</Text>
                <Text style={styles.infoValue}>{selectedRequest.submittedDate}</Text>
              </View>
            </View>

            {selectedRequest.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Agent Notes</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesContent}>{selectedRequest.notes}</Text>
                </View>
              </View>
            )}

            {selectedRequest.status === 'Pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleAction(selectedRequest.id, 'Approved')}
                >
                  <Ionicons name="checkmark-circle" size={20} color={G.white} />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleAction(selectedRequest.id, 'Rejected')}
                >
                  <Ionicons name="close-circle" size={20} color={G.error} />
                  <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderNewRequestModal = () => (
    <Modal
      visible={newModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Onboarding Request</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setNewModal(false)}
          >
            <Ionicons name="close" size={24} color={G.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name</Text>
            <TextInput
              style={styles.formInput}
              value={newRequest.name}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, name: text }))}
              placeholder="e.g. Dawit Bekele"
              placeholderTextColor={G.sub}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              value={newRequest.email}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, email: text }))}
              placeholder="e.g. dawit@farm.com"
              placeholderTextColor={G.sub}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Phone</Text>
            <TextInput
              style={styles.formInput}
              value={newRequest.phone}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, phone: text }))}
              placeholder="+251911..."
              placeholderTextColor={G.sub}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Location</Text>
            <TextInput
              style={styles.formInput}
              value={newRequest.location}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, location: text }))}
              placeholder="Region, City"
              placeholderTextColor={G.sub}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {(['FARMER', 'MERCHANT'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    newRequest.role === role && styles.roleOptionSelected,
                  ]}
                  onPress={() => setNewRequest(prev => ({ ...prev, role }))}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newRequest.role === role && styles.roleOptionTextSelected,
                  ]}>
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              value={newRequest.notes}
              onChangeText={(text) => setNewRequest(prev => ({ ...prev, notes: text }))}
              placeholder="Any relevant notes about this person..."
              placeholderTextColor={G.sub}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setNewModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.submitButton]}
              onPress={handleAddRequest}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const counts = allStatuses.slice(1).reduce<Record<string, number>>((acc, status) => {
    acc[status] = requests.filter((r) => r.status === status).length;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Onboarding</Text>
        <Text style={styles.subtitle}>
          Manage farmer and merchant onboarding requests
        </Text>
      </View>

      {/* Action Button */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setNewModal(true)}
        >
          <Ionicons name="add" size={16} color={G.white} />
          <Text style={styles.addButtonText}>New Request</Text>
        </TouchableOpacity>
      </View>

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
          placeholder="Search requests..."
          placeholderTextColor={G.sub}
        />
      </View>

      {/* Requests List */}
      <ScrollView style={styles.requestsList}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={G.sub} />
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        ) : (
          filtered.map(renderRequestCard)
        )}
      </ScrollView>

      {/* Modals */}
      {renderRequestModal()}
      {renderNewRequestModal()}
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
    fontSize: 13,
    color: G.sub,
    marginTop: 2,
  },
  headerActions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: G.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: G.white,
    fontSize: 16,
    fontWeight: '600',
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
  requestsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestAvatar: {
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
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700',
    color: G.text,
  },
  requestEmail: {
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
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
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
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 12,
    color: G.sub,
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 12,
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
  modalContainer: {
    flex: 1,
    backgroundColor: G.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: G.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: G.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: G.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: G.white,
    fontSize: 20,
    fontWeight: '700',
  },
  modalUserDetails: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
  },
  modalUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  modalInfoGrid: {
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    backgroundColor: G.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: G.sub,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: G.text,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
    marginBottom: 8,
  },
  notesBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  notesContent: {
    fontSize: 14,
    color: G.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  approveButton: {
    backgroundColor: G.success,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: G.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: G.white,
  },
  rejectButtonText: {
    color: G.error,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: G.text,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: G.border,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: G.primary,
    borderColor: G.primary,
  },
  roleOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: G.sub,
  },
  roleOptionTextSelected: {
    color: G.white,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: G.border,
  },
  submitButton: {
    backgroundColor: G.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: G.white,
  },
});
