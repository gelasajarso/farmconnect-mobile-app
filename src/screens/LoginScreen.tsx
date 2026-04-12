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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { extractApiError } from "../utils/errorHandling";
import type { AuthStackParamList } from "../navigation/types";

type LoginNavProp = StackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  function validate(): boolean {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setApiError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    }
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const apiErr = extractApiError(err);

      if (apiErr.status === 401) {
        setApiError("Invalid email or password.");
      } else if (apiErr.status === 0) {
        setApiError(`${apiErr.message} Check network connection.`);
      } else {
        setApiError("Service unavailable. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    onFocus,
    onBlur,
    error,
    rightIcon,
  }: any) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          (label === "Email" ? emailFocus : passwordFocus) && styles.inputFocus,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        {rightIcon}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>FarmConnect App</Text>
          <Text style={styles.subtitle}>
            Welcome back 👋 Sign in to continue
          </Text>

          {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

          {/* Email */}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            error={emailError}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
          />

          {/* Password */}
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            error={passwordError}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text style={styles.showText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            }
          />

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register" as any)}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signUpText}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    color: "#1B5E20",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    color: "#616161",
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#212121",
  },
  inputFocus: {
    borderColor: "#2E7D32",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#D32F2F",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 4,
  },
  showText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 13,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  footerText: {
    color: "#616161",
    fontSize: 13,
  },
  signUpText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "700",
  },
  apiError: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 13,
  },
});
