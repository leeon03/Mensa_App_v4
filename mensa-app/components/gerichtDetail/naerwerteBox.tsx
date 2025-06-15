import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

type NaehrwertBoxProps = {
  label: string;
  value: string;
  backgroundColor?: string;
};

export default function NaehrwertBox({ label, value, backgroundColor }: NaehrwertBoxProps) {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const bgColor = backgroundColor || themeColor.card;

  return (
    <View style={[styles.box, { backgroundColor: bgColor, shadowColor: themeColor.text }]}>
      <Text style={[styles.label, { color: themeColor.icon }]}>{label}</Text>
      <Text style={[styles.value, { color: themeColor.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '47%',
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
});
