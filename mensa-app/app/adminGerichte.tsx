import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text, // ✅ WICHTIG: Text wurde korrekt importiert
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import Card from '../components/ui/card';

export default function AdminGerichte() {
  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const loadGerichte = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gerichte')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Fehler', 'Gerichte konnten nicht geladen werden.');
      console.error(error);
    } else {
      setGerichte(data || []);
    }
    setLoading(false);
  };

  const deleteGericht = async (id: number) => {
    Alert.alert(
      'Löschen bestätigen',
      'Willst du dieses Gericht wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('gerichte').delete().eq('id', id);
            if (error) {
              Alert.alert('Fehler beim Löschen', error.message);
            } else {
              loadGerichte();
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadGerichte();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColor.background }]}>
      {gerichte.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: themeColor.text }}>Keine Gerichte gefunden.</Text>
        </View>
      ) : (
        gerichte.map((gericht) => (
          <Animatable.View
            key={gericht.id}
            animation="fadeInUp"
            delay={gericht.id * 100}
            style={{ marginBottom: 16 }}
          >
            <TouchableOpacity
              onLongPress={() => deleteGericht(gericht.id)}
              onPress={() =>
                router.push({
                  pathname: '/adminBearbeiten',
                  params: { id: gericht.id.toString() },
                })
              }
            >
              <Card
                name={gericht.name}
                anzeigename={gericht.anzeigename}
                beschreibung={gericht.beschreibung}
                bild_url={gericht.bild_url}
                kategorie={gericht.kategorie || ''}
                bewertungen={[]} // Admin zeigt keine Bewertungen
                tags={gericht.tags}
                preis={parseFloat(gericht.preis)}
                isFavorite={false}
                isAlert={false}
                onFavoritePress={() => {}}
                onAlertPress={() => {}}
              />
            </TouchableOpacity>
          </Animatable.View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
