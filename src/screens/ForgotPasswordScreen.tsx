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
import { sendOtp, verifyOtp, resetPassword } from "../services/auth.service";

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

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focused, setFocused] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  async function handleSendOtp() {
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
    try {
      await sendOtp(email.trim());
      setStep("otp");
    } catch (err: any) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email.trim(), otp.trim());
      setResetToken(res.token);
      setStep("reset");
    } catch (err: any) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    if (!newPassword.trim()) {
      setError("New password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setStep("success");
    } catch (err: any) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function renderEmailStep() {
    return (
      <>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Text style={styles.iconEmoji}>🔑</Text>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we'll send you a one-time password
          (OTP).
        </Text>

        <Text style={styles.label}>Email Address</Text>
        <View
          style={[
            styles.inputRow,
            focused === "email" ? styles.inputFocused : null,
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
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
          />
        </View>
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading ? "Sending…" : "Send OTP"}
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderOtpStep() {
    return (
      <>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <Text style={styles.label}>OTP Code</Text>
        <View
          style={[
            styles.inputRow,
            focused === "otp" ? styles.inputFocused : null,
            error ? styles.inputError : null,
          ]}
        >
          <Text style={styles.inputIcon}>🔢</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="123456"
            placeholderTextColor={G.sub}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
            onFocus={() => setFocused("otp")}
            onBlur={() => setFocused("")}
          />
        </View>
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleVerifyOtp}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading ? "Verifying…" : "Verify OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => setStep("email")}
        >
          <Text style={styles.backLinkText}>← Change Email</Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderResetStep() {
    return (
      <>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password.</Text>

        <Text style={styles.label}>New Password</Text>
        <View
          style={[
            styles.inputRow,
            focused === "newPassword" ? styles.inputFocused : null,
            error ? styles.inputError : null,
          ]}
        >
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={G.sub}
            secureTextEntry
            editable={!loading}
            onFocus={() => setFocused("newPassword")}
            onBlur={() => setFocused("")}
          />
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View
          style={[
            styles.inputRow,
            focused === "confirmPassword" ? styles.inputFocused : null,
            error ? styles.inputError : null,
          ]}
        >
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor={G.sub}
            secureTextEntry
            editable={!loading}
            onFocus={() => setFocused("confirmPassword")}
            onBlur={() => setFocused("")}
          />
        </View>
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading ? "Resetting…" : "Reset Password"}
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderSuccessStep() {
    return (
      <View style={styles.successCard}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>Password Reset Successful</Text>
        <Text style={styles.successBody}>
          Your password has been reset. You can now sign in with your new
          password.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
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
          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOtpStep()}
          {step === "reset" && renderResetStep()}
          {step === "success" && renderSuccessStep()}

          {step !== "success" && step !== "otp" && (
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
  emailHighlight: { color: G.primary, fontWeight: "700" },
});
