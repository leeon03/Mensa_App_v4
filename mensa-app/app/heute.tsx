import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import RatingStars from '../components/RatingStars';
import KommentarBox from '../components/KommentarBox';
import ChatBubble from '../components/ChatBubble';
import * as Animatable from 'react-native-animatable'; // ✅ NEU: Animationsimport

export default function HeuteScreen() {
  const theme = useColorScheme() || 'light';

  const gericht = {
    name: 'Vegetarisches Curry',
    beschreibung: 'Mit Reis, Gemüse & Kokossoße',
    bewertung: 4,
    kommentare: [
      { id: 1, user: 'Anna', text: 'Sehr lecker heute!', stars: 5 },
      { id: 2, user: 'Tom', text: 'War etwas zu scharf.', stars: 2 },
    ],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Text style={[styles.title, { color: Colors[theme].accent2 }]}>Heute in der Mensa</Text>

      <View style={[styles.gerichtBox, { backgroundColor: Colors[theme].surface }]}>
        <Text style={[styles.gerichtName, { color: Colors[theme].text }]}>{gericht.name}</Text>
        <Text style={[styles.gerichtBeschreibung, { color: Colors[theme].text }]}>{gericht.beschreibung}</Text>
        <RatingStars value={gericht.bewertung} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>🗣️ Deine Bewertung</Text>
        <KommentarBox onSubmit={(data) => console.log(data)} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>💬 Kommentare</Text>
        {gericht.kommentare.map((kommentar, index) => (
          <Animatable.View
            key={kommentar.id}
            animation="fadeInLeft"   // ✅ Slide-in von links
            duration={500}
            delay={index * 150}      // ✅ Gestaffelte Verzögerung pro Kommentar
          >
            <ChatBubble
              user={kommentar.user}
              text={kommentar.text}
              stars={kommentar.stars}
            />
          </Animatable.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  gerichtBox: {
    marginBottom: 28,
    padding: 16,
    borderRadius: 10,
  },
  gerichtName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  gerichtBeschreibung: {
    fontSize: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
});
