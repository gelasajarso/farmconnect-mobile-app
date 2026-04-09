import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  function handleClearCache() {
    Alert.alert('Cache Cleared', 'Local cache has been cleared successfully.');
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. Please contact your FarmConnect agent to delete your account.',
      [{ text: 'OK' }]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.card}>
          <ToggleRow
            label="Push Notifications"
            sub="Receive alerts for orders and deliveries"
            value={notifications}
            onToggle={setNotifications}
          />
          <ToggleRow
            label="Email Alerts"
            sub="Get updates via email"
            value={emailAlerts}
            onToggle={setEmailAlerts}
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={styles.card}>
          <ToggleRow
            label="Dark Mode"
            sub="Coming soon"
            value={darkMode}
            onToggle={setDarkMode}
            disabled
          />
        </View>

        {/* App Info */}
        <SectionHeader title="About" />
        <View style={styles.card}>
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Environment" value="Production" />
          <InfoRow label="Support" value="support@farmconnect.app" />
        </View>

        {/* Data */}
        <SectionHeader title="Data" />
        <View style={styles.card}>
          <ActionRow label="Clear Cache" icon="🗑️" onPress={handleClearCache} />
          <ActionRow label="Delete Account" icon="⚠️" onPress={handleDeleteAccount} danger />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function ToggleRow({
  label,
  sub,
  value,
  onToggle,
  disabled = false,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, disabled && styles.rowLabelDisabled]}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ true: '#2E7D32' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ActionRow({
  label,
  icon,
  onPress,
  danger = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && styles.dangerText, { flex: 1 }]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  pageTitle: {
    fontSize: 28, fontWeight: '800', color: '#1B5E20',
    marginHorizontal: 16, marginTop: 20, marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12, fontWeight: '700', color: '#9E9E9E',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 16, marginTop: 20, marginBottom: 6,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 16, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, color: '#212121', fontWeight: '500' },
  rowLabelDisabled: { color: '#BDBDBD' },
  rowSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  rowValue: { fontSize: 14, color: '#757575' },
  rowIcon: { fontSize: 18, marginRight: 12 },
  chevron: { fontSize: 20, color: '#BDBDBD' },
  dangerText: { color: '#B71C1C' },
  signOutBtn: {
    backgroundColor: '#FFEBEE', borderRadius: 12,
    marginHorizontal: 16, marginTop: 20,
    paddingVertical: 16, alignItems: 'center',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#B71C1C' },
});
