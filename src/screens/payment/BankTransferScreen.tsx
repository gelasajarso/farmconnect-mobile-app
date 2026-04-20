import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { MerchantStackParamList } from "../../navigation/types";
import {
  getBankAccounts,
  submitBankTransfer,
} from "../../services/payment.service";
import { extractApiError } from "../../utils/errorHandling";
import { isValidReference } from "../../utils/validation";
import type { BankAccount } from "../../types/payment";

type NavProp = StackNavigationProp<MerchantStackParamList, "BankTransfer">;
type RoutePropType = RouteProp<MerchantStackParamList, "BankTransfer">;

export default function BankTransferScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RoutePropType>();
  const { paymentParams } = params;

  const accounts = getBankAccounts();
  const [selectedAccount, setSelectedAccount] = useState<BankAccount>(
    accounts[0],
  );
  const [reference, setReference] = useState("");
  const [refError, setRefError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setRefError("");
    const ref = reference.trim();
    if (!ref) {
      setRefError("Transaction reference is required.");
      return;
    }
    if (!isValidReference(ref)) {
      setRefError("Reference must be at least 6 letters or numbers.");
      return;
    }

    setLoading(true);
    try {
      await submitBankTransfer({
        order_id: paymentParams.order_id,
        amount: paymentParams.amount,
        transaction_reference: ref,
        bank_name: selectedAccount.bank_name,
      });

      navigation.replace("PaymentResult", {
        status: "AWAITING_VERIFICATION",
        provider: "BANK_TRANSFER",
        amount: paymentParams.amount,
        order_id: paymentParams.order_id,
        reference: ref,
        message: "Your transfer reference has been submitted for verification.",
      });
    } catch (err) {
      Alert.alert("Error", extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Transfer Amount</Text>
          <Text style={styles.amountValue}>
            ETB{" "}
            {paymentParams.amount.toLocaleString("en-ET", {
              minimumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.amountSub}>{paymentParams.product_name}</Text>
        </View>

        {/* Bank account selector */}
        <Text style={styles.sectionTitle}>Select Bank Account</Text>
        {accounts.map((acc) => (
          <TouchableOpacity
            key={acc.account_number}
            style={[
              styles.accountCard,
              selectedAccount.account_number === acc.account_number &&
                styles.accountCardSelected,
            ]}
            onPress={() => setSelectedAccount(acc)}
            activeOpacity={0.8}
          >
            <View style={styles.accountLeft}>
              <Text style={styles.bankName}>{acc.bank_name}</Text>
              <Text style={styles.accountName}>{acc.account_name}</Text>
              <Text style={styles.accountNumber}>{acc.account_number}</Text>
              <Text style={styles.branch}>{acc.branch}</Text>
            </View>
            <View
              style={[
                styles.radio,
                selectedAccount.account_number === acc.account_number &&
                  styles.radioSelected,
              ]}
            >
              {selectedAccount.account_number === acc.account_number && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📋 How to pay</Text>
          <Text style={styles.instructionStep}>
            1. Transfer the exact amount to the account above
          </Text>
          <Text style={styles.instructionStep}>
            2. Note your transaction reference number
          </Text>
          <Text style={styles.instructionStep}>
            3. Enter the reference below and submit
          </Text>
          <Text style={styles.instructionStep}>
            4. Our team will verify within 24 hours
          </Text>
        </View>

        {/* Reference input */}
        <Text style={styles.sectionTitle}>Transaction Reference</Text>
        <View
          style={[styles.inputWrap, refError ? styles.inputWrapError : null]}
        >
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="e.g. FT2604110001234"
            placeholderTextColor="#9E9E9E"
            autoCapitalize="characters"
            editable={!loading}
          />
        </View>
        {refError ? <Text style={styles.fieldError}>{refError}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Reference</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelLinkText}>← Back to payment methods</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F9F7" },
  scroll: { padding: 20, paddingBottom: 40 },

  amountCard: {
    backgroundColor: "#1565C0",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#1565C0",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginVertical: 4,
    letterSpacing: -1,
  },
  amountSub: { fontSize: 13, color: "rgba(255,255,255,0.7)" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B0F",
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
  },
  accountCardSelected: { borderColor: "#1565C0", backgroundColor: "#EEF4FF" },
  accountLeft: { flex: 1 },
  bankName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B0F",
    marginBottom: 3,
  },
  accountName: { fontSize: 13, color: "#555", marginBottom: 2 },
  accountNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1565C0",
    letterSpacing: 1,
    marginBottom: 2,
  },
  branch: { fontSize: 11, color: "#9E9E9E" },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: "#1565C0", backgroundColor: "#1565C0" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },

  instructionCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#1565C0",
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    lineHeight: 18,
  },

  inputWrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 4,
    marginBottom: 6,
  },
  inputWrapError: { borderColor: "#B71C1C", backgroundColor: "#FFF8F8" },
  input: {
    fontSize: 16,
    color: "#0D1B0F",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  fieldError: {
    fontSize: 12,
    color: "#B71C1C",
    marginBottom: 14,
    fontWeight: "500",
  },

  submitBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#1565C0",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  submitBtnDisabled: {
    backgroundColor: "#90CAF9",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  cancelLink: { alignItems: "center", marginTop: 18 },
  cancelLinkText: { fontSize: 14, color: "#9E9E9E", fontWeight: "500" },
});
