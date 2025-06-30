import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';

export default function AdminNeuesGericht() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const [anzeigename, setAnzeigename] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [preis, setPreis] = useState('');
  const [tags, setTags] = useState('');
  const [bildUrl, setBildUrl] = useState('');

  const handleSpeichern = async () => {
    if (!anzeigename || !preis) {
      Alert.alert('Fehler', 'Anzeigename und Preis sind Pflichtfelder.');
      return;
    }

    const { error } = await supabase.from('gerichte').insert({
      anzeigename,
      beschreibung,
      kategorie,
      preis: parseFloat(preis),
      tags: tags.split(',').map((t) => t.trim()), // Tags als Array
      bild_url: bildUrl,
      datum: new Date().toISOString().split('T')[0], // heutiges Datum
    });

    if (error) {
      Alert.alert('Fehler beim Speichern', error.message);
      console.error(error);
    } else {
      Alert.alert('Gericht hinzugefügt');
      router.replace('/adminGerichte');
    }
  };

  return (
    <ScrollView style={{ backgroundColor: themeColor.background, flex: 1 }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: themeColor.text }]}>Neues Gericht anlegen</Text>

        <TextInput
          placeholder="Anzeigename *"
          value={anzeigename}
          onChangeText={setAnzeigename}
          style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
        />
        <TextInput
          placeholder="Beschreibung"
          value={beschreibung}
          onChangeText={setBeschreibung}
          style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
          multiline
        />
        <TextInput
          placeholder="Kategorie"
          value={kategorie}
          onChangeText={setKategorie}
          style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
        />
        <TextInput
          placeholder="Preis (z. B. 4.50) *"
          value={preis}
          onChangeText={setPreis}
          keyboardType="decimal-pad"
          style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
        />
        <TextInput
          placeholder="Tags (z. B. vegan,scharf)"
          value={tags}
          onChangeText={setTags}
          style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
        />
        <TextInput
          placeholder="Bild-URL"
          value={bildUrl}
          onChangeText={setBildUrl}
          style={[styles.input, { color: themeColor.text, borderColor: themeColor.border }]}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColor.accent1 }]}
          onPress={handleSpeichern}
        >
          <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Gericht speichern</Text>
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

