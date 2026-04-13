import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';
import type { UserRole } from '../types';
import { mockSignup } from '../mock/mockServices';

type NavProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const G = {
  primary: '#1A7A35',
  light:   '#25D366',
  surface: '#F2FAF5',
  border:  '#C8E6C9',
  muted:   '#6B8F71',
  text:    '#0D1B0F',
  sub:     '#7A9E80',
  error:   '#C62828',
  errorBg: '#FFEBEE',
  white:   '#fff',
};

type SelectableRole = 'FARMER' | 'MERCHANT' | 'DELIVERY';

const ROLES: { value: SelectableRole; label: string; emoji: string; desc: string }[] = [
  { value: 'FARMER',   label: 'Farmer',         emoji: '🌾', desc: 'List & sell your produce' },
  { value: 'MERCHANT', label: 'Merchant',        emoji: '🛒', desc: 'Buy farm products in bulk' },
  { value: 'DELIVERY', label: 'Delivery Agent',  emoji: '🚚', desc: 'Deliver orders to buyers' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [role, setRole]           = useState<SelectableRole | null>(null);
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [apiError, setApiError]   = useState('');

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())           e.name     = 'Full name is required.';
    if (!email.trim())          e.email    = 'Email is required.';
    if (!password.trim())       e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Minimum 8 characters.';
    if (password !== confirm)   e.confirm  = 'Passwords do not match.';
    if (!role)                  e.role     = 'Please select a role.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignup() {
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await mockSignup(name.trim(), email.trim(), password, role as UserRole);
      Alert.alert(
        'Account Created',
        'Your account has been created. You can now sign in.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }],
      );
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setApiError('An account with this email already exists.');
      else setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={G.primary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Login')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Join FarmConnect</Text>
          <Text style={styles.subtitle}>Create your account to get started.</Text>

          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>⚠  {apiError}</Text>
            </View>
          ) : null}

          {/* Role selection */}
          <Text style={styles.label}>I am a</Text>
          {errors.role ? <Text style={styles.fieldError}>{errors.role}</Text> : null}
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                onPress={() => setRole(r.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                  {r.label}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
                {role === r.value && <View style={styles.roleCheck}><Text style={styles.roleCheckText}>✓</Text></View>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Full name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputRow, errors.name ? styles.inputError : null]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={G.sub}
              editable={!loading}
            />
          </View>
          {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputRow, errors.email ? styles.inputError : null]}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={G.sub}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputRow, errors.password ? styles.inputError : null]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              placeholderTextColor={G.sub}
              secureTextEntry={!showPass}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.showToggle}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

          {/* Confirm password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputRow, errors.confirm ? styles.inputError : null]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
              placeholderTextColor={G.sub}
              secureTextEntry={!showPass}
              editable={!loading}
            />
          </View>
          {errors.confirm ? <Text style={styles.fieldError}>{errors.confirm}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={G.white} />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <View style={styles.signinRow}>
            <Text style={styles.signinPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: G.white },
  scroll: { flexGrow: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: G.primary,
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 26, color: G.white, fontWeight: '300', lineHeight: 30, marginTop: -2 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: G.white, letterSpacing: 0.2 },

  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 48 },

  title:    { fontSize: 26, fontWeight: '800', color: G.text, letterSpacing: -0.4, marginBottom: 4 },
  subtitle: { fontSize: 14, color: G.sub, fontWeight: '500', marginBottom: 24 },

  apiErrorBox: {
    backgroundColor: G.errorBg, borderRadius: 12, padding: 13,
    marginBottom: 18, borderLeftWidth: 3, borderLeftColor: G.error,
  },
  apiErrorText: { color: G.error, fontSize: 13, fontWeight: '600' },

  label: {
    fontSize: 12, fontWeight: '700', color: G.muted,
    marginBottom: 8, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  fieldError: { color: G.error, fontSize: 12, marginTop: -4, marginBottom: 10, fontWeight: '500' },

  // Role cards
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  roleCard: {
    flex: 1, backgroundColor: G.surface, borderRadius: 14,
    padding: 12, alignItems: 'center', borderWidth: 1.5,
    borderColor: G.border, position: 'relative',
  },
  roleCardActive: { borderColor: G.primary, backgroundColor: '#EDFBF2' },
  roleEmoji:      { fontSize: 24, marginBottom: 6 },
  roleLabel:      { fontSize: 12, fontWeight: '700', color: G.text, textAlign: 'center' },
  roleLabelActive:{ color: G.primary },
  roleDesc:       { fontSize: 10, color: G.sub, textAlign: 'center', marginTop: 3, lineHeight: 13 },
  roleCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: G.primary, justifyContent: 'center', alignItems: 'center',
  },
  roleCheckText: { color: G.white, fontSize: 10, fontWeight: '800' },

  // Inputs
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: G.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    marginBottom: 14, borderWidth: 1.5, borderColor: G.border,
  },
  inputError: { borderColor: G.error, backgroundColor: '#FFF8F8' },
  inputIcon:  { fontSize: 15, marginRight: 10, opacity: 0.6 },
  input:      { flex: 1, fontSize: 15, color: G.text, fontWeight: '500' },
  showToggle: { fontSize: 13, color: G.primary, fontWeight: '700', marginLeft: 8 },

  // Button
  btn: {
    backgroundColor: G.primary, borderRadius: 16,
    paddingVertical: 17, alignItems: 'center',
    marginTop: 8, marginBottom: 20,
    shadowColor: G.primary, shadowOpacity: 0.38,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  btnDisabled: { backgroundColor: '#A5D6A7', shadowOpacity: 0, elevation: 0 },
  btnText:     { color: G.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },

  signinRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signinPrompt: { fontSize: 14, color: G.sub },
  signinLink:   { fontSize: 14, color: G.primary, fontWeight: '700' },
});
