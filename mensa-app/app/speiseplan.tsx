import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Modal,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import RatingStars from '../components/RatingStars';
import { Ionicons } from '@expo/vector-icons';
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
} from 'date-fns';

const screenWidth = Dimensions.get('window').width;

// Für Android Layout-Animation aktivieren
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const speiseplan: Record<string, any[]> = {
  '2025-05-15': [
    {
      id: 1,
      name: 'Käsespätzle',
      beschreibung: 'Mit Röstzwiebeln und Salat',
      bewertung: 4,
      tags: ['vegetarisch', 'beliebt'],
    },
    {
      id: 2,
      name: 'Chili sin Carne',
      beschreibung: 'Vegan, mit Brot',
      bewertung: 5,
      tags: ['vegan', 'scharf'],
    },
  ],
};

export default function SpeiseplanScreen() {
  const theme = useColorScheme() || 'light';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});
  const [showLegend, setShowLegend] = useState(false);

  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 5 }, (_, i) => addDays(startOfCurrentWeek, i));
  const weekLabel = `${format(daysOfWeek[0], 'dd.MM.yyyy')} - ${format(daysOfWeek[4], 'dd.MM.yyyy')}`;
  const speiseplanKey = selectedDate.toISOString().split('T')[0];
  const gerichte = speiseplan[speiseplanKey] || [];

  const handleDateChange = (event: any, date?: Date) => {
    if (event?.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (date) setSelectedDate(date);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const change = direction === 'next' ? 7 : -7;
    setSelectedDate(addDays(selectedDate, change));
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAlert = (id: number) => {
    setAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getWeekdayShort = (date: Date) => format(date, 'EE');

  const toggleLegend = () => {
    LayoutAnimation.easeInEaseOut();
    setShowLegend(!showLegend);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
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
            <Text
              style={{
                color: isSameDay(day, selectedDate) ? '#fff' : Colors[theme].text,
                fontWeight: '600',
              }}
            >
              {getWeekdayShort(day)}
            </Text>
            <Text
              style={{
                color: isSameDay(day, selectedDate) ? '#fff' : Colors[theme].text,
                fontSize: 12,
              }}
            >
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
      {Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={showDatePicker}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: Colors[theme].background }]}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneButton}>
                <Text style={[styles.doneText, { color: Colors[theme].accent1 }]}>Fertig</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Aufklappbare Legende */}
      <TouchableOpacity onPress={toggleLegend} style={styles.legendToggle}>
        <Text style={[styles.legendeTitle, { color: Colors[theme].text }]}>
          Legende {showLegend ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showLegend && (
        <View style={[styles.legendeContainer, { backgroundColor: Colors[theme].surface }]}>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🌱 Vegan</Text></View>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🥦 Vegetarisch</Text></View>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🌶️ Scharf</Text></View>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🔥 Beliebt</Text></View>
          <View style={styles.legendeChip}>
            <Ionicons name="heart" size={14} color="red" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Favorit</Text>
          </View>
          <View style={styles.legendeChip}>
            <Ionicons name="notifications" size={14} color="#007AFF" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Erinnerung</Text>
          </View>
        </View>
      )}

      {gerichte.length === 0 ? (
        <Text style={[styles.emptyText, { color: Colors[theme].text }]}>
          Kein Essen eingetragen
        </Text>
      ) : (
        gerichte.map((gericht) => (
          <GerichtCard
            key={gericht.id}
            gericht={gericht}
            isFavorite={!!favorites[gericht.id]}
            isAlerted={!!alerts[gericht.id]}
            onToggleFavorite={toggleFavorite}
            onToggleAlert={toggleAlert}
          />
        ))
      )}
    </View>
  );
}

function GerichtCard({
  gericht,
  isFavorite,
  isAlerted,
  onToggleFavorite,
  onToggleAlert,
}: {
  gericht: any;
  isFavorite: boolean;
  isAlerted: boolean;
  onToggleFavorite: (id: number) => void;
  onToggleAlert: (id: number) => void;
}) {
  const theme = useColorScheme() || 'light';
  return (
    <View style={[styles.card, { backgroundColor: Colors[theme].card }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>{gericht.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onToggleFavorite(gericht.id)} style={{ marginLeft: 8 }}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? 'red' : Colors[theme].icon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleAlert(gericht.id)} style={{ marginLeft: 8 }}>
            <Ionicons
              name={isAlerted ? 'notifications' : 'notifications-outline'}
              size={20}
              color={isAlerted ? '#007AFF' : Colors[theme].icon}
            />
          </TouchableOpacity>
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
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
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
  legendToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  legendeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  legendeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  chipText: {
    fontSize: 13,
    color: '#333',
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
  emptyText: {
    fontStyle: 'italic',
    marginVertical: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  doneButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  doneText: {
    fontSize: 16,
  },
});
