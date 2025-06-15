import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '../constants/Colors';
import { supabase } from '../constants/supabase';
import NaehrwertBox from '../components/gerichtDetail/naerwerteBox';
import ZutatenTabelle from '../components/gerichtDetail/zutatenTabelle';

const TAGS = [
  { key: 'vegan', label: 'Vegan', icon: <MaterialCommunityIcons name="leaf" size={14} color="#000" />, color: '#A5D6A7' },
  { key: 'vegetarisch', label: 'Vegetarisch', icon: <MaterialCommunityIcons name="food-apple" size={14} color="#000" />, color: '#C5E1A5' },
  { key: 'leicht', label: 'Leicht', icon: <Ionicons name="sunny" size={14} color="#000" />, color: '#FFF59D' },
  { key: 'glutenfrei', label: 'Glutenfrei', icon: <Ionicons name="ban" size={14} color="#000" />, color: '#FFE082' },
  { key: 'scharf', label: 'Scharf', icon: <MaterialCommunityIcons name="chili-hot" size={14} color="#000" />, color: '#EF9A9A' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', icon: <MaterialCommunityIcons name="cow" size={14} color="#000" />, color: '#E57373' },
  { key: 'fischhaltig', label: 'Fischhaltig', icon: <MaterialCommunityIcons name="fish" size={14} color="#000" />, color: '#81D4FA' },
  { key: 'beliebt', label: 'Beliebt', icon: <Ionicons name="flame" size={14} color="#000" />, color: '#F48FB1' },
  { key: 'favorit', label: 'Favorit', icon: <Ionicons name="heart" size={14} color="#000" />, color: '#F06292' },
  { key: 'erinnerung', label: 'Erinnerung', icon: <Ionicons name="notifications" size={14} color="#000" />, color: '#B0BEC5' },
];

const getPastellBackground = (baseColor: string, theme: string) => {
  const lighten = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `rgb(${Math.min(Math.max(R, 0),255)},${Math.min(Math.max(G, 0),255)},${Math.min(Math.max(B, 0),255)})`;
  };
  return lighten(baseColor, theme === 'dark' ? -10 : 40);
};

export default function GerichtDetailScreen() {
  const { name, color } = useLocalSearchParams();
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const [gericht, setGericht] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof name !== 'string') return;

    const loadGericht = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('gerichte')
        .select('*')
        .eq('name', name)
        .order('datum', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error('Fehler beim Laden:', error);
        setGericht(null);
      } else {
        setGericht(data[0]);
      }

      setLoading(false);
    };

    loadGericht();
  }, [name]);

  const baseColor = typeof color === 'string' ? color : themeColor.accent2;
  const boxColor = getPastellBackground(baseColor, theme);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: themeColor.background }]}>
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </SafeAreaView>
    );
  }

  if (!gericht) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: themeColor.background }]}>
        <Text style={{ color: themeColor.text }}>Gericht nicht gefunden.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColor.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.heading, { color: baseColor }]}>Gericht im Detail</Text>

        <Image source={{ uri: gericht.bild_url }} style={styles.image} />

        <View style={styles.content}>
          <Text style={[styles.title, { color: themeColor.text }]}>{gericht.anzeigename}</Text>
          <Text style={[styles.kategorie, { color: themeColor.icon }]}>
            {gericht.kategorie?.toUpperCase() || ''}
          </Text>

          <Text style={[styles.beschreibung, { color: themeColor.text }]}>{gericht.beschreibung}</Text>

          {gericht.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {gericht.tags.map((tag: string) => {
                const tagData = TAGS.find(t => t.key === tag);
                if (!tagData) return null;
                return (
                  <View key={tag} style={[styles.tagChip, { backgroundColor: tagData.color }]}>
                    {tagData.icon}
                    <Text style={styles.chipText}>{tagData.label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={[styles.preis, { color: themeColor.text }]}>
            Preis: {parseFloat(gericht.preis).toFixed(2)} €
          </Text>

          <TouchableOpacity
            style={[styles.paypalButton, { backgroundColor: baseColor }]}
            onPress={() =>
              Linking.openURL(
                `https://www.sandbox.paypal.com/paypalme/deinSandboxName/${parseFloat(gericht.preis).toFixed(2)}`
              )
            }
          >
            <Ionicons name="logo-paypal" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.paypalButtonText}>Mit PayPal bezahlen</Text>
          </TouchableOpacity>

          <View style={styles.naehrwerteContainer}>
            <View style={styles.toggleRow}>
              <Text style={[styles.sectionHeading, { color: themeColor.text }]}>
                Nährwerte pro Portion
              </Text>
            </View>
            <View style={styles.naehrwerteGrid}>
              <NaehrwertBox label="Kalorien" value={gericht.naehrwerte_kcal ? `${gericht.naehrwerte_kcal} kcal` : '–'} backgroundColor={boxColor} />
              <NaehrwertBox label="Fett" value={gericht.naehrwerte_fett ? `${gericht.naehrwerte_fett} g` : '–'} backgroundColor={boxColor} />
              <NaehrwertBox label="Eiweiß" value={gericht.naehrwerte_eiweiss ? `${gericht.naehrwerte_eiweiss} g` : '–'} backgroundColor={boxColor} />
              <NaehrwertBox label="Kohlenhydrate" value={gericht.naehrwerte_kohlenhydrate ? `${gericht.naehrwerte_kohlenhydrate} g` : '–'} backgroundColor={boxColor} />
            </View>

            <ZutatenTabelle zutaten={gericht.zutaten} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  kategorie: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  beschreibung: {
    fontSize: 16,
    marginBottom: 12,
  },
  preis: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
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
  naehrwerteContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  naehrwerteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 6,
  },
});
