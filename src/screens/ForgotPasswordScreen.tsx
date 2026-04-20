import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AuthStackParamList } from "../navigation/types";
import { isValidEmail } from "../utils/validation";

type NavProp = StackNavigationProp<AuthStackParamList, "ForgotPassword">;

const G = {
  primary: "#1A7A35",
  surface: "#F2FAF5",
  border: "#C8E6C9",
  muted: "#6B8F71",
  text: "#0D1B0F",
  sub: "#7A9E80",
  error: "#C62828",
  white: "#fff",
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError("");
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    // Mock: simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            onPress={() => navigation.navigate("Login")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.content}>
          {!sent ? (
            <>
              {/* Icon */}
              <View style={styles.iconWrap}>
                <Text style={styles.iconEmoji}>🔑</Text>
              </View>

              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered email and we'll send you a reset link.
              </Text>

              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputRow,
                  focused ? styles.inputFocused : null,
                  error ? styles.inputError : null,
                ]}
              >
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
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </View>
              {error ? <Text style={styles.fieldError}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Success state */
            <View style={styles.successCard}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successBody}>
                A password reset link has been sent to{"\n"}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {!sent && (
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.backLinkText}>← Back to Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.white },
  scroll: { flexGrow: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: G.primary,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 26,
    color: G.white,
    fontWeight: "300",
    lineHeight: 30,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: G.white,
    letterSpacing: 0.2,
  },

  content: { paddingHorizontal: 26, paddingTop: 36, paddingBottom: 48 },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EDFBF2",
    borderWidth: 1.5,
    borderColor: G.border,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  iconEmoji: { fontSize: 32 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: G.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: G.muted,
    marginBottom: 8,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: G.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 15 : 4,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: G.border,
  },
  inputFocused: { borderColor: "#25D366", backgroundColor: "#EDFBF2" },
  inputError: { borderColor: G.error, backgroundColor: "#FFF8F8" },
  inputIcon: { fontSize: 15, marginRight: 10, opacity: 0.6 },
  input: { flex: 1, fontSize: 15, color: G.text, fontWeight: "500" },
  fieldError: {
    color: G.error,
    fontSize: 12,
    marginBottom: 14,
    fontWeight: "500",
  },

  btn: {
    backgroundColor: G.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 20,
    shadowColor: G.primary,
    shadowOpacity: 0.38,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  btnDisabled: { backgroundColor: "#A5D6A7", shadowOpacity: 0, elevation: 0 },
  btnText: {
    color: G.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  backLink: { alignItems: "center", marginTop: 24 },
  backLinkText: { fontSize: 14, color: G.primary, fontWeight: "700" },

  // Success
  successCard: { alignItems: "center", paddingTop: 20 },
  successEmoji: { fontSize: 56, marginBottom: 20 },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: G.text,
    marginBottom: 12,
  },
  successBody: {
    fontSize: 14,
    color: G.sub,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  successEmail: { color: G.primary, fontWeight: "700" },
});
