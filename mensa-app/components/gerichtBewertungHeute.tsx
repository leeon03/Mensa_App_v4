import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import KommentarBox from './KommentarBox';
import ChatBubble from './ChatBubble';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { supabase } from '../constants/supabase';

type Kommentar = {
  id: number;
  user: string;
  text: string;
  stars: number;
  own?: boolean;
  avatarUri?: string;
  timestamp?: string;
};

type Props = {
  gerichtId: number; // ✅ geändert von string zu number
  kommentare: Kommentar[];
  userId: string | null;
  onUpdate: () => void;
};

export default function GerichtBewertungHeute({
  gerichtId,
  kommentare,
  userId,
  onUpdate,
}: Props) {
  const scheme = useColorScheme() || 'light';
  const colors = Colors[scheme];

  const [localKommentare, setLocalKommentare] = useState<Kommentar[]>([]);

  const hatBereitsBewertet = useMemo(() => {
    return [...kommentare, ...localKommentare].some(k => k.own);
  }, [kommentare, localKommentare]);

  const alleKommentare = useMemo(() => {
    const kommentarKey = (k: Kommentar) => `${k.text.trim()}__${k.stars}`;
    const existingKeys = new Set(kommentare.map(kom => kommentarKey(kom)));

    const neueKommentare = localKommentare.filter(
      kom => !existingKeys.has(kommentarKey(kom))
    );

    return [...neueKommentare, ...kommentare].slice(0, 15);
  }, [localKommentare, kommentare]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKommentarSubmit = async (data: { text: string; stars: number }) => {
    const neuerKommentar: Kommentar = {
      id: Date.now(),
      user: 'Du',
      text: data.text,
      stars: data.stars,
      own: true,
      avatarUri: undefined,
      timestamp: getCurrentTime(),
    };

    setLocalKommentare(prev => [neuerKommentar, ...prev]);

    const { error } = await supabase.from('bewertungen').insert({
      gericht_id: gerichtId,
      user_id: userId,
      kommentar: data.text,
      stars: data.stars,
    });

    if (error) {
      console.error('Fehler beim Speichern des Kommentars:', error);
      Alert.alert('Fehler', 'Dein Kommentar konnte nicht gespeichert werden.');
    } else {
      onUpdate();
    }
  };

  return (
    <Animatable.View
      animation="fadeIn"
      duration={400}
      style={[styles.detailBox, { backgroundColor: colors.card, shadowColor: colors.text }]}
    >
      <Text style={[styles.detailTitle, { color: colors.text }]}>
        Deine Bewertung
      </Text>

      {hatBereitsBewertet ? (
        <Animatable.View
          animation="fadeInDown"
          duration={400}
          style={[styles.infoBox, { borderColor: colors.accent2 }]}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.accent1} style={{ marginRight: 6 }} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Du hast dieses Gericht bereits bewertet. Vielen Dank!
          </Text>
        </Animatable.View>
      ) : (
        <KommentarBox onSubmit={handleKommentarSubmit} disabled={hatBereitsBewertet} />
      )}

      <Text style={[styles.detailTitle, { color: colors.text }]}>Kommentare</Text>

      {alleKommentare.length === 0 ? (
        <Text style={{ color: colors.icon, marginBottom: 8 }}>Noch keine Kommentare</Text>
      ) : (
        alleKommentare.map((kommentar, index) => (
          <Animatable.View
            key={kommentar.id}
            animation={kommentar.own ? 'fadeInRight' : 'fadeInLeft'}
            duration={500}
            delay={index * 100}
          >
            <ChatBubble
              user={kommentar.user}
              text={kommentar.text}
              stars={kommentar.stars}
              own={kommentar.own}
              avatarUri={kommentar.avatarUri}
              timestamp={kommentar.timestamp ?? 'Gerade eben'}
            />
          </Animatable.View>
        ))
      )}
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  detailBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    gap: 14,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
});
