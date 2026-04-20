import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { useOrders } from "../hooks/useOrders";
import { ORDER_STATUS_LABELS } from "../utils/enumLabels";
import LoadingIndicator from "../components/LoadingIndicator";
import type { MerchantStackParamList } from "../navigation/types";
import type { OrderStatus } from "../types";

type NavProp = StackNavigationProp<MerchantStackParamList, "TransactionDetail">;
type RoutePropType = RouteProp<MerchantStackParamList, "TransactionDetail">;

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  COMPLETED: "#2E7D32",
  DELIVERED: "#558B2F",
  CANCELLED: "#B71C1C",
  EXPIRED: "#757575",
  IN_DELIVERY: "#00838F",
  CONFIRMED: "#1565C0",
  FUNDED: "#6A1B9A",
  PENDING_PAYMENT: "#F57F17",
  CREATED: "#424242",
};

export default function TransactionDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const { orderId } = useRoute<RoutePropType>().params;
  const { orders, loading } = useOrders();

  if (loading) return <LoadingIndicator />;

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>Transaction not found.</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[order.status] ?? "#757575";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.banner, { backgroundColor: statusColor }]}>
          <Text style={styles.bannerLabel}>Status</Text>
          <Text style={styles.bannerStatus}>
            {ORDER_STATUS_LABELS[order.status]}
          </Text>
          <Text style={styles.bannerAmount}>
            ${order.total_price.toFixed(2)}
          </Text>
        </View>

        {/* Order Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <DetailRow
            label="Order ID"
            value={`#${order.id.slice(-12).toUpperCase()}`}
          />
          <DetailRow label="Product ID" value={order.product_id} />
          <DetailRow label="Quantity" value={String(order.quantity)} />
          <DetailRow
            label="Unit Price"
            value={`$${order.unit_price.toFixed(2)}`}
          />
          <DetailRow
            label="Total Price"
            value={`$${order.total_price.toFixed(2)}`}
            bold
          />
          <DetailRow
            label="Date"
            value={new Date(order.created_at).toLocaleString()}
          />
        </View>

        {/* Parties */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parties</Text>
          <DetailRow label="Farmer ID" value={order.farmer_id} />
          <DetailRow label="Merchant ID" value={order.merchant_id} />
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back to Transactions</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, bold && styles.detailValueBold]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  banner: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  bannerLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  bannerStatus: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  bannerAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9E9E9E",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  detailLabel: { fontSize: 14, color: "#757575", fontWeight: "500" },
  detailValue: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "500",
    maxWidth: "55%",
    textAlign: "right",
  },
  detailValueBold: { fontWeight: "800", color: "#1565C0", fontSize: 16 },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  notFoundEmoji: { fontSize: 48, marginBottom: 12 },
  notFoundText: { fontSize: 16, color: "#9E9E9E", marginBottom: 20 },
  backBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#E3F2FD",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  backBtnText: { fontSize: 15, color: "#1565C0", fontWeight: "600" },
});
