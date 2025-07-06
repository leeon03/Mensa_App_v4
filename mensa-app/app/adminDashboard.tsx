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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // <--- hinzufügen

export default function AdminDashboard() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const links = [
    {
      icon: 'grid-outline',
      label: 'Gerichte verwalten',
      route: '/adminGerichte', // 👉 aktualisierte Seite mit Cards
    },
    {
      icon: 'add-circle-outline',
      label: 'Neues Gericht',
      route: '/adminNeuesGericht',
    },
    {
    icon: 'clipboard-outline',
    label: 'Umfragen verwalten',
    route: '/adminUmfrage',
  },
  ] as const;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColor.background }}>
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <Text style={[styles.title, { color: '#d9534f' }]}>Admin</Text>
          <Text style={[styles.title, { color: '#d9534f', marginBottom: 0 }]}>Dashboard</Text>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: themeColor.background },
          ]}
        >
          {links.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                { backgroundColor: '#d9534f' } // gleiche Farbe wie Überschrift
              ]}
              onPress={() => router.push(item.route)}
            >
              <Ionicons name={item.icon} size={20} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  // Überschrift wie in speiseplan.tsx
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    textTransform: 'none',
    color: '#d9534f',
    letterSpacing: 0.5,
    lineHeight: 26,
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
