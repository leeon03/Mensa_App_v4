import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  UIManager,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../constants/supabase';
import { generateMetaData } from '../hooks/dataSync';
import Card from '../components/ui/card';
import SpeiseplanPDFExport from '../components/pdfExport';
import WeekSelector from '../components/speiseplan_heute/weekSelector';
import { useFavorites } from '../components/speiseplan_heute/favoritesContext';
import Legende from '../components/speiseplan_heute/legende';
import { addDays, format } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

interface Dish {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  kategorie?: string;
  tags: string[];
  preis: string;
  bild_url: string;
  datum: string;
  zutaten: string | string[];
}

interface Bewertung {
  stars: number;
  gericht_name: string;
}

export default function SpeiseplanScreen() {
  return <InnerSpeiseplanScreen />;
}

function InnerSpeiseplanScreen() {
  const theme = useColorScheme() || 'light';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gerichte, setGerichte] = useState<Dish[]>([]);
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const fetchDishes = async (date: Date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const [gerichteRes, bewertungenRes] = await Promise.all([
        supabase.from('gerichte').select('*').eq('datum', dateString),
        supabase
          .from('bewertungen')
          .select('stars, gerichte:bewertungen_gericht_id_fkey(name)')
          .eq('gerichte.datum', dateString),
      ]);

      if (gerichteRes.error || bewertungenRes.error) {
        console.error('Fehler beim Laden:', gerichteRes.error || bewertungenRes.error);
        Alert.alert('Fehler', 'Daten konnten nicht geladen werden');
        return;
      }

      const enriched: Dish[] = (gerichteRes.data || []).map((dish) => {
        if (!dish.anzeigename || !dish.beschreibung || !dish.bild_url) {
          const meta = generateMetaData({
            name: dish.name,
            zutaten: dish.zutaten,
          });
          return { ...dish, ...meta };
        }
        return dish;
      });

      const bewertungen: Bewertung[] = (bewertungenRes.data || [])
        .filter((b: any) => b.gerichte !== null)
        .map((b: any) => ({
          stars: b.stars,
          gericht_name: b.gerichte.name,
        }));

      const newAlerts: Record<number, boolean> = {};
      enriched.forEach((dish) => {
        newAlerts[dish.id] = false;
      });

      setGerichte(enriched);
      setBewertungen(bewertungen);
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Fehler:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDishes(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'next' ? 7 : -7);
    setSelectedDate(newDate);
    Haptics.selectionAsync().catch(() => {});
  };

  const handleToggleAlert = (id: number) => {
    setAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDishes(selectedDate);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Animatable.Text
        animation="fadeInDown"
        duration={700}
        delay={100}
        style={[styles.title, { color: Colors[theme].accent1 }]}
      >
        Speiseplan
      </Animatable.Text>

      <WeekSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        theme={theme}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        changeWeek={changeWeek}
        handleDateChange={handleDateChange}
      />

      <Legende />

      {loading ? (
        <ActivityIndicator size="large" color={Colors[theme].accent1} />
      ) : gerichte.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: Colors[theme].text }]}>
            Keine Gerichte für diesen Tag gefunden
          </Text>
        </View>
      ) : (
        <FlatList
          data={gerichte}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item, index }) => {
            const gerichtBewertungen = bewertungen.filter((b) => b.gericht_name === item.name);

            return (
              <Animatable.View
                animation="fadeInUp"
                duration={600}
                delay={index * 100}
                style={styles.cardContainer}
              >
                <Card
                  name={item.name}
                  anzeigename={item.anzeigename}
                  beschreibung={item.beschreibung}
                  bild_url={item.bild_url}
                  kategorie={item.kategorie || ''}
                  bewertungen={gerichtBewertungen}
                  tags={item.tags}
                  preis={parseFloat(item.preis)}
                  isFavorite={isFavorite(item.name)}
                  isAlert={alerts[item.id]}
                  onFavoritePress={() => toggleFavorite(item.id, item.name)}
                  onAlertPress={() => handleToggleAlert(item.id)}
                />
              </Animatable.View>
            );
          }}
        />
      )}

      <SpeiseplanPDFExport selectedDate={selectedDate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  cardContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
