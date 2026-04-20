import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { MerchantStackParamList } from "../../navigation/types";

type NavProp = StackNavigationProp<MerchantStackParamList, "PaymentResult">;
type RoutePropType = RouteProp<MerchantStackParamList, "PaymentResult">;

const PROVIDER_LABELS: Record<string, string> = {
  CHAPA: "Chapa",
  TELEBIRR: "Telebirr",
  BANK_TRANSFER: "Bank Transfer",
};

export default function PaymentResultScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RoutePropType>();
  const { status, provider, amount, order_id, reference, message } = params;

  const isSuccess = status === "SUCCESS";
  const isPending = status === "AWAITING_VERIFICATION";

  const emoji = isSuccess ? "✅" : isPending ? "⏳" : "❌";
  const title = isSuccess
    ? "Payment Successful"
    : isPending
      ? "Awaiting Verification"
      : "Payment Failed";
  const color = isSuccess ? "#1A7A35" : isPending ? "#E65100" : "#B71C1C";
  const bgColor = isSuccess ? "#F0FBF3" : isPending ? "#FFF3E0" : "#FFEBEE";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        {/* Result icon */}
        <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={[styles.title, { color }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {/* Details card */}
        <View style={styles.detailCard}>
          <DetailRow
            label="Provider"
            value={PROVIDER_LABELS[provider] ?? provider}
          />
          <DetailRow
            label="Amount"
            value={`ETB ${amount.toLocaleString("en-ET", { minimumFractionDigits: 2 })}`}
            bold
          />
          <DetailRow
            label="Order ID"
            value={`#${order_id.slice(-8).toUpperCase()}`}
          />
          {reference && <DetailRow label="Reference" value={reference} />}
          <DetailRow label="Status" value={title} valueColor={color} />
        </View>

        {isPending && (
          <View style={styles.pendingNote}>
            <Text style={styles.pendingNoteText}>
              📋 Your transfer reference has been submitted. Our team will
              verify your payment within 24 hours and update your order status.
            </Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: color }]}
          onPress={() => navigation.navigate("MerchantOrdersList")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>View My Orders</Text>
        </TouchableOpacity>

        {!isSuccess && !isPending && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("MerchantDashboard")}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  bold = false,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          bold && styles.detailValueBold,
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },

  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emoji: { fontSize: 44 },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0D1B0F",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  detailCard: {
    width: "100%",
    backgroundColor: "#F7F9F7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: { fontSize: 13, color: "#9E9E9E", fontWeight: "500" },
  detailValue: {
    fontSize: 13,
    color: "#0D1B0F",
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  detailValueBold: { fontSize: 15, fontWeight: "800" },

  pendingNote: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#E65100",
  },
  pendingNoteText: { fontSize: 13, color: "#E65100", lineHeight: 19 },

  primaryBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  secondaryBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#F7F9F7",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  secondaryBtnText: { color: "#666", fontSize: 15, fontWeight: "600" },
});
