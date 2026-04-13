import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { extractApiError } from "../utils/errorHandling";
import type { AuthStackParamList } from "../navigation/types";

type LoginNavProp = StackNavigationProp<AuthStackParamList, "Login">;

const { width, height } = Dimensions.get("window");

const G = {
  primary:   "#1A7A35",
  light:     "#25D366",
  surface:   "#F2FAF5",
  border:    "#C8E6C9",
  muted:     "#6B8F71",
  text:      "#0D1B0F",
  sub:       "#7A9E80",
  error:     "#C62828",
  errorBg:   "#FFEBEE",
  white:     "#fff",
};

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);
  const [emailError, setEmailError]     = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError]         = useState("");
  const [loading, setLoading]           = useState(false);

  function validate(): boolean {
    let valid = true;
    setEmailError(""); setPasswordError(""); setApiError("");
    if (!email.trim())    { setEmailError("Email is required.");    valid = false; }
    if (!password.trim()) { setPasswordError("Password is required."); valid = false; }
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const e = extractApiError(err);
      if (e.status === 401)     setApiError("Invalid email or password.");
      else if (e.status === 0)  setApiError("Network error. Check your connection.");
      else                      setApiError("Service unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" translucent={false} backgroundColor="#1A7A35" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroScrim} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("Landing")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {/* Wave */}
          <View style={styles.wave} />
        </View>

        {/* ── Form ── */}
        <View style={styles.content}>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Access your FarmConnect account.</Text>

          {/* API error */}
          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>⚠  {apiError}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputRow,
            emailFocused ? styles.inputFocused : null,
            emailError   ? styles.inputError   : null,
          ]}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={G.sub}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputRow,
            passFocused   ? styles.inputFocused : null,
            passwordError ? styles.inputError   : null,
          ]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={G.sub}
              secureTextEntry={!showPassword}
              editable={!loading}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.showToggle}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

          {/* Log In */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={G.white} />
              : <Text style={styles.loginBtnText}>Log In</Text>
            }
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: G.white },
  scroll: { flexGrow: 1, backgroundColor: G.white },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    width: "100%",
    height: 200,
    overflow: "hidden",
    backgroundColor: "#1A7A35",
  },
  heroImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  heroScrim: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  wave: {
    position: "absolute",
    bottom: -2,
    left: -30,
    right: -30,
    height: 56,
    backgroundColor: G.white,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },

  // Back button
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 40,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
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

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: 26,
    paddingTop: 4,
    paddingBottom: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0D1B0F",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    marginBottom: 28,
    fontWeight: "500",
  },

  // ── Errors ────────────────────────────────────────────────────────────────
  apiErrorBox: {
    backgroundColor: G.errorBg,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
    borderLeftWidth: 3,
    borderLeftColor: G.error,
  },
  apiErrorText: {
    color: G.error,
    fontSize: 13,
    fontWeight: "600",
  },
  fieldError: {
    color: G.error,
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 2,
    fontWeight: "500",
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: G.muted,
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: G.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 15 : 4,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: G.border,
  },
  inputFocused: {
    borderColor: G.light,
    backgroundColor: "#EDFBF2",
    shadowColor: G.light,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputError: {
    borderColor: G.error,
    backgroundColor: "#FFF8F8",
  },
  inputIcon: {
    fontSize: 15,
    marginRight: 10,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: G.text,
    fontWeight: "500",
  },
  showToggle: {
    fontSize: 13,
    color: G.primary,
    fontWeight: "700",
    marginLeft: 8,
  },

  // ── Button ────────────────────────────────────────────────────────────────
  loginBtn: {
    backgroundColor: G.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 18,
    shadowColor: G.primary,
    shadowOpacity: 0.38,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  loginBtnDisabled: {
    backgroundColor: "#A5D6A7",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginBtnText: {
    color: G.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  forgotBtn: {
    alignItems: "center",
    marginBottom: 22,
  },
  forgotText: {
    color: G.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupPrompt: {
    fontSize: 14,
    color: G.sub,
  },
  signupLink: {
    fontSize: 14,
    color: G.primary,
    fontWeight: "700",
  },
});
