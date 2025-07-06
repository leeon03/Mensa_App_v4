import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../constants/supabase';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import UmfrageVorschau from '../components/umfrage/umfrageVorschau';

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
  const [userId, setUserId] = useState<string | null>(null);

  const [umfrageVisible, setUmfrageVisible] = useState(false);
  const [umfrageFrage, setUmfrageFrage] = useState('');
  const [umfrageTyp, setUmfrageTyp] = useState<'freitext' | 'einzelauswahl' | 'mehrfachauswahl' | 'ranking'>('einzelauswahl');
  const [umfrageAntworten, setUmfrageAntworten] = useState<string[]>([]);
  const [umfrageId, setUmfrageId] = useState<string | null>(null);

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

      setUserId(user.id);

      // Onboarding prüfen
      const { data: onboardingData } = await supabase
        .from('intro_flags')
        .select('onboarding_seen')
        .eq('user_id', user.id)
        .single();

      if (!onboardingData?.onboarding_seen) {
        router.replace('/onboardingscreen');
        return;
      }

      // Rolle prüfen
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(userData?.role === 'admin');

      // Alle aktiven Umfragen laden
      const { data: umfragenData, error } = await supabase
        .from('umfragen')
        .select('id, frage, typ, antwortoptionen, sichtbar_fuer')
        .eq('aktiv', true)
        .order('created_at', { ascending: true });

      if (error || !umfragenData) {
        console.error('Fehler beim Laden der Umfragen:', error);
        setLoading(false);
        return;
      }

      // Bisherige Antworten dieses Users laden
      const { data: antwortenData } = await supabase
        .from('umfrage_antworten')
        .select('umfrage_id')
        .eq('user_id', user.id);

      const beantworteteIds = new Set(antwortenData?.map((a) => a.umfrage_id));

      // Ggf. zugewiesene Umfragen laden (wenn sichtbar_fuer = ausgewählte)
      const { data: userZuordnung } = await supabase
        .from('user_umfragen')
        .select('umfrage_id')
        .eq('user_id', user.id);

      const zugewieseneIds = new Set(userZuordnung?.map((z) => z.umfrage_id));

      // Filter: Sichtbare & unbeantwortete Umfragen
      const sichtbareUmfragen = umfragenData.filter((umfrage) => {
        const sichtbar =
          umfrage.sichtbar_fuer === 'alle' || zugewieseneIds.has(umfrage.id);
        const unbeantwortet = !beantworteteIds.has(umfrage.id);
        return sichtbar && unbeantwortet;
      });

      if (sichtbareUmfragen.length > 0) {
        const umfrage = sichtbareUmfragen[0];
        setUmfrageId(umfrage.id);
        setUmfrageFrage(umfrage.frage);
        setUmfrageTyp(umfrage.typ);
        setUmfrageAntworten(umfrage.antwortoptionen || []);
        setUmfrageVisible(true);
      }

      setLoading(false);
    };

    checkUserStatus();
  }, []);

  const handleUmfrageAbschicken = async (antwort: any) => {
    if (!userId || !umfrageId || !umfrageTyp) return;

    const { error: insertError } = await supabase
      .from('umfrage_antworten')
      .insert([
        {
          user_id: userId,
          umfrage_id: umfrageId,
          antwort_typ: umfrageTyp,
          antwort,
        },
      ]);

    if (insertError) {
      Alert.alert('Fehler beim Speichern der Antwort', insertError.message);
      return;
    }

    let flatRows: { option: string; rang?: number | null }[] = [];

    if (umfrageTyp === 'einzelauswahl') {
      flatRows = [{ option: antwort }];
    } else if (umfrageTyp === 'mehrfachauswahl') {
      flatRows = antwort.map((opt: string) => ({ option: opt }));
    } else if (umfrageTyp === 'ranking') {
      flatRows = antwort.map((opt: string, i: number) => ({
        option: opt,
        rang: i + 1,
      }));
    }

    if (flatRows.length > 0) {
      const flatInsert = flatRows.map((row) => ({
        user_id: userId,
        umfrage_id: umfrageId,
        option: row.option,
        rang: row.rang ?? null,
      }));

      const { error: flatError } = await supabase
        .from('umfrage_antwortoptionen_flat')
        .insert(flatInsert);

      if (flatError) {
        Alert.alert('Fehler beim Einfügen der Antwortoptionen', flatError.message);
        return;
      }
    }

    setUmfrageVisible(false);
  };

  if (loading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <UmfrageVorschau
        visible={umfrageVisible}
        frage={umfrageFrage}
        typ={umfrageTyp}
        antworten={umfrageAntworten}
        onClose={() => setUmfrageVisible(false)}
        interaktiv={true}
        onSubmit={handleUmfrageAbschicken}
      />

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
            onPress={() => router.push('/adminDashboard')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, icon, onPress, color }: any) {
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

function AnimatedIcon({ name, onPress, color }: any) {
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
