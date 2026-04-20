import React, { useState, useEffect } from "react";
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
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getProduct, updateProduct } from "../services/product.service";
import { extractApiError } from "../utils/errorHandling";
import { isValidCurrencyCode, isValidIsoDate } from "../utils/validation";
import type { FarmerStackParamList } from "../navigation/types";
import type { Category, Unit, QualityGrade, ProductPublicDTO } from "../types";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

type NavProp = StackNavigationProp<FarmerStackParamList, "EditProduct">;
type RoutePropType = RouteProp<FarmerStackParamList, "EditProduct">;

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

export default function EditProductScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { productId } = route.params;
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    setLoading(true);
    try {
      const data = await getProduct(productId);
      setProduct(data);
      // Populate form
      setName(data.name);
      setDescription(data.description || "");
      setCategory(data.category);
      setUnit(data.unit);
      setBasePrice(data.base_price.toString());
      setCurrency(data.currency);
      setTotalQty(data.total_quantity.toString());
      setGrade(data.quality_grade || null);
      setHarvestDate(data.harvest_date || "");
      setExpiryDate(data.expiry_date || "");
      setIsActive(data.is_active);
      setImages(data.images || []);
      setLocation(data.location || null);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    const n = name.trim();
    if (!n) e.name = "Product name is required.";
    const p = parseFloat(basePrice);
    if (!basePrice.trim() || isNaN(p) || p <= 0)
      e.basePrice = "Valid price is required.";
    const q = parseInt(totalQty);
    if (!totalQty.trim() || isNaN(q) || q <= 0)
      e.totalQty = "Valid quantity is required.";
    if (harvestDate && !isValidIsoDate(harvestDate))
      e.harvestDate = "Invalid date format.";
    if (expiryDate && !isValidIsoDate(expiryDate))
      e.expiryDate = "Invalid date format.";
    if (!isValidCurrencyCode(currency)) e.currency = "Invalid currency.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera roll permissions are required to select images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  }

  async function pickLocation() {
    Alert.alert(
      "Location Picker",
      "In a real app, this would open a map to select location. For demo, setting to a sample location.",
      [
        {
          text: "Use Sample Location",
          onPress: () => setLocation({ latitude: -1.2864, longitude: 36.8172 }),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!validate() || !user?.system_user_id || !product) return;
    setSaving(true);
    try {
      await updateProduct(product.id, user.system_user_id, {
        name: name.trim(),
        description: description.trim() || undefined,
        base_price: parseFloat(basePrice),
        total_quantity: parseInt(totalQty),
        quality_grade: grade || undefined,
        harvest_date: harvestDate || undefined,
        expiry_date: expiryDate || undefined,
        is_active: isActive,
      });
      navigation.goBack();
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <ActivityIndicator size="large" color={G.primary} style={{ flex: 1 }} />
    );
  if (error)
    return (
      <Text style={{ color: G.error, textAlign: "center", margin: 20 }}>
        {error}
      </Text>
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Edit Product</Text>

        {/* Name */}
        <Text style={styles.label}>Product Name *</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputErr : undefined]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Organic Tomatoes"
          editable={!saving}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          multiline
          numberOfLines={3}
          editable={!saving}
        />

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.optionsRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.option, category === c && styles.optionSelected]}
              onPress={() => setCategory(c)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  category === c && styles.optionTextSelected,
                ]}
              >
                {CAT_LABELS[c]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Unit */}
        <Text style={styles.label}>Unit *</Text>
        <View style={styles.optionsRow}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.option, unit === u && styles.optionSelected]}
              onPress={() => setUnit(u)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  unit === u && styles.optionTextSelected,
                ]}
              >
                {UNIT_LABELS[u]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={styles.label}>Base Price *</Text>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              styles.priceInput,
              errors.basePrice ? styles.inputErr : undefined,
            ]}
            value={basePrice}
            onChangeText={setBasePrice}
            placeholder="0.00"
            keyboardType="numeric"
            editable={!saving}
          />
          <TextInput
            style={[styles.input, styles.currencyInput]}
            value={currency}
            onChangeText={setCurrency}
            placeholder="USD"
            maxLength={3}
            autoCapitalize="characters"
            editable={!saving}
          />
        </View>
        {errors.basePrice && (
          <Text style={styles.errorText}>{errors.basePrice}</Text>
        )}

        {/* Quantity */}
        <Text style={styles.label}>Total Quantity *</Text>
        <TextInput
          style={[styles.input, errors.totalQty ? styles.inputErr : undefined]}
          value={totalQty}
          onChangeText={setTotalQty}
          placeholder="100"
          keyboardType="numeric"
          editable={!saving}
        />
        {errors.totalQty && (
          <Text style={styles.errorText}>{errors.totalQty}</Text>
        )}

        {/* Quality Grade */}
        <Text style={styles.label}>Quality Grade</Text>
        <View style={styles.optionsRow}>
          {GRADES.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.option, grade === g && styles.optionSelected]}
              onPress={() => setGrade(g)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  grade === g && styles.optionTextSelected,
                ]}
              >
                {GRADE_LABELS[g]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dates */}
        <Text style={styles.label}>Harvest Date</Text>
        <TextInput
          style={[
            styles.input,
            errors.harvestDate ? styles.inputErr : undefined,
          ]}
          value={harvestDate}
          onChangeText={setHarvestDate}
          placeholder="YYYY-MM-DD"
          editable={!saving}
        />
        {errors.harvestDate && (
          <Text style={styles.errorText}>{errors.harvestDate}</Text>
        )}

        <Text style={styles.label}>Expiry Date</Text>
        <TextInput
          style={[
            styles.input,
            errors.expiryDate ? styles.inputErr : undefined,
          ]}
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="YYYY-MM-DD"
          editable={!saving}
        />
        {errors.expiryDate && (
          <Text style={styles.errorText}>{errors.expiryDate}</Text>
        )}

        {/* Active */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            disabled={saving}
          />
        </View>

        {/* Images */}
        <Text style={styles.label}>Product Images</Text>
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.addImageBtn}
            onPress={pickImage}
            disabled={saving}
          >
            <MaterialIcons
              name="add-photo-alternate"
              size={24}
              color={G.primary}
            />
            <Text style={styles.addImageText}>Add Image</Text>
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageList}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                  disabled={saving}
                >
                  <MaterialIcons name="close" size={16} color={G.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Location */}
        <Text style={styles.label}>Product Location</Text>
        <TouchableOpacity
          style={[styles.locationBtn, location && styles.locationBtnSet]}
          onPress={pickLocation}
          disabled={saving}
        >
          <MaterialIcons
            name={location ? "location-on" : "location-off"}
            size={20}
            color={location ? G.primary : G.sub}
          />
          <Text
            style={[styles.locationText, location && styles.locationTextSet]}
          >
            {location
              ? `Location set (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
              : "Set product location (optional)"}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[styles.btn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.btnText}>
            {saving ? "Saving…" : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: G.white },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: G.text, marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: G.text,
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputErr: { borderColor: G.error },
  errorText: { color: G.error, fontSize: 14, marginTop: 5 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  option: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 8,
  },
  optionSelected: { backgroundColor: G.primary, borderColor: G.primary },
  optionText: { fontSize: 14 },
  optionTextSelected: { color: G.white },
  row: { flexDirection: "row" },
  priceInput: { flex: 1, marginRight: 10 },
  currencyInput: { width: 80 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  btn: {
    backgroundColor: G.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  btnDisabled: { backgroundColor: G.sub },
  btnText: { color: G.white, fontSize: 16, fontWeight: "bold" },

  imageSection: { marginTop: 8 },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 8,
    borderStyle: "dashed",
    backgroundColor: G.surface,
    marginBottom: 12,
  },
  addImageText: { fontSize: 14, color: G.primary, fontWeight: "600" },
  imageList: { flexDirection: "row" },
  imageContainer: { position: "relative", marginRight: 12 },
  imagePreview: { width: 80, height: 80, borderRadius: 8 },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: G.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 8,
    backgroundColor: G.surface,
    marginTop: 5,
  },
  locationBtnSet: { borderColor: G.primary, backgroundColor: "#E8F5E8" },
  locationText: { fontSize: 14, color: G.sub, flex: 1 },
  locationTextSet: { color: G.primary, fontWeight: "600" },
});
