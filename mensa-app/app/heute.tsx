import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import RatingStars from '../components/RatingStars';
import KommentarBox from '../components/KommentarBox';
import ChatBubble from '../components/ChatBubble';
import * as Animatable from 'react-native-animatable';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

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
  beschreibung: string;
  bewertung: number;
  kommentare: Kommentar[];
  tags: string[];
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

  const [gerichte, setGerichte] = useState<Gericht[]>([
    {
      id: 1,
      name: 'Vegetarisches Curry',
      beschreibung: 'Mit Reis, Gemüse & Kokossoße',
      bewertung: 4,
      tags: ['vegetarisch', 'scharf', 'beliebt'],
      kommentare: [],
    },
    {
      id: 2,
      name: 'Spaghetti Bolognese',
      beschreibung: 'Mit Rindfleischsoße und Parmesan',
      bewertung: 3,
      tags: [],
      kommentare: [],
    },
    {
      id: 3,
      name: 'Vegane Bowl',
      beschreibung: 'Mit Quinoa, Tofu und Edamame',
      bewertung: 5,
      tags: ['vegan', 'beliebt'],
      kommentare: [],
    },
  ]);

  const [ausgewählt, setAusgewählt] = useState<number | null>(null);
  const [selectedGerichtDetails, setSelectedGerichtDetails] = useState<Gericht | null>(null);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});
  const [showLegend, setShowLegend] = useState(true);

  const toggleLegend = () => {
    LayoutAnimation.easeInEaseOut();
    setShowLegend(!showLegend);
  };

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  const handleToggleFavorite = async (gerichtId: number) => {
    const isActive = favorites[gerichtId];

    if (!isActive) {
      triggerHaptic();
      await playSound(require('../assets/sounds/heart.wav'));
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
              triggerHaptic();
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

    if (isNowActive) {
      triggerHaptic();
      await playSound(require('../assets/sounds/glocke.wav'));
    }
  };
  const handleKommentarSubmit = (gerichtId: number, data: { text: string; stars: number }) => {
    const neuerKommentar: Kommentar = {
      id: Date.now(),
      user: 'Du',
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

  const renderTags = (tags: string[]) => (
    <View style={{ flexDirection: 'row', marginBottom: 4 }}>
      {tags.includes('vegan') && <Text style={styles.tag}>🌱</Text>}
      {tags.includes('vegetarisch') && <Text style={styles.tag}>🥦</Text>}
      {tags.includes('scharf') && <Text style={styles.tag}>🌶️</Text>}
      {tags.includes('beliebt') && <Text style={styles.tag}>🔥</Text>}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Animatable.Text
        animation="fadeInDown"
        delay={100}
        style={[styles.title, { color: themeColor.accent2 }]}
      >
        Heute in der Mensa
      </Animatable.Text>

      <TouchableOpacity onPress={toggleLegend} style={styles.legendToggle}>
        <Text style={[styles.legendeTitle, { color: themeColor.text }]}>
          Legende {showLegend ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showLegend && (
        <View style={[styles.legendeContainer, { backgroundColor: themeColor.surface }]}>
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

      {gerichte.map((gericht) => {
        const isActive = ausgewählt === gericht.id;

        return (
          <Animatable.View
            key={gericht.id}
            animation="fadeInUp"
            delay={gericht.id * 100}
            style={[styles.gerichtWrapper, isActive && styles.activeGericht]}
          >
            <TouchableOpacity onPress={() => setAusgewählt(isActive ? null : gericht.id)}>
              <View style={[styles.gerichtBox, { backgroundColor: themeColor.surface }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gerichtName, { color: themeColor.text }]}>{gericht.name}</Text>
                    <Text style={[styles.gerichtBeschreibung, { color: themeColor.text }]}>{gericht.beschreibung}</Text>
                    {renderTags(gericht.tags)}
                    <RatingStars value={gericht.bewertung} />
                  </View>
                  <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginLeft: 12 }}>
                    <Animatable.View animation="bounceIn">
                      <TouchableOpacity onPress={() => handleToggleFavorite(gericht.id)}>
                        <Ionicons
                          name={favorites[gericht.id] ? 'heart' : 'heart-outline'}
                          size={20}
                          color={favorites[gericht.id] ? 'red' : themeColor.icon}
                        />
                      </TouchableOpacity>
                    </Animatable.View>
                    <Animatable.View animation="pulse" duration={300}>
                      <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => handleToggleAlert(gericht.id)}>
                        <Ionicons
                          name={alerts[gericht.id] ? 'notifications' : 'notifications-outline'}
                          size={20}
                          color={alerts[gericht.id] ? '#007AFF' : themeColor.icon}
                        />
                      </TouchableOpacity>
                    </Animatable.View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {isActive && (
              <Animatable.View animation="fadeIn" duration={400} style={[styles.detailBox, { backgroundColor: themeColor.surface }]}>
                <Animatable.View
                  animation="pulse"
                  iterationCount={3}
                  duration={500}
                  style={[styles.detailButton, { backgroundColor: themeColor.accent2 }]}
                >
                  <TouchableOpacity onPress={() => setSelectedGerichtDetails(gericht)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="information-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.detailButtonText}>Mehr anzeigen</Text>
                  </TouchableOpacity>
                </Animatable.View>

                <Text style={[styles.detailTitle, { color: themeColor.text }]}>
                  Deine Bewertung für {gericht.name}
                </Text>
                <KommentarBox onSubmit={(data) => handleKommentarSubmit(gericht.id, data)} />

                <Text style={[styles.detailTitle, { color: themeColor.text }]}>
                  Kommentare zu {gericht.name}
                </Text>

                {gericht.kommentare.length === 0 ? (
                  <Text style={{ color: themeColor.icon, marginBottom: 8 }}>Noch keine Kommentare</Text>
                ) : (
                  gericht.kommentare.map((kommentar, index) => (
                    <Animatable.View
                      key={kommentar.id}
                      animation={kommentar.own ? 'fadeInRight' : 'fadeInLeft'}
                      duration={500}
                      delay={index * 120}
                    >
                      <ChatBubble
                        user={kommentar.user}
                        text={kommentar.text}
                        stars={kommentar.stars}
                        own={kommentar.own}
                      />
                    </Animatable.View>
                  ))
                )}
              </Animatable.View>
            )}
          </Animatable.View>
        );
      })}
    </ScrollView>
  );
}

// Styles bleiben gleich (keine Änderungen notwendig)
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
  gerichtWrapper: {
    marginBottom: 20,
  },
  gerichtBox: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  gerichtName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  gerichtBeschreibung: {
    fontSize: 15,
    marginBottom: 8,
  },
  tag: {
    fontSize: 16,
    marginRight: 6,
  },
  activeGericht: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  detailBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  detailButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '600',
  },
});
