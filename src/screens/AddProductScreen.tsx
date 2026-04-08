import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { createProduct } from '../services/product.service';
import { extractApiError } from '../utils/errorHandling';
import type { FarmerStackParamList } from '../navigation/types';
import type { Category, Unit, QualityGrade } from '../types';

type AddNavProp = StackNavigationProp<FarmerStackParamList, 'AddProduct'>;

const CATEGORIES: Category[] = ['GRAINS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'MEAT', 'SPICES', 'OTHER'];
const UNITS: Unit[] = ['KG', 'TON', 'LITER', 'UNIT', 'CRATE', 'BAG'];
const GRADES: QualityGrade[] = ['GRADE_A', 'GRADE_B', 'GRADE_C', 'PREMIUM', 'STANDARD'];

const CATEGORY_LABELS: Record<Category, string> = {
  GRAINS: 'Grains', VEGETABLES: 'Vegetables', FRUITS: 'Fruits',
  DAIRY: 'Dairy', MEAT: 'Meat', SPICES: 'Spices', OTHER: 'Other',
};
const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg', TON: 'Ton', LITER: 'Liter', UNIT: 'Unit', CRATE: 'Crate', BAG: 'Bag',
};
const GRADE_LABELS: Record<QualityGrade, string> = {
  GRADE_A: 'Grade A', GRADE_B: 'Grade B', GRADE_C: 'Grade C', PREMIUM: 'Premium', STANDARD: 'Standard',
};

export default function AddProductScreen() {
  const navigation = useNavigation<AddNavProp>();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [basePrice, setBasePrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [totalQuantity, setTotalQuantity] = useState('');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade | null>(null);
  const [harvestDate, setHarvestDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (name.trim().length > 100) e.name = 'Name must be at most 100 characters.';
    if (!category) e.category = 'Category is required.';
    if (!unit) e.unit = 'Unit is required.';
    const price = parseFloat(basePrice);
    if (!basePrice.trim() || isNaN(price) || price <= 0) e.basePrice = 'Price must be greater than 0.';
    const qty = parseFloat(totalQuantity);
    if (!totalQuantity.trim() || isNaN(qty) || qty < 0) e.totalQuantity = 'Quantity must be 0 or greater.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError('');
    if (!validate()) return;

    if (!user?.system_user_id) {
      setApiError('Unable to identify your farmer account. Please view your products first.');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        farmer_id: user.system_user_id,
        name: name.trim(),
        description: description.trim() || undefined,
        category: category!,
        unit: unit!,
        base_price: parseFloat(basePrice),
        currency: currency.trim().toUpperCase() || 'USD',
        total_quantity: parseFloat(totalQuantity),
        quality_grade: qualityGrade ?? undefined,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>New Product Listing</Text>

      {/* Name */}
      <Text style={styles.label}>Product Name *</Text>
      <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} placeholder="e.g. Organic Tomatoes" editable={!loading} />
      {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Optional description..." multiline numberOfLines={3} editable={!loading} />

      {/* Category */}
      <Text style={styles.label}>Category *</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipSelected]} onPress={() => setCategory(c)} disabled={loading}>
            <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{CATEGORY_LABELS[c]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}

      {/* Unit */}
      <Text style={styles.label}>Unit *</Text>
      <View style={styles.chipRow}>
        {UNITS.map((u) => (
          <TouchableOpacity key={u} style={[styles.chip, unit === u && styles.chipSelected]} onPress={() => setUnit(u)} disabled={loading}>
            <Text style={[styles.chipText, unit === u && styles.chipTextSelected]}>{UNIT_LABELS[u]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.unit ? <Text style={styles.fieldError}>{errors.unit}</Text> : null}

      {/* Price */}
      <Text style={styles.label}>Base Price *</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.flex, errors.basePrice && styles.inputError]} value={basePrice} onChangeText={setBasePrice} placeholder="0.00" keyboardType="numeric" editable={!loading} />
        <TextInput style={[styles.input, styles.currencyInput]} value={currency} onChangeText={setCurrency} placeholder="USD" autoCapitalize="characters" maxLength={3} editable={!loading} />
      </View>
      {errors.basePrice ? <Text style={styles.fieldError}>{errors.basePrice}</Text> : null}

      {/* Quantity */}
      <Text style={styles.label}>Total Quantity *</Text>
      <TextInput style={[styles.input, errors.totalQuantity && styles.inputError]} value={totalQuantity} onChangeText={setTotalQuantity} placeholder="0" keyboardType="numeric" editable={!loading} />
      {errors.totalQuantity ? <Text style={styles.fieldError}>{errors.totalQuantity}</Text> : null}

      {/* Quality Grade */}
      <Text style={styles.label}>Quality Grade</Text>
      <View style={styles.chipRow}>
        {GRADES.map((g) => (
          <TouchableOpacity key={g} style={[styles.chip, qualityGrade === g && styles.chipSelected]} onPress={() => setQualityGrade(qualityGrade === g ? null : g)} disabled={loading}>
            <Text style={[styles.chipText, qualityGrade === g && styles.chipTextSelected]}>{GRADE_LABELS[g]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Harvest Date */}
      <Text style={styles.label}>Harvest Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={harvestDate} onChangeText={setHarvestDate} placeholder="2026-01-15" editable={!loading} />

      {/* Expiry Date */}
      <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="2026-06-30" editable={!loading} />

      {/* Active toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Active Listing</Text>
        <Switch value={isActive} onValueChange={setIsActive} disabled={loading} trackColor={{ true: '#2E7D32' }} />
      </View>

      {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

      <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Product</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: '#1B5E20', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#33691E', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 2,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#B71C1C' },
  fieldError: { fontSize: 12, color: '#B71C1C', marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  chipText: { fontSize: 13, color: '#2E7D32' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  currencyInput: { width: 70 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  apiError: {
    fontSize: 14,
    color: '#B71C1C',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: { backgroundColor: '#A5D6A7' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
