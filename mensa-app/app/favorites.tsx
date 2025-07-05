import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../components/speiseplan_heute/favoritesContext';
import { supabase } from '../constants/supabase';
import Card from '../components/ui/card';
import Legende from '../components/speiseplan_heute/legende';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  return (
    <SafeAreaProvider>
      <FavoritesInner />
    </SafeAreaProvider>
  );
}

function FavoritesInner() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const { toggleFavorite, isFavorite } = useFavorites();
  const router = useRouter();

  type Gericht = {
    id: number;
    name: string;
    anzeigename: string;
    beschreibung: string;
    tags?: string[];
    preis: string;
    bild_url: string;
    kategorie?: string;
  };

  const [gerichte, setGerichte] = useState<Gericht[]>([]);
  const [loading, setLoading] = useState(true);
  const animationRefs = useRef<Record<string, Animated.Value>>({});

  const loadFavoritesFromDB = async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setGerichte([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('gerichte (id, name, anzeigename, beschreibung, tags, preis, bild_url, kategorie)')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Fehler beim Laden der Favoriten:', error);
      setGerichte([]);
      setLoading(false);
      return;
    }

    const gefiltert = data.map((f) => f.gerichte).filter((g) => g !== null);

    gefiltert.forEach((g) => {
      const key = g.id.toString();
      if (!animationRefs.current[key]) {
        animationRefs.current[key] = new Animated.Value(1);
      }
    });

    setGerichte(gefiltert);
    setLoading(false);
  };

  useEffect(() => {
    loadFavoritesFromDB();
  }, []);

  const handleRemove = useCallback(async (gerichtId: number, gerichtName: string) => {
    const key = gerichtId.toString();
    const anim = animationRefs.current[key];

    const confirmed = await toggleFavorite(gerichtId, gerichtName);

    if (confirmed && anim) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // ✅ Immediately remove the item from UI
        setGerichte((prev) => prev.filter((g) => g.id !== gerichtId));

        // 🔁 Optional: reload from DB after short delay
        setTimeout(() => {
          loadFavoritesFromDB();
        }, 300);
      });
    }
  }, [toggleFavorite]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Text style={[styles.title, { color: '#ff4c4c' }]}>Deine Favoriten</Text>
      <Legende />

      {loading ? (
        <ActivityIndicator size="large" color={themeColor.accent1} />
      ) : gerichte.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: themeColor.text }}>
          Du hast noch keine Favoriten gespeichert.
        </Text>
      ) : (
        <ScrollView>
          {gerichte.map((gericht) => {
            const key = gericht.id.toString();
            const opacity = animationRefs.current[key] || new Animated.Value(1);
            const translateX = opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-200, 0],
            });

            return (
              <Animated.View
                key={gericht.id}
                style={{
                  opacity,
                  transform: [{ translateX }],
                }}
              >
                <Card
                  name={gericht.name}
                  anzeigename={gericht.anzeigename}
                  beschreibung={gericht.beschreibung}
                  bild_url={gericht.bild_url}
                  kategorie={gericht.kategorie || ''}
                  bewertungen={[]} // Favoriten haben keine Bewertungen geladen
                  tags={gericht.tags || []}
                  preis={parseFloat(gericht.preis)}
                  isFavorite={true}
                  isAlert={false}
                  onFavoritePress={() => handleRemove(gericht.id, gericht.name)}
                  onAlertPress={() => {}}
                  onPress={() =>
                    router.push({
                      pathname: '/gerichtDetail',
                      params: {
                        name: gericht.name,
                        source: 'favorites',
                        color: '#ff4c4c',
                      },
                    })
                  }
                />
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
});
