import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../constants/supabase'; // ✅ Supabase import

export default function HomeScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const logoSource =
    theme === 'dark'
      ? require('../../assets/AppLogoDarkmode.png')
      : require('../../assets/AppLogo.png');

  const iconColor = Colors[theme].text;

  // ✅ Check ob Nutzer eingeloggt ist
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!session || error) {
        router.replace('/userLogin'); // Kein Zugriff ohne Login
        return;
      }

      const seen = await AsyncStorage.getItem('onboardingSeen');
      if (!seen) {
        router.replace('./OnboardingScreen');
      }
    };

    checkSession();
  }, []);

  const handleSkipOnboarding = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    setShowOnboarding(false);
  };

  const handleResetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingSeen');
    Alert.alert('Zurückgesetzt', 'Das Onboarding wird beim nächsten Start wieder angezeigt.');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.topBar}>
        <AnimatedIcon
          name="heart-outline"
          onPress={() => {
            router.push('/favorites');
          }}
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
      </View>

      {__DEV__ && (
        <TouchableOpacity onPress={handleResetOnboarding} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>🔁 Onboarding zurücksetzen</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showOnboarding} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Willkommen bei RateMyMensa!</Text>
            <Text style={styles.modalText}>
              Hier kannst du den Speiseplan checken, Essen bewerten und Favoriten speichern.
            </Text>
            <Pressable style={styles.modalButton} onPress={handleSkipOnboarding}>
              <Text style={styles.modalButtonText}>Nicht mehr anzeigen</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
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
        <Ionicons name={name} size={28} color={tempColor || color} style={styles.icon} />
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
    top: 50,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 24,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
