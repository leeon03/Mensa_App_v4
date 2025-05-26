import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Platform, Modal, LayoutAnimation, UIManager, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import RatingStars from '../components/RatingStars';
import { Ionicons } from '@expo/vector-icons';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';

const screenWidth = Dimensions.get('window').width;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});
  const [showLegend, setShowLegend] = useState(false);

  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 5 }, (_, i) => addDays(startOfCurrentWeek, i));
  const weekLabel = `${format(daysOfWeek[0], 'dd.MM.yyyy')} - ${format(daysOfWeek[4], 'dd.MM.yyyy')}`;

  useEffect(() => {
    const dummyGerichte = [
      { id: 1, name: 'Käsespätzle', beschreibung: 'Mit Röstzwiebeln und Salat', bewertung: 4, tags: ['vegetarisch', 'beliebt'] },
      { id: 2, name: 'Currywurst', beschreibung: 'Mit Pommes Frites', bewertung: 3, tags: ['scharf'] },
      { id: 3, name: 'Vegane Gemüsepfanne', beschreibung: 'Mit Reis und Sojasauce', bewertung: 5, tags: ['vegan', 'beliebt'] },
    ];
    setLoading(true);
    setTimeout(() => {
      setGerichte(dummyGerichte);
      setLoading(false);
    }, 500);
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
  };

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  const handleToggleFavorite = async (id: number) => {
    if (!favorites[id]) {
      triggerHaptic();
      await playSound(require('../assets/sounds/heart.wav'));
      setFavorites((prev) => ({ ...prev, [id]: true }));
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
              triggerHaptic();
              setFavorites((prev) => ({ ...prev, [id]: false }));
            },
          },
        ]
      );
    }
  };

  const handleToggleAlert = async (id: number) => {
    const isNowActive = !alerts[id];
    setAlerts((prev) => ({ ...prev, [id]: isNowActive }));
    if (isNowActive) {
      triggerHaptic();
      await playSound(require('../assets/sounds/glocke.wav'));
    }
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
        <ActivityIndicator size="large" />
      ) : (
        gerichte.map((gericht) => (
          <Animatable.View key={gericht.id} animation="fadeInUp" duration={500} delay={gericht.id * 100}>
            <View style={[styles.card, { backgroundColor: Colors[theme].card }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>{gericht.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Animatable.View animation="bounceIn">
                    <TouchableOpacity onPress={() => handleToggleFavorite(gericht.id)}>
                      <Ionicons
                        name={favorites[gericht.id] ? 'heart' : 'heart-outline'}
                        size={20}
                        color={favorites[gericht.id] ? 'red' : Colors[theme].icon}
                      />
                    </TouchableOpacity>
                  </Animatable.View>
                  <Animatable.View animation="pulse" duration={300}>
                    <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => handleToggleAlert(gericht.id)}>
                      <Ionicons
                        name={alerts[gericht.id] ? 'notifications' : 'notifications-outline'}
                        size={20}
                        color={alerts[gericht.id] ? '#007AFF' : Colors[theme].icon}
                      />
                    </TouchableOpacity>
                  </Animatable.View>
                </View>
              </View>
              <Text style={[styles.cardText, { color: Colors[theme].text }]}>{gericht.beschreibung}</Text>
              <View style={styles.tagRow}>
                {gericht.tags?.includes('vegan') && <Text style={styles.tag}>🌱</Text>}
                {gericht.tags?.includes('vegetarisch') && <Text style={styles.tag}>🥦</Text>}
                {gericht.tags?.includes('scharf') && <Text style={styles.tag}>🌶️</Text>}
                {gericht.tags?.includes('beliebt') && <Text style={styles.tag}>🔥</Text>}
              </View>
              <RatingStars value={gericht.bewertung} />
            </View>
          </Animatable.View>
        ))
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
    marginBottom: 12,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    width: 56,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 4,
  },
  tag: {
    fontSize: 16,
    marginRight: 6,
  },
});
