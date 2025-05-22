import React from 'react';
import { Text, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import Onboarding from 'react-native-onboarding-swiper/src/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function OnboardingScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();

  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;

  const logo = theme === 'dark'
    ? require('../assets/AppLogoDarkmode.png')
    : require('../assets/AppLogo.png');

  const handleDone = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    router.replace('/startseite');
  };

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
