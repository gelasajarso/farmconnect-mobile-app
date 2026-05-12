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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AuthStackParamList } from "../navigation/types";
import { useAuth } from "../context/AuthContext";
import { resendOtp } from "../services/auth.service";
import { extractApiError } from "../utils/errorHandling";

type NavProp = StackNavigationProp<AuthStackParamList, "OtpVerification">;
type RouteProps = RouteProp<AuthStackParamList, "OtpVerification">;

const G = {
  primary: "#1A7A35",
  light: "#25D366",
  surface: "#F2FAF5",
  border: "#C8E6C9",
  muted: "#6B8F71",
  text: "#0D1B0F",
  sub: "#7A9E80",
  error: "#C62828",
  errorBg: "#FFEBEE",
  successBg: "#E8F5E9",
  successText: "#2E7D32",
  white: "#fff",
};

export default function OtpVerificationScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { userId, method, email } = route.params;

  const { verifyOTP } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [focused, setFocused] = useState(false);

  function buildSubtitle(): string {
    if (method === "email" && email) {
      return `We sent a 6-digit code to ${email}`;
    }
    if (method === "phone") {
      return "We sent a 6-digit code to your phone number";
    }
    return "We sent a 6-digit verification code to you";
  }

  async function handleVerify() {
    setError("");
    setSuccessMsg("");
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP({ user_id: userId, code, method });
      // On success, AuthContext sets the user → RootNavigator automatically
      // switches to the role dashboard. No explicit navigation needed.
    } catch (err: unknown) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccessMsg("");
    setResending(true);
    try {
      const res = await resendOtp(userId, method);
      setSuccessMsg(res.message ?? "OTP resent successfully.");
    } catch (err: unknown) {
      setError(extractApiError(err).message);
    } finally {
      setResending(false);
    }
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
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Account</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Text style={styles.iconEmoji}>
              {method === "email" ? "✉️" : "📱"}
            </Text>
          </View>

          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.subtitle}>{buildSubtitle()}</Text>

          {/* Error banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Success banner */}
          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ {successMsg}</Text>
            </View>
          ) : null}

          {/* OTP input */}
          <Text style={styles.label}>Verification Code</Text>
          <View
            style={[
              styles.inputRow,
              focused && styles.inputFocused,
              error ? styles.inputError : null,
            ]}
          >
            <Text style={styles.inputIcon}>🔢</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(v) => {
                setCode(v);
                if (error) setError("");
              }}
              placeholder="123456"
              placeholderTextColor={G.sub}
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={G.white} />
            ) : (
              <Text style={styles.btnText}>Verify</Text>
            )}
          </TouchableOpacity>

          {/* Resend link */}
          <TouchableOpacity
            style={styles.resendRow}
            onPress={handleResend}
            disabled={resending || loading}
            activeOpacity={0.7}
          >
            {resending ? (
              <ActivityIndicator size="small" color={G.primary} />
            ) : (
              <Text style={styles.resendText}>Resend OTP</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: 28,
  },

  errorBox: {
    backgroundColor: G.errorBg,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: G.error,
  },
  errorText: { color: G.error, fontSize: 13, fontWeight: "600" },

  successBox: {
    backgroundColor: G.successBg,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: G.successText,
  },
  successText: { color: G.successText, fontSize: 13, fontWeight: "600" },

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
  inputFocused: { borderColor: G.light, backgroundColor: "#EDFBF2" },
  inputError: { borderColor: G.error, backgroundColor: "#FFF8F8" },
  inputIcon: { fontSize: 15, marginRight: 10, opacity: 0.6 },
  input: { flex: 1, fontSize: 15, color: G.text, fontWeight: "500" },

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

  resendRow: { alignItems: "center", marginTop: 20 },
  resendText: { fontSize: 14, color: G.primary, fontWeight: "700" },
});
