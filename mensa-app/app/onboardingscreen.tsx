import React, { useEffect, useState } from 'react';
import { Text, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import Onboarding from 'react-native-onboarding-swiper/src/index';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { supabase } from '../constants/supabase';

export default function OnboardingScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean | null>(null);

  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;

  const logo = theme === 'dark'
    ? require('../assets/AppLogoDarkmode.png')
    : require('../assets/AppLogo.png');

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        console.warn('Kein eingeloggter Benutzer oder Fehler:', authError);
        setShouldShowOnboarding(true);
        return;
      }

      const { data, error } = await supabase
        .from('intro_flags')
        .select('onboarding_seen')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden von onboarding_seen:', error);
        setShouldShowOnboarding(true);
      } else {
        setShouldShowOnboarding(!data?.onboarding_seen);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleDone = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      console.warn('Fehler beim Abrufen des Benutzers:', authError);
      return;
    }

    const { error } = await supabase
      .from('intro_flags')
      .upsert({ user_id: user.id, onboarding_seen: true });

    if (error) {
      console.error('Fehler beim Speichern von onboarding_seen:', error);
    }

    router.replace('/startseite');
  };

  if (shouldShowOnboarding === false) {
    router.replace('/startseite');
    return null;
  }

  if (shouldShowOnboarding === null) return null;

  return (
    <Onboarding
      onDone={handleDone}
      onSkip={handleDone}
      dotColor={theme === 'dark' ? '#555' : '#ccc'}
      activeDotColor={Colors[theme].primary}
      pages={[
        {
          backgroundColor,
          image: <Image source={logo} style={{ width: 160, height: 160, resizeMode: 'contain' }} />,
          title: (
            <Text style={{
              color: Colors[theme].primary,
              fontSize: 24,
              fontWeight: 'bold',
              paddingHorizontal: 16,
              textAlign: 'center',
            }}>
              Willkommen bei RateMyMensa
            </Text>
          ),
          subtitle: (
            <Text style={{
              color: textColor,
              fontSize: 16,
              textAlign: 'center',
              paddingHorizontal: 32,
            }}>
              Deine Mensa. Dein Geschmack.{"\n"}Checke Speisepläne, bewerte Gerichte und speichere Favoriten.
            </Text>
          ),
        },
        {
          backgroundColor,
          image: <Ionicons name="calendar-outline" size={100} color={Colors[theme].accent1} />,
          title: (
            <Text style={{
              color: Colors[theme].accent1,
              fontSize: 24,
              fontWeight: 'bold',
              paddingHorizontal: 16,
              textAlign: 'center',
            }}>
              Speiseplan
            </Text>
          ),
          subtitle: (
            <Text style={{
              color: textColor,
              fontSize: 16,
              textAlign: 'center',
              paddingHorizontal: 32,
            }}>
              Behalte die ganze Woche im Blick.
            </Text>
          ),
        },
        {
          backgroundColor,
          image: <Ionicons name="restaurant-outline" size={100} color={Colors[theme].accent2} />,
          title: (
            <Text style={{
              color: Colors[theme].accent2,
              fontSize: 24,
              fontWeight: 'bold',
              paddingHorizontal: 16,
              textAlign: 'center',
            }}>
              Heute in der Mensa
            </Text>
          ),
          subtitle: (
            <Text style={{
              color: textColor,
              fontSize: 16,
              textAlign: 'center',
              paddingHorizontal: 32,
            }}>
              Was steht heute auf dem Teller?
            </Text>
          ),
        },
        {
          backgroundColor,
          image: <Ionicons name="heart-outline" size={100} color="red" />,
          title: (
            <Text style={{
              color: 'red',
              fontSize: 24,
              fontWeight: 'bold',
              paddingHorizontal: 16,
              textAlign: 'center',
            }}>
              Favoriten
            </Text>
          ),
          subtitle: (
            <Text style={{
              color: textColor,
              fontSize: 16,
              textAlign: 'center',
              paddingHorizontal: 32,
            }}>
              Speichere deine Lieblingsgerichte mit einem Tipp.
            </Text>
          ),
        },
        {
          backgroundColor,
          image: <Ionicons name="heart" size={100} color={Colors[theme].accent3} />,
          title: (
            <Text style={{
              color: Colors[theme].accent3,
              fontSize: 24,
              fontWeight: 'bold',
              paddingHorizontal: 16,
              textAlign: 'center',
            }}>
              Essens-Tinder
            </Text>
          ),
          subtitle: (
            <Text style={{
              color: textColor,
              fontSize: 16,
              textAlign: 'center',
              paddingHorizontal: 32,
            }}>
              Wische, like & entdecke neue Favoriten.
            </Text>
          ),
        },
        {
          backgroundColor,
          image: <Ionicons name="person-circle" size={100} color={textColor} />,
          title: (
            <Text style={{
              color: textColor,
              fontSize: 24,
              fontWeight: 'bold',
              paddingHorizontal: 16,
              textAlign: 'center',
            }}>
              Dein Profil
            </Text>
          ),
          subtitle: (
            <Text style={{
              color: textColor,
              fontSize: 16,
              textAlign: 'center',
              paddingHorizontal: 32,
            }}>
              Verwalte deine Bewertungen und Einstellungen hier.{"\n\n"}Du bist bereit – entdecke deine Mensa! 🍽️
            </Text>
          ),
        },
      ]}
    />
  );
}
