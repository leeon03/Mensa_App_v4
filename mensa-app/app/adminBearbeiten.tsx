import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';

export default function AdminBearbeiten() {
  const { id } = useLocalSearchParams(); // kommt aus router.push({ params: { id } })
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const [gericht, setGericht] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [anzeigename, setAnzeigename] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [preis, setPreis] = useState('');
  const [tags, setTags] = useState('');
  const [bildUrl, setBildUrl] = useState('');

  useEffect(() => {
    if (typeof id !== 'string') return;

    const loadGericht = async () => {
      const { data, error } = await supabase
        .from('gerichte')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error || !data) {
        Alert.alert('Fehler', 'Gericht nicht gefunden.');
        router.replace('/adminGerichte');
        return;
      }

      setGericht(data);
      setAnzeigename(data.anzeigename || '');
      setBeschreibung(data.beschreibung || '');
      setKategorie(data.kategorie || '');
      setPreis(String(data.preis || ''));
      setTags((data.tags || []).join(', '));
      setBildUrl(data.bild_url || '');
      setLoading(false);
    };

    loadGericht();
  }, [id]);

  const handleSpeichern = async () => {
    if (!anzeigename || !preis) {
      Alert.alert('Fehler', 'Anzeigename und Preis sind Pflichtfelder.');
      return;
    }

    const { error } = await supabase
      .from('gerichte')
      .update({
        anzeigename,
        beschreibung,
        kategorie,
        preis: parseFloat(preis),
        tags: tags.split(',').map((t) => t.trim()),
        bild_url: bildUrl,
      })
      .eq('id', gericht.id);

    if (error) {
      Alert.alert('Fehler beim Speichern', error.message);
    } else {
      Alert.alert('Änderungen gespeichert');
      router.replace('/adminGerichte');
    }
  };

  if (loading) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColor.background }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: themeColor.text }]}>
          Gericht bearbeiten
        </Text>

        <TextInput
          placeholder="Anzeigename *"
          value={anzeigename}
          onChangeText={setAnzeigename}
          style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
        />
        <TextInput
          placeholder="Beschreibung"
          value={beschreibung}
          onChangeText={setBeschreibung}
          style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
          multiline
        />
        <TextInput
          placeholder="Kategorie"
          value={kategorie}
          onChangeText={setKategorie}
          style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
        />
        <TextInput
          placeholder="Preis *"
          value={preis}
          onChangeText={setPreis}
          keyboardType="decimal-pad"
          style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
        />
        <TextInput
          placeholder="Tags (z. B. vegan,scharf)"
          value={tags}
          onChangeText={setTags}
          style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
        />
        <TextInput
          placeholder="Bild-URL"
          value={bildUrl}
          onChangeText={setBildUrl}
          style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColor.accent1 }]}
          onPress={handleSpeichern}
        >
          <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Änderungen speichern</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f6f6f6',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
