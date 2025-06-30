import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function AdminDashboard() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const links = [
    {
      icon: 'grid-outline',
      label: 'Gerichte verwalten (neu)',
      route: '/adminGerichte', // 👉 aktualisierte Seite mit Cards
    },
    {
      icon: 'add-circle-outline',
      label: 'Neues Gericht',
      route: '/adminNeuesGericht',
    },
  ] as const;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: themeColor.background },
      ]}
    >
      <Text style={[styles.heading, { color: themeColor.text }]}>
        Admin Dashboard
      </Text>

      {links.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { backgroundColor: themeColor.accent1 }]}
          onPress={() => router.push(item.route)}
        >
          <Ionicons name={item.icon} size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
