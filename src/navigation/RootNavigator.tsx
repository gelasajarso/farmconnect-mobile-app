import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { navigationRef } from '../services/api';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import LoadingIndicator from '../components/LoadingIndicator';

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
};

function PendingApprovalScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.pendingRoot}>
      <StatusBar barStyle="dark-content" backgroundColor={G.surface} />
      <Text style={styles.pendingEmoji}>⏳</Text>
      <Text style={styles.pendingTitle}>Account Pending Approval</Text>
      <Text style={styles.pendingBody}>
        Your account is under review. You'll be notified once approved.
      </Text>
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={logout}
        activeOpacity={0.85}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? (
        user.onboarding_status === 'PENDING_REVIEW' ? (
          <PendingApprovalScreen />
        ) : (
          <AppNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  pendingRoot: {
    flex: 1,
    backgroundColor: G.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  pendingEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  pendingBody: {
    fontSize: 15,
    color: G.sub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  signOutBtn: {
    backgroundColor: G.primary,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 48,
    shadowColor: G.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  signOutText: {
    color: G.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
