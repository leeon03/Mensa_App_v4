import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminBearbeiten() {
  const { id } = useLocalSearchParams();
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
        .eq('id', id)
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
        beschreibung,
        kategorie,
        preis: parseFloat(preis),
        tags: tags.split(',').map((t) => t.trim()),
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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: themeColor.background }}
          contentContainerStyle={styles.container}
        >
          <Text style={[styles.title, { color: themeColor.accent2 }]}>Gericht bearbeiten</Text>

          {bildUrl ? (
            <Image
              source={{ uri: bildUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}

          <View style={[styles.card, { backgroundColor: themeColor.card }]}>
            <Text style={[styles.label, { color: themeColor.text }]}>Anzeigename</Text>
            <Text style={[styles.readonlyText, { color: themeColor.text }]}>{anzeigename}</Text>

            <Text style={[styles.label, { color: themeColor.text }]}>Beschreibung</Text>
            <TextInput
              value={beschreibung}
              onChangeText={setBeschreibung}
              style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
              multiline
            />

            <Text style={[styles.label, { color: themeColor.text }]}>Kategorie</Text>
            <TextInput
              value={kategorie}
              onChangeText={setKategorie}
              style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
            />

            <Text style={[styles.label, { color: themeColor.text }]}>Preis *</Text>
            <TextInput
              value={preis}
              onChangeText={setPreis}
              keyboardType="decimal-pad"
              style={[styles.input, { borderColor: themeColor.border, color: themeColor.text }]}
            />

            <Text style={[styles.label, { color: themeColor.text }]}>Tags (z. B. vegan, scharf)</Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  readonlyText: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
