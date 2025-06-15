import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../constants/supabase';
import { MatchModal } from '../components/tinder/matchModal';
import IntroModal from '../components/tinder/introModal';
import SwipeCard from '../components/tinder/swipeCardTinder';
import { useFavorites } from '../components/speiseplan_heute/favoritesContext';
import { useRouter } from 'expo-router'; // ✅ hinzugefügt

const screenWidth = Dimensions.get('window').width;

interface Gericht {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  tags: string[];
  bild_url: string;
}

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
  const router = useRouter(); // ✅
  const [gerichte, setGerichte] = useState<Gericht[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [introStep, setIntroStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const { toggleFavorite } = useFavorites();

  const position = useRef(new Animated.ValueXY()).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchIntroSeen = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('intro_flags')
        .select('seen_intro')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.seen_intro) {
        setIntroVisible(false);
      }
    };

    fetchIntroSeen();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const [gerichteRes, favoritesRes] = await Promise.all([
        supabase.from('gerichte').select('id, name, anzeigename, beschreibung, tags, bild_url'),
        supabase.from('favorites').select('gerichte (id)').eq('user_id', user.id),
      ]);

      const favoriteIDs = favoritesRes.data
        ?.map((f) => f.gerichte?.id)
        .filter((id): id is number => typeof id === 'number') || [];

      const gefilterteGerichte = (gerichteRes.data || [])
        .filter((g: Gericht) => !favoriteIDs.includes(g.id))
        .map((g: any) => ({
          ...g,
          tags: typeof g.tags === 'string'
            ? g.tags.split(',').map((t: string) => t.trim())
            : Array.isArray(g.tags) ? g.tags : [],
        }));

      setFavoriteIds(favoriteIDs);
      setGerichte(gefilterteGerichte);
      setLoading(false);
    };

    loadData();
  }, []);

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  const swipeCardStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  const handleSwipe = async (direction: 'like' | 'dislike') => {
    const gericht = gerichte[currentIndex];
    if (!gericht) return;

    if (direction === 'like') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !favoriteIds.includes(gericht.id)) {
        await supabase.from('favorites').insert({
          user_id: user.id,
          gericht_id: gericht.id,
          gericht_name: gericht.name,
        });

        await toggleFavorite(gericht.id, gericht.name);
        setFavoriteIds((prev) => [...prev, gericht.id]);
        setShowMatch(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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
          Animated.spring(likeScale, { toValue: 1, useNativeDriver: false }).start();
          Animated.spring(dislikeScale, { toValue: 1, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const currentGericht = gerichte[currentIndex];
  const isLight = theme === 'light';

  const handleCardPress = () => {
    if (!currentGericht) return;
    router.push({
      pathname: '/gerichtDetail',
      params: {
        name: currentGericht.name,
        source: 'tinder',
        color: Colors[theme].accent3,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[theme].accent1} />
      </View>
    );
  }

  if (!currentGericht) {
    return (
      <View style={styles.centered}>
        <Text style={styles.doneText}>Keine weiteren Gerichte verfügbar.</Text>
      </View>
    );
  }

  const handleIntroDismiss = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('intro_flags')
      .upsert({ user_id: user.id, seen_intro: true });
    setIntroVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <IntroModal
        visible={introVisible}
        step={introStep}
        onNextStep={() => setIntroStep((prev) => prev + 1)}
        onDismiss={handleIntroDismiss}
      />

      <Animatable.Text
        animation="fadeInDown"
        delay={100}
        duration={700}
        style={[styles.header, { color: Colors[theme].accent3 }]}
      >
        Essens Tinder
      </Animatable.Text>

      <View style={{ position: 'relative', width: '100%' }}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
          <SwipeCard
            gericht={currentGericht}
            theme={theme}
            panHandlers={panResponder.panHandlers}
            style={swipeCardStyle}
          />
        </TouchableOpacity>

        {swipeDirection === 'like' && (
          <View style={styles.tinderLike}>
            <Text style={styles.tinderLikeText}>LIKE</Text>
          </View>
        )}
        {swipeDirection === 'dislike' && (
          <View style={styles.tinderNope}>
            <Text style={styles.tinderNopeText}>NOPE</Text>
          </View>
        )}
      </View>

      <View style={styles.buttons}>
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <TouchableOpacity
            onPress={() => handleSwipe('dislike')}
            style={[styles.iconButton, isLight && { backgroundColor: '#000' }]}
          >
            <Ionicons name="close" size={36} color="#e74c3c" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity
            onPress={() => handleSwipe('like')}
            style={[styles.iconButton, isLight && { backgroundColor: '#000' }]}
          >
            <Ionicons name="heart" size={36} color="#2ecc71" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <MatchModal visible={showMatch} onClose={() => setShowMatch(false)} />
    </View>
  );
}

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
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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
  tinderLike: {
    position: 'absolute',
    top: 40,
    left: 20,
    transform: [{ rotate: '-20deg' }],
    borderWidth: 4,
    borderColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tinderLikeText: {
    color: '#2ecc71',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tinderNope: {
    position: 'absolute',
    top: 40,
    right: 20,
    transform: [{ rotate: '20deg' }],
    borderWidth: 4,
    borderColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tinderNopeText: {
    color: '#e74c3c',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
