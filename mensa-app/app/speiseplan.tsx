import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Platform, ActivityIndicator, Alert, FlatList, UIManager
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../constants/supabase';
import { generateMetaData } from '../hooks/dataSync';
import Card from '../components/ui/card';

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

const tagColors: { [key: string]: string } = {
  'vegan': '#4CAF50',
  'vegetarisch': '#8BC34A',
  'glutenfrei': '#FF9800',
  'scharf': '#F44336',
  'hausgemacht': '#FF5722',
  'klassiker': '#3F51B5',
  'leicht': '#03A9F4',
  'süß': '#E91E63',
  'beliebt': '#FF4081'
};

const isColorDark = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
  return brightness < 128;
};

export default function SpeiseplanScreen() {
  return (
    <SafeAreaProvider>
      <InnerSpeiseplanScreen />
    </SafeAreaProvider>
  );
}

function InnerSpeiseplanScreen() {
  const theme = useColorScheme() || 'light';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gerichte, setGerichte] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 5 }, (_, i) => addDays(startOfCurrentWeek, i));
  const weekLabel = `${format(daysOfWeek[0], 'dd.MM.yyyy')} - ${format(daysOfWeek[4], 'dd.MM.yyyy')}`;

  const fetchDishes = async (date: Date) => {
    try {
      setLoading(true);
      const dateString = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('gerichte')
        .select('*')
        .eq('datum', dateString);

      if (error) {
        console.error('Error fetching dishes:', error);
        Alert.alert('Fehler', 'Gerichte konnten nicht geladen werden');
        return [];
      }

      const enhancedData = data?.map(dish => {
        if (!dish.anzeigename || !dish.beschreibung || !dish.bild_url) {
          const meta = generateMetaData({
            name: dish.name,
            zutaten: dish.zutaten
          });
          return { ...dish, ...meta };
        }
        return dish;
      }) || [];

      return enhancedData;
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten');
      return [];
    }
  };

  useEffect(() => {
    const loadDishes = async () => {
      const dishes = await fetchDishes(selectedDate);
      setGerichte(dishes);

      const newFavorites = { ...favorites };
      const newAlerts = { ...alerts };

      dishes.forEach(dish => {
        if (newFavorites[dish.id] === undefined) {
          newFavorites[dish.id] = false;
        }
        if (newAlerts[dish.id] === undefined) {
          newAlerts[dish.id] = false;
        }
      });

      setFavorites(newFavorites);
      setAlerts(newAlerts);
      setLoading(false);
    };

    loadDishes();
  }, [selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  const openDatePicker = () => setShowDatePicker(true);

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'next' ? 7 : -7);
    setSelectedDate(newDate);
    Haptics.selectionAsync().catch(() => {});
  };

  const handleToggleFavorite = (id: number) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAlert = (id: number) => {
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Text style={[styles.title, { color: Colors[theme].accent1 }]}>Speiseplan</Text>

      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={() => changeWeek('prev')}>
          <Ionicons name="chevron-back" size={24} color={Colors[theme].text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openDatePicker}>
          <Text style={[styles.weekText, { color: Colors[theme].text }]}>{weekLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeWeek('next')}>
          <Ionicons name="chevron-forward" size={24} color={Colors[theme].text} />
        </TouchableOpacity>
      </View>

      <View style={styles.dayRow}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day.toISOString()}
            onPress={() => setSelectedDate(day)}
            style={[
              styles.dayButton,
              {
                backgroundColor: isSameDay(day, selectedDate)
                  ? Colors[theme].accent1
                  : Colors[theme].surface,
              },
            ]}
          >
            <Text style={{ color: isSameDay(day, selectedDate) ? '#fff' : Colors[theme].text, fontWeight: '600' }}>
              {format(day, 'EE')}
            </Text>
            <Text style={{ color: isSameDay(day, selectedDate) ? '#fff' : Colors[theme].text, fontSize: 12 }}>
              {format(day, 'dd.MM')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors[theme].accent1} />
      ) : gerichte.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={60} color={Colors[theme].text} />
          <Text style={[styles.emptyText, { color: Colors[theme].text }]}>
            Keine Gerichte für diesen Tag gefunden
          </Text>
        </View>
      ) : (
        <FlatList
          data={gerichte}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
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
                bewertung={0}
                tags={item.tags}
                preis={parseFloat(item.preis)}
                isFavorite={favorites[item.id]}
                isAlert={alerts[item.id]}
                onFavoritePress={() => handleToggleFavorite(item.id)}
                onAlertPress={() => handleToggleAlert(item.id)}
              />
            </Animatable.View>
          )}
        />
      )}
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
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    width: 56,
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
