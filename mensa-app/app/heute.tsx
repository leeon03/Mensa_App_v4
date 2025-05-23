import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import RatingStars from '../components/RatingStars';
import KommentarBox from '../components/KommentarBox';
import ChatBubble from '../components/ChatBubble';
import * as Animatable from 'react-native-animatable';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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

  const [gerichte, setGerichte] = useState<Gericht[]>([
    {
      id: 1,
      name: 'Vegetarisches Curry',
      beschreibung: 'Mit Reis, Gemüse & Kokossoße',
      bewertung: 4,
      kommentare: [],
    },
    {
      id: 2,
      name: 'Spaghetti Bolognese',
      beschreibung: 'Mit Rindfleischsoße und Parmesan',
      bewertung: 3,
      kommentare: [],
    },
    {
      id: 3,
      name: 'Vegane Bowl',
      beschreibung: 'Mit Quinoa, Tofu und Edamame',
      bewertung: 5,
      kommentare: [],
    },
  ]);

  const [ausgewählt, setAusgewählt] = useState<number | null>(null);

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

  const themeColor = Colors[theme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Text style={[styles.title, { color: themeColor.accent2 }]}>Heute in der Mensa</Text>

      {gerichte.map((gericht) => {
        const isActive = ausgewählt === gericht.id;
        return (
          <View key={gericht.id} style={[styles.gerichtWrapper, isActive && styles.activeGericht]}>
            <TouchableOpacity onPress={() => setAusgewählt(isActive ? null : gericht.id)}>
              <View style={[styles.gerichtBox, { backgroundColor: themeColor.surface }]}>
                <Text style={[styles.gerichtName, { color: themeColor.text }]}>{gericht.name}</Text>
                <Text style={[styles.gerichtBeschreibung, { color: themeColor.text }]}>
                  {gericht.beschreibung}
                </Text>
                <RatingStars value={gericht.bewertung} />
              </View>
            </TouchableOpacity>

            {isActive && (
              <View style={[styles.detailBox, { backgroundColor: themeColor.surface }]}>
                <Text style={[styles.detailTitle, { color: themeColor.text }]}>
                  Deine Bewertung für {gericht.name}
                </Text>
                <KommentarBox onSubmit={(data) => handleKommentarSubmit(gericht.id, data)} />

                <Text style={[styles.detailTitle, { color: themeColor.text }]}>
                  Kommentare zu {gericht.name}
                </Text>
                {gericht.kommentare.length === 0 && (
                  <Text style={{ color: themeColor.icon, marginBottom: 8 }}>
                    Noch keine Kommentare
                  </Text>
                )}
                {gericht.kommentare.map((kommentar, index) => (
                  <Animatable.View
                    key={kommentar.id}
                    animation="fadeInDown"
                    duration={400}
                    delay={index * 80}
                  >
                    <ChatBubble
                      user={kommentar.user}
                      text={kommentar.text}
                      stars={kommentar.stars}
                      own={kommentar.own}
                    />
                  </Animatable.View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

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
});
