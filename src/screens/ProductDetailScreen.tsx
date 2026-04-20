import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useProductDetail } from "../hooks/useProducts";
import { createOrder } from "../services/order.service";
import { extractApiError } from "../utils/errorHandling";
import {
  CATEGORY_LABELS,
  UNIT_LABELS,
  QUALITY_GRADE_LABELS,
  PRODUCT_STATUS_LABELS,
} from "../utils/enumLabels";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorView from "../components/ErrorView";
import type {
  HomeStackParamList,
  MerchantStackParamList,
} from "../navigation/types";

type DetailNavProp = StackNavigationProp<HomeStackParamList, "ProductDetail">;
type DetailRouteProp = RouteProp<HomeStackParamList, "ProductDetail">;

export default function ProductDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { productId } = route.params;
  const { user, resolveSystemUserId } = useAuth();
  const { product, loading, error, errorStatus, refetch } =
    useProductDetail(productId);

  const [quantity, setQuantity] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [quantityError, setQuantityError] = useState("");

  if (loading) return <LoadingIndicator />;
  if (error) {
    if (errorStatus === 404 || error.toLowerCase().includes("not found")) {
      return (
        <View style={styles.center}>
          <Text style={styles.notFound}>Product not found</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return <ErrorView message={error} onRetry={refetch} />;
  }
  if (!product) return null;

  async function handlePlaceOrder() {
    setQuantityError("");
    setOrderError("");

    const qty = parseFloat(quantity);
    if (!quantity.trim() || isNaN(qty) || qty <= 0) {
      setQuantityError("Please enter a valid quantity greater than 0.");
      return;
    }

    if (!user?.system_user_id) {
      setOrderError(
        "Unable to identify your merchant account. Please view your orders first.",
      );
      return;
    }

    setOrderLoading(true);
    try {
      const result = await createOrder({
        farmer_id: product!.farmer_id,
        merchant_id: user.system_user_id,
        product_id: product!.id,
        quantity: qty,
        unit_price: product!.base_price,
      });
      await resolveSystemUserId(result.order.merchant_id);

      // Navigate to payment flow instead of showing alert
      const parentNav =
        navigation.getParent<StackNavigationProp<MerchantStackParamList>>();
      if (parentNav) {
        parentNav.navigate("SelectPayment", {
          paymentParams: {
            order_id: result.order.id,
            amount: result.order.total_price,
            currency: "ETB",
            product_name: product!.name,
            merchant_name: user.name,
            merchant_email: user.email,
          },
        });
      } else {
        Alert.alert(
          "Order Placed",
          `Order #${result.order.id.slice(-8).toUpperCase()} created. Proceed to payment from My Orders.`,
        );
      }
      setQuantity("");
    } catch (err) {
      const apiErr = extractApiError(err);
      if (apiErr.status === 409) {
        setOrderError("Insufficient stock for this order.");
      } else {
        setOrderError(apiErr.message);
      }
    } finally {
      setOrderLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backRow}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{CATEGORY_LABELS[product.category]}</Text>

      {product.description && (
        <Text style={styles.description}>{product.description}</Text>
      )}

      <View style={styles.row}>
        <Text style={styles.fieldLabel}>Price:</Text>
        <Text style={styles.fieldValue}>
          {product.currency} {product.base_price.toFixed(2)} /{" "}
          {UNIT_LABELS[product.unit]}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>Total Qty:</Text>
        <Text style={styles.fieldValue}>
          {product.total_quantity} {UNIT_LABELS[product.unit]}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>Reserved:</Text>
        <Text style={styles.fieldValue}>
          {product.reserved_quantity} {UNIT_LABELS[product.unit]}
        </Text>
      </View>
      {product.quality_grade && (
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Grade:</Text>
          <Text style={styles.fieldValue}>
            {QUALITY_GRADE_LABELS[product.quality_grade]}
          </Text>
        </View>
      )}
      {product.harvest_date && (
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Harvested:</Text>
          <Text style={styles.fieldValue}>{product.harvest_date}</Text>
        </View>
      )}
      {product.expiry_date && (
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Expires:</Text>
          <Text style={styles.fieldValue}>{product.expiry_date}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.fieldLabel}>Status:</Text>
        <Text style={[styles.fieldValue, styles.status]}>
          {product.status
            ? PRODUCT_STATUS_LABELS[product.status]
            : product.is_active
              ? "Active"
              : "Inactive"}
        </Text>
      </View>

      {/* Place Order — MERCHANT only */}
      {user?.role === "MERCHANT" && (
        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>Place Order</Text>
          <TextInput
            style={[styles.input, quantityError ? styles.inputError : null]}
            value={quantity}
            onChangeText={setQuantity}
            placeholder={`Quantity (${UNIT_LABELS[product.unit]})`}
            keyboardType="numeric"
            editable={!orderLoading}
          />
          {quantityError ? (
            <Text style={styles.fieldError}>{quantityError}</Text>
          ) : null}
          {orderError ? (
            <Text style={styles.fieldError}>{orderError}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.orderBtn, orderLoading && styles.orderBtnDisabled]}
            onPress={handlePlaceOrder}
            disabled={orderLoading}
          >
            {orderLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.orderBtnText}>Confirm Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F8E9" },
  content: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFound: { fontSize: 18, color: "#B71C1C", marginBottom: 16 },
  backRow: { marginBottom: 12 },
  backBtn: { marginTop: 12 },
  backText: { color: "#2E7D32", fontWeight: "600", fontSize: 15 },
  name: { fontSize: 24, fontWeight: "800", color: "#1B5E20", marginBottom: 4 },
  category: { fontSize: 14, color: "#558B2F", marginBottom: 12 },
  description: {
    fontSize: 15,
    color: "#424242",
    marginBottom: 12,
    lineHeight: 22,
  },
  row: { flexDirection: "row", marginBottom: 8 },
  fieldLabel: { fontSize: 14, color: "#757575", width: 100 },
  fieldValue: { fontSize: 14, color: "#212121", fontWeight: "500", flex: 1 },
  status: { color: "#2E7D32", fontWeight: "700" },
  orderSection: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 4,
    backgroundColor: "#F9FBE7",
  },
  inputError: { borderColor: "#B71C1C" },
  fieldError: { fontSize: 12, color: "#B71C1C", marginBottom: 8 },
  orderBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  orderBtnDisabled: { backgroundColor: "#A5D6A7" },
  orderBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
