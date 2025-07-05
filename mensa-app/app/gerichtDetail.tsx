import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import GerichtHeader from '../components/gerichtDetail/gerichtHeader';
import GerichtBewertungHeute from '../components/speiseplan_heute/gerichtBewertungHeute';
import ImageGallery from '../components/speiseplan_heute/galerie';
import PaypalButton from '../components/gerichtDetail/paypalButton'; // NEU

const TAGS = [
  { key: 'vegan', label: 'Vegan', icon: 'leaf', color: '#A5D6A7' },
  { key: 'vegetarisch', label: 'Vegetarisch', icon: 'food-apple', color: '#C5E1A5' },
  { key: 'leicht', label: 'Leicht', icon: 'sunny', color: '#FFF59D' },
  { key: 'glutenfrei', label: 'Glutenfrei', icon: 'ban', color: '#FFE082' },
  { key: 'scharf', label: 'Scharf', icon: 'chili-hot', color: '#EF9A9A' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', icon: 'cow', color: '#E57373' },
  { key: 'fischhaltig', label: 'Fischhaltig', icon: 'fish', color: '#81D4FA' },
  { key: 'beliebt', label: 'Beliebt', icon: 'flame', color: '#F48FB1' },
  { key: 'favorit', label: 'Favorit', icon: 'heart', color: '#F06292' },
  { key: 'erinnerung', label: 'Erinnerung', icon: 'notifications', color: '#B0BEC5' },
];

const getPastellBackground = (hex: string, theme: string) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = theme === 'dark' ? -20 : 40;
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `rgb(${R},${G},${B})`;
};

export default function GerichtDetailScreen() {
  const { name, color } = useLocalSearchParams();
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const [gericht, setGericht] = useState<any>(null);
  const [bewertungen, setBewertungen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof name !== 'string') return;

    const loadData = async () => {
      setLoading(true);

      const [{ data: gerichtData }, { data: session }] = await Promise.all([
        supabase
          .from('gerichte')
          .select('*')
          .eq('name', name)
          .order('datum', { ascending: false })
          .limit(1),
        supabase.auth.getSession(),
      ]);

      const currentUserId = session?.session?.user?.id || null;
      if (currentUserId) setUserId(currentUserId);

      if (gerichtData && gerichtData.length > 0) {
        const gericht = gerichtData[0];
        setGericht(gericht);

        const { data: bewertungenData, error } = await supabase
          .from('bewertungen')
          .select(`
            id,
            kommentar,
            stars,
            created_at,
            user_id,
            bild_url,
            users (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('gericht_id', gericht.id);

        if (error) {
          console.error('Fehler beim Laden der Bewertungen:', error);
        } else {
          const mapped = bewertungenData.map((b: any) => ({
            id: b.id,
            user: `${b.users?.first_name ?? ''} ${b.users?.last_name ?? ''}`.trim() || 'Unbekannt',
            text: b.kommentar || '',
            stars: b.stars,
            avatarUri: b.users?.avatar_url || null,
            timestamp: b.created_at || '',
            own: b.user_id === currentUserId,
            bild_url: b.bild_url || null,
          }));
          setBewertungen(mapped);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [name]);

  const refreshBewertungen = async () => {
    if (!gericht?.id || !userId) return;

    const { data, error } = await supabase
      .from('bewertungen')
      .select(`
        id,
        kommentar,
        stars,
        created_at,
        user_id,
        bild_url,
        users (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('gericht_id', gericht.id);

    if (error) {
      console.error('Fehler beim Refresh:', error);
      return;
    }

    const mapped = data.map((b: any) => ({
      id: b.id,
      user: `${b.users?.first_name ?? ''} ${b.users?.last_name ?? ''}`.trim() || 'Unbekannt',
      text: b.kommentar || '',
      stars: b.stars,
      avatarUri: b.users?.avatar_url || null,
      timestamp: b.created_at || '',
      own: b.user_id === userId,
      bild_url: b.bild_url || null,
    }));

    setBewertungen(mapped);
  };

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

        <GerichtHeader
          bild_url={gericht.bild_url}
          anzeigename={gericht.anzeigename}
          kategorie={gericht.kategorie}
          beschreibung={gericht.beschreibung}
          textColor={themeColor.text}
          bewertungen={bewertungen}
          name={gericht.name}
        />

        <View style={styles.content}>
          {gericht.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {gericht.tags.map((tag: string) => {
                const tagData = TAGS.find(t => t.key === tag);
                if (!tagData) return null;

                const IconComponent = ['sunny', 'ban', 'flame', 'heart', 'notifications'].includes(tagData.icon)
                  ? Ionicons
                  : MaterialCommunityIcons;

                return (
                  <View key={tag} style={[styles.tagChip, { backgroundColor: getPastellBackground(tagData.color, theme) }]}>
                    <IconComponent name={tagData.icon as any} size={14} color={themeColor.text} />
                    <Text style={[styles.chipText, { color: themeColor.text }]}>{tagData.label}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={[styles.preis, { color: themeColor.text }]}>
            Preis: {parseFloat(gericht.preis).toFixed(2)} €
          </Text>

          {/* PayPal Button mit Komponente */}
          <PaypalButton amount={parseFloat(gericht.preis)} backgroundColor={baseColor} />

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

          <GerichtBewertungHeute
            gerichtId={gericht.id}
            kommentare={bewertungen}
            userId={userId}
            onUpdate={refreshBewertungen}
            buttonColor={baseColor}
          />

          <ImageGallery bewertungen={bewertungen} />
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
  content: {
    padding: 16,
  },
  preis: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    marginLeft: 6,
  },
});
