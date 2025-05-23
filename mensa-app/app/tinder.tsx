import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const gerichte = [
  { id: 1, name: 'Käsespätzle', beschreibung: 'Mit Röstzwiebeln und Salat', tags: ['vegetarisch'] },
  { id: 2, name: 'Chili sin Carne', beschreibung: 'Vegan, mit Brot', tags: ['vegan', 'scharf'] },
  { id: 3, name: 'Schnitzel mit Pommes', beschreibung: 'Klassiker mit Zitrone', tags: [] },
];

export default function TinderScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <SwipeScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SwipeScreen() {
  const theme = useColorScheme() || 'light';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [introStep, setIntroStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkIntro = async () => {
      const seenIntro = await AsyncStorage.getItem('seenIntro');
      if (seenIntro === 'true') {
        setIntroVisible(false);
      }
    };
    checkIntro();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [introStep]);

  const position = useRef(new Animated.ValueXY()).current;
  const [likeScale] = useState(new Animated.Value(1));
  const [dislikeScale] = useState(new Animated.Value(1));

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  const swipeCardStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  const handleSwipe = (direction: 'like' | 'dislike') => {
    if (direction === 'like') {
      setFavorites((prev) => [...prev, gerichte[currentIndex].id]);
      setShowMatch(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.timing(position, {
      toValue: { x: direction === 'like' ? screenWidth : -screenWidth, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: false }).start();
      Animated.spring(dislikeScale, { toValue: 1, useNativeDriver: false }).start();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });

        if (gesture.dx > 80 && swipeDirection !== 'like') {
          Haptics.selectionAsync();
          setSwipeDirection('like');
          Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: false }).start();
          Animated.spring(dislikeScale, { toValue: 1, useNativeDriver: false }).start();
        } else if (gesture.dx < -80 && swipeDirection !== 'dislike') {
          Haptics.selectionAsync();
          setSwipeDirection('dislike');
          Animated.spring(dislikeScale, { toValue: 1.4, useNativeDriver: false }).start();
          Animated.spring(likeScale, { toValue: 1, useNativeDriver: false }).start();
        } else if (Math.abs(gesture.dx) < 80 && swipeDirection !== null) {
          setSwipeDirection(null);
          Animated.spring(likeScale, { toValue: 1, useNativeDriver: false }).start();
          Animated.spring(dislikeScale, { toValue: 1, useNativeDriver: false }).start();
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          handleSwipe('like');
        } else if (gesture.dx < -120) {
          handleSwipe('dislike');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          setSwipeDirection(null);
        }
      },
    })
  ).current;

  const currentGericht = gerichte[currentIndex];

  if (!currentGericht) {
    return (
      <View style={styles.centered}>
        <Text style={styles.doneText}>Keine weiteren Gerichte verfügbar.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Text style={[styles.header, { color: Colors[theme].accent3 }]}>Essens Tinder</Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, swipeCardStyle, { backgroundColor: Colors[theme].card }]}
      >
        {/* Overlay Labels */}
        <Animated.View style={[styles.overlayLabel, {
          left: 20,
          transform: [{ rotate: '-12deg' }],
          opacity: position.x.interpolate({ inputRange: [0, 120], outputRange: [0, 1], extrapolate: 'clamp' }),
          backgroundColor: 'rgba(46, 204, 113, 0.15)',
          borderColor: '#2ecc71',
        }]}>
          <Text style={[styles.overlayText, { color: '#2ecc71' }]}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.overlayLabel, {
          right: 20,
          transform: [{ rotate: '12deg' }],
          opacity: position.x.interpolate({ inputRange: [-120, 0], outputRange: [1, 0], extrapolate: 'clamp' }),
          backgroundColor: 'rgba(231, 76, 60, 0.15)',
          borderColor: '#e74c3c',
        }]}>
          <Text style={[styles.overlayText, { color: '#e74c3c' }]}>NOPE</Text>
        </Animated.View>

        <Text style={[styles.title, { color: Colors[theme].text }]}>{currentGericht.name}</Text>
        <Text style={[styles.description, { color: Colors[theme].text }]}>{currentGericht.beschreibung}</Text>

        <View style={styles.imagePlaceholder}>
          <Text style={{ color: '#999' }}>Bild folgt</Text>
        </View>

        <View style={styles.tagRow}>
          {currentGericht.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>
                {tag === 'vegan' ? '🌱 Vegan' : tag === 'vegetarisch' ? '🥦 Vegetarisch' : tag === 'scharf' ? '🌶️ Scharf' : tag}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.buttons}>
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <TouchableOpacity onPress={() => handleSwipe('dislike')} style={styles.iconButton}>
            <Ionicons name="close" size={36} color="#e74c3c" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity onPress={() => handleSwipe('like')} style={styles.iconButton}>
            <Ionicons name="heart" size={36} color="#2ecc71" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Match Popup */}
      <Modal visible={showMatch} transparent animationType="fade">
        <TouchableOpacity activeOpacity={1} onPress={() => setShowMatch(false)} style={styles.matchContainer}>
          <BlurView intensity={40} tint="light" style={styles.matchCard}>
            <Text style={styles.matchTitle}>✨ It's a Match!</Text>
            <LottieView
              source={require('../assets/animations/match.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
            <View style={styles.matchImageTall}>
              <Text style={{ color: '#444', fontSize: 18 }}>Bild folgt</Text>
            </View>
            <Text style={styles.tapHint}>Zum Fortfahren tippen</Text>
          </BlurView>
        </TouchableOpacity>
      </Modal>

      {/* Intro Popup */}
      <Modal visible={introVisible} transparent animationType="fade">
        <View style={styles.matchContainer}>
          <BlurView intensity={40} tint="dark" style={styles.matchCard}>
            <Text style={[styles.matchTitle, { color: 'white' }]}>👋 Na, heiß auf was Leckeres?</Text>
            <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
              {introStep === 1 && <Text style={[styles.description, { color: 'white' }]}>1️⃣ Swipe nach rechts, um ein Gericht zu liken.</Text>}
              {introStep === 2 && <Text style={[styles.description, { color: 'white' }]}>2️⃣ Swipe nach links, um ein Gericht zu überspringen.</Text>}
              {introStep === 3 && <Text style={[styles.description, { color: 'white' }]}>3️⃣ Deine Favoriten findest du später gesammelt.</Text>}
            </Animated.View>
            <View style={styles.introControls}>
              {introStep < 3 ? (
                <TouchableOpacity onPress={() => setIntroStep((prev) => prev + 1)} style={styles.arrowButton}>
                  <Ionicons name="chevron-forward" size={28} color="#2ecc71" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    await AsyncStorage.setItem('seenIntro', 'true');
                    setIntroVisible(false);
                  }}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Los geht’s!</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={async () => {
                await AsyncStorage.setItem('seenIntro', 'true');
                setIntroVisible(false);
              }}
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: 'white', fontSize: 14, textDecorationLine: 'underline' }}>Nicht mehr anzeigen</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

// StyleSheet bleibt unverändert wie in deiner ursprünglichen Datei



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  header: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },
  buttons: {
    position: 'absolute',
    bottom: 32,
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 50,
    elevation: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  overlayLabel: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 3,
    zIndex: 10,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  matchContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchCard: {
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    overflow: 'hidden',
  },
  lottie: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  matchTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  matchImageTall: {
    width: 280,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  tapHint: {
    marginTop: 20,
    fontSize: 15,
    color: '#2ecc71',
    fontStyle: 'italic',
  },
  introControls: {
  marginTop: 30,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},
arrowButton: {
  backgroundColor: '#fff',
  padding: 12,
  borderRadius: 50,
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 6,
},
startButton: {
  backgroundColor: '#2ecc71',
  paddingVertical: 12,
  paddingHorizontal: 28,
  borderRadius: 24,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 6,
},
startButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

});
