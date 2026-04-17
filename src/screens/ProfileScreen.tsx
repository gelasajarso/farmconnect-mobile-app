import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  FARMER:   '#1A7A35',
  MERCHANT: '#1565C0',
  DELIVERY: '#00695C',
  ADMIN:    '#6A1B9A',
  MANAGER:  '#6A1B9A',
  AGENT:    '#6A1B9A',
};

const ROLE_LABELS: Record<string, string> = {
  FARMER:   'Farmer',
  MERCHANT: 'Merchant',
  DELIVERY: 'Delivery Agent',
  ADMIN:    'Administrator',
  MANAGER:  'Manager',
  AGENT:    'Agent',
};

const ROLE_EMOJI: Record<string, string> = {
  FARMER:   '🌾',
  MERCHANT: '🛒',
  DELIVERY: '🚚',
  ADMIN:    '🛠️',
  MANAGER:  '📋',
  AGENT:    '👤',
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateName(v: string): string {
  const t = v.trim();
  if (!t)          return 'Name is required.';
  if (t.length < 2) return 'Name must be at least 2 characters.';
  if (t.length > 60) return 'Name must be at most 60 characters.';
  return '';
}

function validateEmail(v: string): string {
  const t = v.trim();
  if (!t) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return 'Enter a valid email address.';
  return '';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();

  const roleColor = ROLE_COLORS[user?.role ?? ''] ?? '#424242';
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'User';
  const roleEmoji = ROLE_EMOJI[user?.role ?? ''] ?? '👤';

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState(user?.name ?? '');
  const [email, setEmail]         = useState(user?.email ?? '');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [saving, setSaving]       = useState(false);

  const startEdit = useCallback(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setNameError('');
    setEmailError('');
    setEditing(true);
  }, [user]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setNameError('');
    setEmailError('');
  }, []);

  async function handleSave() {
    const ne = validateName(name);
    const ee = validateEmail(email);
    setNameError(ne);
    setEmailError(ee);
    if (ne || ee) return;

    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setEditing(false);
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.');
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Hero ── */}
          <View style={[styles.hero, { backgroundColor: roleColor }]}>
            <View style={styles.avatarWrap}>
              <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
            </View>
            <Text style={styles.heroName}>{user?.name ?? 'User'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleEmoji}  {roleLabel}</Text>
            </View>
            {user?.system_user_id && (
              <Text style={styles.heroId}>{user.system_user_id}</Text>
            )}
          </View>

          {/* ── View mode ── */}
          {!editing && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Account Info</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={startEdit} activeOpacity={0.75}>
                    <Text style={styles.editBtnText}>✏️  Edit</Text>
                  </TouchableOpacity>
                </View>
                <InfoRow icon="👤" label="Full Name"  value={user?.name ?? '—'} />
                <InfoRow icon="✉️"  label="Email"      value={user?.email ?? '—'} />
                <InfoRow icon="🏷️" label="Role"       value={roleLabel} />
                {user?.system_user_id && (
                  <InfoRow icon="🆔" label="User ID"   value={user.system_user_id} />
                )}
                <InfoRow
                  icon="🔑"
                  label="Account ID"
                  value={user?.keycloak_id ? `${user.keycloak_id.slice(0, 18)}…` : '—'}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <ActionRow icon="🚪" label="Sign Out" danger onPress={handleLogout} />
              </View>
            </>
          )}

          {/* ── Edit mode ── */}
          {editing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  value={name}
                  onChangeText={t => { setName(t); setNameError(''); }}
                  placeholder="Your full name"
                  placeholderTextColor="#BDBDBD"
                  editable={!saving}
                  autoCapitalize="words"
                />
                {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  value={email}
                  onChangeText={t => { setEmail(t); setEmailError(''); }}
                  placeholder="you@example.com"
                  placeholderTextColor="#BDBDBD"
                  editable={!saving}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
              </View>

              {/* Read-only fields */}
              <InfoRow icon="🏷️" label="Role"    value={roleLabel} />
              {user?.system_user_id && (
                <InfoRow icon="🆔" label="User ID" value={user.system_user_id} />
              )}

              {/* Buttons */}
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>Save Changes</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={cancelEdit}
                  disabled={saving}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, onPress, danger = false }: {
  icon: string; label: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>{label}</Text>
      <Text style={styles.actionChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F9F7' },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  avatarText:  { fontSize: 30, fontWeight: '800' },
  heroName:    { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: -0.3 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 5,
    borderRadius: 20, marginBottom: 6,
  },
  roleBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  heroId:        { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  // Section
  section: {
    backgroundColor: '#fff', borderRadius: 14,
    marginHorizontal: 16, marginTop: 16,
    paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 14, paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#9E9E9E',
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingTop: 14, paddingBottom: 6,
  },
  editBtn: {
    backgroundColor: '#F0FBF3', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  editBtnText: { fontSize: 13, color: '#1A7A35', fontWeight: '700' },

  // Info row
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  infoIcon:  { fontSize: 16, marginRight: 10, width: 24, textAlign: 'center' },
  infoLabel: { fontSize: 14, color: '#757575', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 14, color: '#0D1B0F', fontWeight: '600', maxWidth: '50%', textAlign: 'right' },

  // Action row
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  actionIcon:        { fontSize: 18, marginRight: 12 },
  actionLabel:       { flex: 1, fontSize: 15, color: '#0D1B0F', fontWeight: '600' },
  actionLabelDanger: { color: '#B71C1C' },
  actionChevron:     { fontSize: 20, color: '#BDBDBD' },

  // Edit form
  fieldWrap:  { marginBottom: 4, paddingTop: 10 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    backgroundColor: '#F7F9F7', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15, color: '#0D1B0F', fontWeight: '500',
  },
  inputError: { borderColor: '#B71C1C', backgroundColor: '#FFF8F8' },
  fieldError: { fontSize: 12, color: '#B71C1C', marginTop: 4, fontWeight: '500' },

  editActions: { paddingVertical: 16, gap: 10 },
  saveBtn: {
    backgroundColor: '#1A7A35', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: '#1A7A35', shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#A5D6A7', shadowOpacity: 0, elevation: 0 },
  saveBtnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { color: '#757575', fontSize: 15, fontWeight: '600' },
});
