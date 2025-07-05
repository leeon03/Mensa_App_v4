import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

type PaypalButtonProps = {
  amount: number;
  backgroundColor: string;
};

const PaypalButton = ({ amount, backgroundColor }: PaypalButtonProps) => {
  const handlePress = () => {
    const url = `https://www.sandbox.paypal.com/paypalme/deinSandboxName/${amount.toFixed(2)}`;
    Linking.openURL(url).catch(err => console.error('Fehler beim Öffnen der PayPal-URL:', err));
  };

  return (
    <TouchableOpacity style={[styles.paypalButton, { backgroundColor }]} onPress={handlePress}>
      <Ionicons name="logo-paypal" size={18} color="#fff" style={{ marginRight: 6 }} />
      <Text style={styles.paypalButtonText}>Mit PayPal bezahlen</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  paypalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 16,
  },
  paypalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PaypalButton;
