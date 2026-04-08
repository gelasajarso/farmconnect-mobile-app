import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/types';

type RegisterNavProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>How to get access</Text>
        <Text style={styles.body}>
          New accounts on FarmConnect are provisioned by a FarmConnect agent or
          administrator. Self-registration is not available.
        </Text>
        <Text style={styles.contact}>
          Contact your FarmConnect agent to create an account.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backText}>← Back to Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F1F8E9' },
  title: { fontSize: 28, fontWeight: '800', color: '#1B5E20', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  heading: { fontSize: 18, fontWeight: '700', color: '#2E7D32', marginBottom: 12 },
  body: { fontSize: 15, color: '#424242', lineHeight: 22, marginBottom: 12 },
  contact: { fontSize: 15, fontWeight: '600', color: '#1B5E20', lineHeight: 22 },
  backBtn: { alignItems: 'center' },
  backText: { color: '#558B2F', fontSize: 15, fontWeight: '600' },
});
