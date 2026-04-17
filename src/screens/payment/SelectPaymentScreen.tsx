import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp, RouteProp } from '@react-navigation/stack';
import type { MerchantStackParamList } from '../../navigation/types';
import type { PaymentProvider } from '../../types/payment';

type NavProp  = StackNavigationProp<MerchantStackParamList, 'SelectPayment'>;
type RoutePropType = RouteProp<MerchantStackParamList, 'SelectPayment'>;

const PROVIDERS: {
  id: PaymentProvider;
  name: string;
  description: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  {
    id: 'CHAPA',
    name: 'Chapa',
    description: 'Pay with card, mobile banking, or wallet via Chapa checkout',
    emoji: '💳',
    color: '#1A7A35',
    bg: '#F0FBF3',
  },
  {
    id: 'TELEBIRR',
    name: 'Telebirr',
    description: 'Pay using your Telebirr mobile wallet — USSD approval',
    emoji: '📱',
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    id: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    description: 'Transfer to our CBE or Awash Bank account and submit your reference',
    emoji: '🏦',
    color: '#1565C0',
    bg: '#E3F2FD',
  },
];

export default function SelectPaymentScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RoutePropType>();
  const [selected, setSelected] = useState<PaymentProvider | null>(null);

  function handleContinue() {
    if (!selected) return;

    if (selected === 'BANK_TRANSFER') {
      navigation.navigate('BankTransfer', { paymentParams: params.paymentParams });
    } else {
      navigation.navigate('PaymentProcessing', {
        provider: selected,
        paymentParams: params.paymentParams,
      });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Order summary */}
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>Order Total</Text>
          <Text style={styles.orderAmount}>
            ETB {params.paymentParams.amount.toLocaleString('en-ET', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.orderProduct} numberOfLines={1}>
            {params.paymentParams.product_name}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        {PROVIDERS.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.providerCard,
              selected === p.id && styles.providerCardSelected,
              selected === p.id && { borderColor: p.color },
            ]}
            onPress={() => setSelected(p.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.providerIcon, { backgroundColor: p.bg }]}>
              <Text style={styles.providerEmoji}>{p.emoji}</Text>
            </View>
            <View style={styles.providerBody}>
              <Text style={[styles.providerName, selected === p.id && { color: p.color }]}>
                {p.name}
              </Text>
              <Text style={styles.providerDesc}>{p.description}</Text>
            </View>
            <View style={[
              styles.radio,
              selected === p.id && { borderColor: p.color, backgroundColor: p.color },
            ]}>
              {selected === p.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue to Payment →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F7F9F7' },
  scroll: { padding: 20, paddingBottom: 40 },

  orderCard: {
    backgroundColor: '#1A7A35', borderRadius: 16,
    padding: 20, alignItems: 'center', marginBottom: 28,
    shadowColor: '#1A7A35', shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  orderLabel:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderAmount:  { fontSize: 32, fontWeight: '800', color: '#fff', marginVertical: 4, letterSpacing: -1 },
  orderProduct: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0D1B0F', marginBottom: 14, letterSpacing: -0.2 },

  providerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  providerCardSelected: { borderWidth: 2 },
  providerIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  providerEmoji: { fontSize: 24 },
  providerBody: { flex: 1 },
  providerName: { fontSize: 15, fontWeight: '700', color: '#0D1B0F', marginBottom: 3 },
  providerDesc: { fontSize: 12, color: '#9E9E9E', lineHeight: 17 },

  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#BDBDBD',
    justifyContent: 'center', alignItems: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },

  continueBtn: {
    backgroundColor: '#1A7A35', borderRadius: 14,
    paddingVertical: 17, alignItems: 'center', marginTop: 8,
    shadowColor: '#1A7A35', shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  continueBtnDisabled: { backgroundColor: '#A5D6A7', shadowOpacity: 0, elevation: 0 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  cancelLink:     { alignItems: 'center', marginTop: 18 },
  cancelLinkText: { fontSize: 14, color: '#9E9E9E', fontWeight: '500' },
});
