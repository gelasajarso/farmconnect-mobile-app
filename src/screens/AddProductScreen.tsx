import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { createProduct } from "../services/product.service";
import { extractApiError } from "../utils/errorHandling";
import { isValidCurrencyCode, isValidIsoDate } from "../utils/validation";
import type { FarmerStackParamList } from "../navigation/types";
import type { Category, Unit, QualityGrade } from "../types";

type NavProp = StackNavigationProp<FarmerStackParamList, "AddProduct">;

const G = {
  primary: "#1A7A35",
  surface: "#F2FAF5",
  border: "#C8E6C9",
  text: "#0D1B0F",
  sub: "#6B8F71",
  error: "#C62828",
  white: "#fff",
};

const CATEGORIES: Category[] = [
  "GRAINS",
  "VEGETABLES",
  "FRUITS",
  "DAIRY",
  "MEAT",
  "SPICES",
  "OTHER",
];
const UNITS: Unit[] = ["KG", "TON", "LITER", "UNIT", "CRATE", "BAG"];
const GRADES: QualityGrade[] = [
  "GRADE_A",
  "GRADE_B",
  "GRADE_C",
  "PREMIUM",
  "STANDARD",
];

const CAT_LABELS: Record<Category, string> = {
  GRAINS: "Grains",
  VEGETABLES: "Vegetables",
  FRUITS: "Fruits",
  DAIRY: "Dairy",
  MEAT: "Meat",
  SPICES: "Spices",
  OTHER: "Other",
};
const UNIT_LABELS: Record<Unit, string> = {
  KG: "kg",
  TON: "Ton",
  LITER: "Liter",
  UNIT: "Unit",
  CRATE: "Crate",
  BAG: "Bag",
};
const GRADE_LABELS: Record<QualityGrade, string> = {
  GRADE_A: "Grade A",
  GRADE_B: "Grade B",
  GRADE_C: "Grade C",
  PREMIUM: "Premium",
  STANDARD: "Standard",
};

export default function AddProductScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [basePrice, setBasePrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [totalQty, setTotalQty] = useState("");
  const [grade, setGrade] = useState<QualityGrade | null>(null);
  const [harvestDate, setHarvestDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    const n = name.trim();
    if (!n) e.name = "Product name is required.";
    else if (n.length < 2) e.name = "Min 2 characters.";
    else if (n.length > 100) e.name = "Max 100 characters.";
    if (!category) e.category = "Select a category.";
    if (!unit) e.unit = "Select a unit.";
    const price = parseFloat(basePrice);
    if (!basePrice.trim() || isNaN(price) || price <= 0)
      e.basePrice = "Enter a valid price > 0.";
    const qty = parseFloat(totalQty);
    if (!totalQty.trim() || isNaN(qty) || qty < 0)
      e.totalQty = "Enter a valid quantity ≥ 0.";
    if (harvestDate && !isValidIsoDate(harvestDate))
      e.harvestDate = "Use format YYYY-MM-DD.";
    if (expiryDate && !isValidIsoDate(expiryDate))
      e.expiryDate = "Use format YYYY-MM-DD.";
    if (
      harvestDate &&
      expiryDate &&
      isValidIsoDate(harvestDate) &&
      isValidIsoDate(expiryDate)
    ) {
      const harvest = new Date(`${harvestDate}T00:00:00`);
      const expiry = new Date(`${expiryDate}T00:00:00`);
      if (expiry < harvest)
        e.expiryDate = "Expiry date must be same or after harvest date.";
    }
    const cur = currency.trim().toUpperCase();
    if (!isValidCurrencyCode(cur))
      e.currency = "Currency must be a 3-letter code.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;
    if (!user?.system_user_id) {
      setApiError(
        "Farmer account not identified. Please go back and try again.",
      );
      return;
    }
    setLoading(true);
    try {
      const cur = currency.trim().toUpperCase();
      await createProduct({
        farmer_id: user.system_user_id,
        name: name.trim(),
        description: description.trim() || undefined,
        category: category!,
        unit: unit!,
        base_price: parseFloat(basePrice),
        currency: cur,
        total_quantity: parseFloat(totalQty),
        quality_grade: grade ?? undefined,
        harvest_date: harvestDate.trim() || undefined,
        expiry_date: expiryDate.trim() || undefined,
        is_active: isActive,
      });
      navigation.goBack();
    } catch (err) {
      setApiError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>New Listing</Text>
        <Text style={styles.subheading}>
          Fill in the details to list your product.
        </Text>

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <Text style={styles.apiErrorText}>⚠ {apiError}</Text>
          </View>
        ) : null}

        {/* Name */}
        <Field label="Product Name *" error={errors.name}>
          <TextInput
            style={[styles.input, errors.name && styles.inputErr]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Organic Tomatoes"
            placeholderTextColor={G.sub}
            editable={!loading}
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description…"
            placeholderTextColor={G.sub}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </Field>

        {/* Category */}
        <Field label="Category *" error={errors.category}>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, category === c && styles.chipOn]}
                onPress={() => setCategory(c)}
                disabled={loading}
              >
                <Text
                  style={[styles.chipText, category === c && styles.chipTextOn]}
                >
                  {CAT_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {/* Unit */}
        <Field label="Unit *" error={errors.unit}>
          <View style={styles.chipRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.chip, unit === u && styles.chipOn]}
                onPress={() => setUnit(u)}
                disabled={loading}
              >
                <Text
                  style={[styles.chipText, unit === u && styles.chipTextOn]}
                >
                  {UNIT_LABELS[u]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {/* Price + Currency */}
        <Field label="Base Price *" error={errors.basePrice}>
          <View style={styles.row}>
            <TextInput
              style={[
                styles.input,
                styles.flex,
                errors.basePrice && styles.inputErr,
              ]}
              value={basePrice}
              onChangeText={setBasePrice}
              placeholder="0.00"
              placeholderTextColor={G.sub}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <TextInput
              style={[styles.input, styles.currencyInput]}
              value={currency}
              onChangeText={(t) => setCurrency(t.toUpperCase())}
              placeholder="USD"
              placeholderTextColor={G.sub}
              autoCapitalize="characters"
              maxLength={3}
              editable={!loading}
            />
          </View>
        </Field>

        {/* Quantity */}
        <Field label="Total Quantity *" error={errors.totalQty}>
          <TextInput
            style={[styles.input, errors.totalQty && styles.inputErr]}
            value={totalQty}
            onChangeText={setTotalQty}
            placeholder="0"
            placeholderTextColor={G.sub}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </Field>

        {/* Quality Grade */}
        <Field label="Quality Grade">
          <View style={styles.chipRow}>
            {GRADES.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, grade === g && styles.chipOn]}
                onPress={() => setGrade(grade === g ? null : g)}
                disabled={loading}
              >
                <Text
                  style={[styles.chipText, grade === g && styles.chipTextOn]}
                >
                  {GRADE_LABELS[g]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        {/* Harvest Date */}
        <Field
          label="Harvest Date"
          hint="YYYY-MM-DD"
          error={errors.harvestDate}
        >
          <TextInput
            style={[styles.input, errors.harvestDate && styles.inputErr]}
            value={harvestDate}
            onChangeText={setHarvestDate}
            placeholder="2026-04-01"
            placeholderTextColor={G.sub}
            editable={!loading}
          />
        </Field>

        {/* Expiry Date */}
        <Field label="Expiry Date" hint="YYYY-MM-DD" error={errors.expiryDate}>
          <TextInput
            style={[styles.input, errors.expiryDate && styles.inputErr]}
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="2026-12-31"
            placeholderTextColor={G.sub}
            editable={!loading}
          />
        </Field>

        {/* Active toggle */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Active Listing</Text>
            <Text style={styles.switchSub}>
              Visible to merchants immediately
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            disabled={loading}
            trackColor={{ true: G.primary }}
            thumbColor={G.white}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={G.white} />
          ) : (
            <Text style={styles.submitBtnText}>Create Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: G.white },
  content: { padding: 20, paddingBottom: 48 },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: G.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: G.sub,
    marginBottom: 24,
    fontWeight: "500",
  },

  apiErrorBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 13,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: G.error,
  },
  apiErrorText: { color: G.error, fontSize: 13, fontWeight: "600" },

  field: { marginBottom: 18 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: G.sub,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  hint: { fontSize: 11, color: "#BDBDBD", fontWeight: "500" },
  fieldError: { fontSize: 12, color: G.error, marginTop: 5, fontWeight: "500" },

  input: {
    backgroundColor: G.surface,
    borderWidth: 1.5,
    borderColor: G.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    fontSize: 15,
    color: G.text,
    fontWeight: "500",
  },
  inputErr: { borderColor: G.error, backgroundColor: "#FFF8F8" },
  textarea: { height: 88, textAlignVertical: "top" },

  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  currencyInput: { width: 72 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: G.border,
    backgroundColor: G.white,
  },
  chipOn: { backgroundColor: G.primary, borderColor: G.primary },
  chipText: { fontSize: 13, color: G.primary, fontWeight: "600" },
  chipTextOn: { color: G.white },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: G.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: G.border,
    marginBottom: 28,
  },
  switchLabel: { fontSize: 15, fontWeight: "700", color: G.text },
  switchSub: { fontSize: 12, color: G.sub, marginTop: 2 },

  submitBtn: {
    backgroundColor: G.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: G.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  submitBtnDisabled: {
    backgroundColor: "#A5D6A7",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: G.white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
