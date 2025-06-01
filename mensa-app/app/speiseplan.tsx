import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Platform, Modal, LayoutAnimation, UIManager, ActivityIndicator, Alert,
  Image, FlatList, ScrollView
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

// Define TypeScript interfaces for dish data
interface Dish {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  kategorie?: string;
  tags: string[];
  bewertung: number;
  preis: string;
  bild_url: string;
}

// Color mapping for tags
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

// Utility to determine text color based on background
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
  const [showLegend, setShowLegend] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 5 }, (_, i) => addDays(startOfCurrentWeek, i));
  const weekLabel = `${format(daysOfWeek[0], 'dd.MM.yyyy')} - ${format(daysOfWeek[4], 'dd.MM.yyyy')}`;

  useEffect(() => {
    const dummyGerichte: Dish[] = [
      { 
        id: 1, 
        name: 'Käsespätzle', 
        anzeigename: 'Käsespätzle mit Röstzwiebeln',
        beschreibung: 'Mit Röstzwiebeln und Salat', 
        bewertung: 4, 
        tags: ['vegetarisch', 'beliebt'], 
        preis: '8,90 €',
        bild_url: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg'
      },
      { 
        id: 2, 
        name: 'Currywurst', 
        anzeigename: 'Currywurst Spezial',
        beschreibung: 'Mit Pommes Frites und hausgemachter Currysoße', 
        bewertung: 3, 
        tags: ['scharf', 'klassiker'], 
        preis: '7,50 €',
        bild_url: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg'
      },
      { 
        id: 3, 
        name: 'Vegane Gemüsepfanne', 
        anzeigename: 'Vegane Gemüsepfanne',
        beschreibung: 'Mit Reis und Sojasauce', 
        bewertung: 5, 
        tags: ['vegan', 'leicht'], 
        preis: '9,20 €',
        bild_url: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg'
      },
    ];
    
    // Initialize favorite and alert states
    const initialFavState: Record<number, boolean> = {};
    const initialAlertState: Record<number, boolean> = {};
    dummyGerichte.forEach(d => {
      initialFavState[d.id] = false;
      initialAlertState[d.id] = false;
    });
    setFavorites(initialFavState);
    setAlerts(initialAlertState);
    
    setLoading(true);
    setTimeout(() => {
      setGerichte(dummyGerichte);
      setLoading(false);
    }, 500);
  }, [selectedDate]);

  // Load sound effect
  useEffect(() => {
    let soundObj: Audio.Sound;
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/click.mp3'));
        soundObj = sound;
        setSound(soundObj);
      } catch (error) {
        console.warn('Sound loading error', error);
      }
    };
    loadSound();
    
    return () => {
      if (soundObj) {
        soundObj.unloadAsync();
      }
    };
  }, []);

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

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  const handleToggleFavorite = async (id: number) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
    triggerHaptic();
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.warn('Sound play error', error);
      }
    }
  };

  const handleToggleAlert = async (id: number) => {
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }));
    triggerHaptic();
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.warn('Sound play error', error);
      }
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      let iconName: any;
      if (i <= fullStars) {
        iconName = 'star';
      } else if (i === fullStars + 1 && halfStar) {
        iconName = 'star-half';
      } else {
        iconName = 'star-outline';
      }
      
      const iconColor = iconName === 'star-outline' ? Colors[theme].text : '#FFD700';
      stars.push(
        <Ionicons key={i} name={iconName} size={16} color={iconColor} />
      );
    }
    return stars;
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
              <View style={[
                styles.card, 
                { 
                  backgroundColor: Colors[theme].card,
                  shadowColor: Colors[theme].text,
                }
              ]}>
                {/* Dish Image */}
                <Image 
                  source={{ uri: item.bild_url }} 
                  style={styles.cardImage} 
                  resizeMode="cover"
                />
                
                {/* Favorite & Alert Icons */}
                <View style={styles.iconContainer}>
                  <TouchableOpacity 
                    onPress={() => handleToggleFavorite(item.id)} 
                    style={styles.iconButton}
                  >
                    <Ionicons 
                      name={favorites[item.id] ? 'heart' : 'heart-outline'} 
                      size={24} 
                      color={favorites[item.id] ? 'red' : '#FFF'} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleToggleAlert(item.id)} 
                    style={[styles.iconButton, { marginLeft: 10 }]}
                  >
                    <Ionicons 
                      name={alerts[item.id] ? 'notifications' : 'notifications-outline'} 
                      size={24} 
                      color={alerts[item.id] ? '#FFD700' : '#FFF'} 
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Card Content */}
                <View style={styles.cardContent}>
                {/* Category */}
                {item.kategorie && (
                  <Text style={[styles.categoryText, { color: Colors[theme].text }]}>
                    {item.kategorie}
                  </Text>
                )}
                  
                  {/* Title */}
                  <Text style={[styles.titleText, { color: Colors[theme].text }]}>
                    {item.anzeigename}
                  </Text>
                  
                  {/* Description */}
                  <Text style={[styles.descriptionText, { color: Colors[theme].text }]}>
                    {item.beschreibung}
                  </Text>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagContainer}>
                      {item.tags.map((tag) => {
                        const bgColor = tagColors[tag] || '#888';
                        const textColor = isColorDark(bgColor) ? '#FFF' : '#000';
                        return (
                          <Text 
                            key={tag} 
                            style={[
                              styles.tag, 
                              { 
                                backgroundColor: bgColor, 
                                color: textColor 
                              }
                            ]}
                          >
                            {tag}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                  
                  {/* Rating and Price */}
                  <View style={styles.footerRow}>
                    {/* Rating Stars */}
                    <View style={styles.starContainer}>
                      {renderStars(item.bewertung)}
                    </View>
                    
                    {/* Price */}
                    <Text style={[styles.priceText, { color: Colors[theme].text }]}>
                      {item.preis}
                    </Text>
                  </View>
                </View>
              </View>
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
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 6,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starContainer: {
    flexDirection: 'row',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
});