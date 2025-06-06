import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../constants/supabase';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <InnerHomeScreen />
    </SafeAreaProvider>
  );
}

function InnerHomeScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const logoSource =
    theme === 'dark'
      ? require('../assets/AppLogoDarkmode.png')
      : require('../assets/AppLogo.png');

  const iconColor = Colors[theme].text;

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!user || authError) {
        router.replace('/userLogin');
        return;
      }

      const { data: onboardingData, error: onboardingError } = await supabase
        .from('intro_flags')
        .select('onboarding_seen')
        .eq('user_id', user.id)
        .single();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        console.error('Fehler beim Laden von onboarding_seen:', onboardingError);
        return;
      }

      const hasSeenOnboarding = onboardingData?.onboarding_seen ?? false;
      if (!hasSeenOnboarding) {
        router.replace('/onboardingscreen');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Fehler beim Abrufen der Rolle:', userError);
      } else {
        setIsAdmin(userData.role === 'admin');
      }

      setLoading(false);
    };

    checkUserStatus();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.topBar}>
        <AnimatedIcon
          name="heart-outline"
          onPress={() => router.push('/favorites')}
          color={iconColor}
        />
        <AnimatedIcon
          name="person-circle"
          onPress={() => router.push('/profile')}
          color={iconColor}
        />
      </View>

      <View style={styles.header}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: Colors[theme].primary }]}>RateMyMensa</Text>
        <Text style={[styles.subtitle, { color: Colors[theme].text }]}>
          Speisepläne checken, Gerichte bewerten, Favoriten speichern – deine Mensa, dein Geschmack.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          icon="calendar-outline"
          label="Speiseplan ansehen"
          color={Colors[theme].accent1}
          onPress={() => router.push('/speiseplan')}
        />
        <PrimaryButton
          icon="restaurant-outline"
          label="Heute in der Mensa"
          color={Colors[theme].accent2}
          onPress={() => router.push('/heute')}
        />
        <PrimaryButton
          icon="heart-outline"
          label="Essens-Tinder"
          color={Colors[theme].accent3}
          onPress={() => router.push('/tinder')}
        />
        {isAdmin && (
          <PrimaryButton
            icon="settings-outline"
            label="Admin Panel"
            color="#d9534f"
            onPress={() => {
              console.log('Admin Panel kommt bald!');
              // router.push('/admin'); // Später aktivieren
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress,
  color,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={20} color="#fff" style={styles.buttonIcon} />
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function AnimatedIcon({
  name,
  onPress,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [tempColor, setTempColor] = useState<string | null>(null);

  const handlePress = () => {
    Haptics.selectionAsync();

    if (name === 'heart-outline') {
      setTempColor('red');
      setTimeout(() => setTempColor(null), 400);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name={name} size={35} color={tempColor || color} style={styles.icon} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 70,
    right: 24,
    flexDirection: 'row',
    gap: 16,
    zIndex: 10,
  },
  icon: {
    marginLeft: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 40,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 22,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
