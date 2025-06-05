import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  UIManager,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import Legende from '../components/speiseplan_heute/legende';
import { supabase } from '../constants/supabase';
import { format } from 'date-fns';
import GerichtBewertungHeute from '../components/speiseplan_heute/gerichtBewertungHeute';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Kommentar {
  id: number;
  stars: number;
  text: string;
  user: string;
  own: boolean;
}

interface Bewertung {
  stars: number;
  gericht_name: string;
}

interface Gericht {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  kategorie?: string;
  tags: string[];
  preis: string;
  bild_url: string;
  datum: string;
  kommentare: Kommentar[];
}

export default function HeuteScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <HeuteContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function HeuteContent() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const [gerichte, setGerichte] = useState<Gericht[]>([]);
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [ausgewählt, setAusgewählt] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});

  const fetchGerichte = async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    const userRes = await supabase.auth.getUser();
    const currentUserId = userRes.data.user?.id || null;
    setUserId(currentUserId);

    const [gerichteRes, bewertungenRes] = await Promise.all([
      supabase.from('gerichte').select('*').eq('datum', today),
      supabase
        .from('bewertungen')
        .select('stars, gerichte:bewertungen_gericht_id_fkey(name)')
        .eq('gerichte.datum', today),
    ]);

    if (gerichteRes.error || bewertungenRes.error) {
      console.error('Fehler beim Laden:', gerichteRes.error || bewertungenRes.error);
      Alert.alert('Fehler', 'Daten konnten nicht geladen werden.');
      setLoading(false);
      return;
    }

    const fetchedBewertungen: Bewertung[] = (bewertungenRes.data || [])
      .filter((b: any) => b.gerichte && b.gerichte.name)
      .map((b: any) => ({
        stars: b.stars,
        gericht_name: b.gerichte.name,
      }));

    setBewertungen(fetchedBewertungen);

    const enriched = await Promise.all(
      (gerichteRes.data || []).map(async (gericht) => {
        const { data: gerichtBews } = await supabase
          .from('bewertungen')
          .select('id, stars, kommentar, created_at, user_id, users(first_name, last_name)')
          .eq('gericht_id', gericht.id)
          .order('created_at', { ascending: false });

        const kommentare: Kommentar[] = (gerichtBews || []).map((bew) => {
          const firstName = bew.users?.first_name || '';
          const lastInitial = bew.users?.last_name?.charAt(0) || '';
          const formattedName = `${firstName} ${lastInitial}.`.trim();

          return {
            id: bew.id,
            stars: bew.stars,
            text: bew.kommentar,
            user: formattedName,
            own: bew.user_id === currentUserId,
          };
        });

        return {
          ...gericht,
          kommentare,
        };
      })
    );

    setGerichte(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchGerichte();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGerichte();
    setRefreshing(false);
  };

  const handleToggleFavorite = (gerichtId: number) => {
    const isActive = favorites[gerichtId];
    if (!isActive) {
      setFavorites((prev) => ({ ...prev, [gerichtId]: true }));
    } else {
      Alert.alert(
        'Favorit entfernen',
        'Möchtest du dieses Gericht wirklich aus deinen Favoriten löschen?',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Entfernen',
            style: 'destructive',
            onPress: () => {
              setFavorites((prev) => ({ ...prev, [gerichtId]: false }));
            },
          },
        ]
      );
    }
  };

  const handleToggleAlert = (gerichtId: number) => {
    const isNowActive = !alerts[gerichtId];
    setAlerts((prev) => ({ ...prev, [gerichtId]: isNowActive }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColor.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animatable.Text
        animation="fadeInDown"
        delay={100}
        style={[styles.title, { color: themeColor.accent2 }]}
      >
        Heute in der Mensa
      </Animatable.Text>

      <Legende />

      {gerichte.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: themeColor.text }}>
          Keine Gerichte für heute gefunden.
        </Text>
      ) : (
        gerichte.map((gericht) => {
          const isActive = ausgewählt === gericht.id;
          const gerichtBewertungen = bewertungen.filter(
            (b) => b.gericht_name === gericht.name
          );

          return (
            <Animatable.View
              key={gericht.id}
              animation="fadeInUp"
              delay={gericht.id * 100}
              style={{ marginBottom: 16 }}
            >
              <TouchableOpacity onPress={() => setAusgewählt(isActive ? null : gericht.id)}>
                <Card
                  name={gericht.name}
                  anzeigename={gericht.anzeigename}
                  beschreibung={gericht.beschreibung}
                  bild_url={gericht.bild_url}
                  kategorie={gericht.kategorie || ''}
                  bewertungen={gerichtBewertungen}
                  tags={gericht.tags}
                  preis={parseFloat(gericht.preis)}
                  isFavorite={favorites[gericht.id] || false}
                  isAlert={alerts[gericht.id] || false}
                  onFavoritePress={() => handleToggleFavorite(gericht.id)}
                  onAlertPress={() => handleToggleAlert(gericht.id)}
                />
              </TouchableOpacity>

              {isActive && (
                <GerichtBewertungHeute
                  gerichtId={gericht.id}
                  kommentare={gericht.kommentare}
                  userId={userId}
                  onUpdate={fetchGerichte}
                />
              )}
            </Animatable.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
});
