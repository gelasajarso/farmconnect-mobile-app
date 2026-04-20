import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getOrderById, cancelOrder } from "../services/order.service";
import { getProduct } from "../services/product.service";
import { getPaymentByOrderId } from "../services/payment.service";
import { extractApiError } from "../utils/errorHandling";
import { ORDER_STATUS_LABELS } from "../utils/enumLabels";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorView from "../components/ErrorView";
import type { OrderDTO, OrderStatus } from "../types";
import type { ProductPublicDTO } from "../types";
import type { MerchantStackParamList } from "../navigation/types";
import type { PaymentStatus } from "../types/payment";

type NavProp = StackNavigationProp<MerchantStackParamList, "OrderDetail">;
type RoutePropType = RouteProp<MerchantStackParamList, "OrderDetail">;

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  CREATED: "#1565C0",
  PENDING_PAYMENT: "#E65100",
  FUNDED: "#6A1B9A",
  CONFIRMED: "#1A7A35",
  IN_DELIVERY: "#00838F",
  DELIVERED: "#1A7A35",
  COMPLETED: "#1A7A35",
  CANCELLED: "#B71C1C",
  EXPIRED: "#757575",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "#E65100",
  PROCESSING: "#1565C0",
  SUCCESS: "#1A7A35",
  FAILED: "#B71C1C",
  AWAITING_VERIFICATION: "#6A1B9A",
};
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Payment Pending",
  PROCESSING: "Processing",
  SUCCESS: "Paid ✓",
  FAILED: "Payment Failed",
  AWAITING_VERIFICATION: "Awaiting Verification",
};

const CANCELLABLE: OrderStatus[] = ["CREATED", "PENDING_PAYMENT"];

export default function OrderDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { orderId } = route.params;
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = async () => {
    if (!user?.system_user_id) return;
    try {
      setError(null);
      const orderData = await getOrderById(orderId);
      const productData = await getProduct(orderData.product_id);
      setOrder(orderData);
      setProduct(productData);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId, user?.system_user_id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  const handleCancel = async () => {
    if (!order || !user?.system_user_id) return;
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            if (!user.system_user_id) {
              Alert.alert("Error", "Unable to identify merchant account.");
              return;
            }
            setCancelling(true);
            try {
              await cancelOrder(order.id, user.system_user_id!);
              await loadOrder(); // Refresh
            } catch (err) {
              Alert.alert("Error", extractApiError(err).message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorView message={error} onRetry={loadOrder} />;
  if (!order || !product)
    return <ErrorView message="Order not found" onRetry={loadOrder} />;

  const payment = getPaymentByOrderId(order.id);
  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1A7A35"
          />
        }
      >
        {/* Order Header */}
        <View style={styles.header}>
          <Text style={styles.orderId}>
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Status Badges */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.badge,
              { backgroundColor: STATUS_COLORS[order.status] + "18" },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: STATUS_COLORS[order.status] }]}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Text>
          </View>
          {payment && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: PAYMENT_STATUS_COLORS[payment.status] + "18",
                  marginTop: 8,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: PAYMENT_STATUS_COLORS[payment.status] },
                ]}
              >
                {PAYMENT_STATUS_LABELS[payment.status]}
              </Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <View style={styles.productDetails}>
              <Text style={styles.detailText}>
                Quantity: {order.quantity} {product.unit}
              </Text>
              <Text style={styles.detailText}>
                Unit Price: {product.currency} {order.unit_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Farmer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmer Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Farmer ID: {order.farmer_id}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {product.currency}{" "}
                {(order.unit_price * order.quantity).toFixed(2)}
              </Text>
            </View>
            {/* Add any fees or taxes here if applicable */}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>
                Total
              </Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                {product.currency} {order.total_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {canCancel && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.cancelBtn, cancelling && styles.btnDisabled]}
              onPress={handleCancel}
              disabled={cancelling}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F9F7" },
  scroll: { flex: 1, padding: 16 },

  header: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B0F",
    marginBottom: 4,
  },
  orderDate: { fontSize: 14, color: "#6B8F71" },

  statusSection: { marginBottom: 16 },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 14, fontWeight: "600" },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B0F",
    marginBottom: 8,
    marginLeft: 4,
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B0F",
    marginBottom: 4,
  },
  productCategory: { fontSize: 14, color: "#6B8F71", marginBottom: 8 },
  productDetails: { gap: 4 },
  detailText: { fontSize: 14, color: "#4A4A4A" },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoText: { fontSize: 14, color: "#4A4A4A", marginBottom: 4 },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 14, color: "#6B8F71" },
  summaryValue: { fontSize: 14, color: "#0D1B0F", fontWeight: "600" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#0D1B0F" },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#1A7A35" },

  actionsSection: { marginTop: 24, marginBottom: 32 },
  cancelBtn: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  cancelBtnText: { fontSize: 16, fontWeight: "700", color: "#B71C1C" },
  btnDisabled: { opacity: 0.6 },
});
