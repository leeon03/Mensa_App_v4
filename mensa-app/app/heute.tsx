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
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/card';
import Legende from '../components/legende';
import { supabase } from '../constants/supabase';
import { format } from 'date-fns';
import GerichtBewertungHeute from '../components/gerichtBewertungHeute';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Kommentar = {
  id: number;
  user: string;
  text: string;
  stars: number;
  own?: boolean;
};

type Gericht = {
  id: number;
  name: string;
  anzeigename?: string;
  beschreibung: string;
  bewertung: number;
  kommentare: Kommentar[];
  tags: string[];
  bild_url?: string;
  preis?: number;
};

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
  const [ausgewählt, setAusgewählt] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchGerichte = async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    const userRes = await supabase.auth.getUser();
    const currentUserId = userRes.data.user?.id || null;
    setUserId(currentUserId);

    const { data, error } = await supabase
      .from('gerichte')
      .select('*')
      .eq('datum', today);

    if (error) {
      console.error('Fehler beim Laden:', error);
      Alert.alert('Fehler', 'Gerichte konnten nicht geladen werden.');
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      (data || []).map(async (gericht) => {
        const { data: bewertungen } = await supabase
          .from('bewertungen')
          .select('id, stars, kommentar, created_at, user_id, users(first_name, last_name)')
          .eq('gericht_id', gericht.id)
          .order('created_at', { ascending: false });

        const kommentare: Kommentar[] = (bewertungen || []).map((bew) => {
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
          bewertung: 0,
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

  const handleKommentarSubmit = async (gerichtId: number, data: { text: string; stars: number }) => {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    if (!user) {
      Alert.alert('Fehler', 'Du musst angemeldet sein, um einen Kommentar zu schreiben.');
      return;
    }

    const insertRes = await supabase.from('bewertungen').insert({
      gericht_id: gerichtId,
      user_id: user.id,
      stars: data.stars,
      kommentar: data.text,
      created_at: new Date().toISOString(),
    });

    if (insertRes.error) {
      console.error('Fehler beim Speichern des Kommentars:', insertRes.error);
      Alert.alert('Fehler', 'Kommentar konnte nicht gespeichert werden.');
      return;
    }

    // Lokale Anzeige des Kommentars ohne Reload
    const firstName = user.user_metadata?.first_name || 'Du';
    const lastName = user.user_metadata?.last_name || '';
    const formattedName = `${firstName} ${lastName.charAt(0)}.`.trim();

    const neuerKommentar: Kommentar = {
      id: Date.now(),
      user: formattedName,
      text: data.text,
      stars: data.stars,
      own: true,
    };

    setGerichte((prev) =>
      prev.map((gericht) =>
        gericht.id === gerichtId
          ? { ...gericht, kommentare: [neuerKommentar, ...gericht.kommentare] }
          : gericht
      )
    );
  };

  const handleToggleFavorite = async (gerichtId: number) => {
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

  const handleToggleAlert = async (gerichtId: number) => {
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
    <ScrollView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Animatable.Text
        animation="fadeInDown"
        delay={100}
        style={[styles.title, { color: themeColor.accent2 }]}
      >
        Heute in der Mensa
      </Animatable.Text>

      <Legende />

      {gerichte.map((gericht) => {
        const isActive = ausgewählt === gericht.id;

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
                anzeigename={gericht.anzeigename || gericht.name}
                beschreibung={gericht.beschreibung}
                bild_url={gericht.bild_url || 'https://via.placeholder.com/300'}
                kategorie={gericht.tags[0] || ''}
                bewertung={gericht.bewertung}
                tags={gericht.tags}
                preis={gericht.preis || 4.5}
                isFavorite={favorites[gericht.id] || false}
                isAlert={alerts[gericht.id] || false}
                onFavoritePress={() => handleToggleFavorite(gericht.id)}
                onAlertPress={() => handleToggleAlert(gericht.id)}
              />
            </TouchableOpacity>

            {isActive && (
              <GerichtBewertungHeute
                gerichtName={gericht.name}
                anzeigeName={gericht.anzeigename || gericht.name}
                kommentare={gericht.kommentare}
                onSubmitKommentar={(data) => handleKommentarSubmit(gericht.id, data)}
                onMehrAnzeigen={() => {}}
                themeColor={themeColor}
              />
            )}
          </Animatable.View>
        );
      })}
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
