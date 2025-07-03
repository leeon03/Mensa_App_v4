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

type KeyboardTypeOption =
  | 'default'
  | 'numeric'
  | 'email-address'
  | 'ascii-capable'
  | 'numbers-and-punctuation'
  | 'url'
  | 'number-pad'
  | 'phone-pad'
  | 'name-phone-pad'
  | 'decimal-pad'
  | 'twitter'
  | 'web-search'
  | 'visible-password';

export default function AdminNeuesGericht() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const [name, setName] = useState('');
  const [anzeigename, setAnzeigename] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [preis, setPreis] = useState('');
  const [tags, setTags] = useState('');
  const [bildUrl, setBildUrl] = useState('');
  const [zutaten, setZutaten] = useState('');
  const [naehrwerteKcal, setNaehrwerteKcal] = useState('');
  const [naehrwerteFett, setNaehrwerteFett] = useState('');
  const [naehrwerteEiweiss, setNaehrwerteEiweiss] = useState('');
  const [naehrwerteKohlenhydrate, setNaehrwerteKohlenhydrate] = useState('');
  const [metaGeneriert, setMetaGeneriert] = useState(false);

  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleSpeichern = async () => {
    if (!name || !anzeigename || !preis) {
      Alert.alert('Fehler', 'Name, Anzeigename und Preis sind Pflichtfelder.');
      return;
    }

    const { error } = await supabase.from('gerichte').insert({
      name,
      anzeigename,
      beschreibung,
      kategorie,
      preis: parseFloat(preis),
      tags: tags.split(',').map((t) => t.trim()),
      bild_url: bildUrl,
      zutaten,
      naehrwerte_kcal: parseFloat(naehrwerteKcal) || null,
      naehrwerte_fett: parseFloat(naehrwerteFett) || null,
      naehrwerte_eiweiss: parseFloat(naehrwerteEiweiss) || null,
      naehrwerte_kohlenhydrate: parseFloat(naehrwerteKohlenhydrate) || null,
      datum: new Date().toISOString().split('T')[0],
      meta_generiert: metaGeneriert,
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

        {[
          { label: 'Name *', description: 'Der Name des Gerichts.', value: name, setValue: setName },
          {
            label: 'Anzeigename *',
            description: 'Der Anzeigename des Gerichts.',
            value: anzeigename,
            setValue: setAnzeigename,
          },
          {
            label: 'Beschreibung',
            description: 'Eine kurze Beschreibung des Gerichts.',
            value: beschreibung,
            setValue: setBeschreibung,
          },
          {
            label: 'Kategorie',
            description: 'Die Kategorie des Gerichts (z. B. Hauptgericht, Dessert).',
            value: kategorie,
            setValue: setKategorie,
          },
          {
            label: 'Preis *',
            description: 'Der Preis des Gerichts (z. B. 4.50).',
            value: preis,
            setValue: setPreis,
            keyboardType: 'decimal-pad' as KeyboardTypeOption,
          },
          {
            label: 'Tags',
            description: 'Tags für das Gericht (z. B. vegan, scharf).',
            value: tags,
            setValue: setTags,
          },
          {
            label: 'Bild-URL',
            description: 'Die URL für das Bild des Gerichts.',
            value: bildUrl,
            setValue: setBildUrl,
          },
          {
            label: 'Zutaten',
            description: 'Die Zutaten des Gerichts.',
            value: zutaten,
            setValue: setZutaten,
          },
          {
            label: 'Nährwerte (kcal)',
            description: 'Die Kalorien des Gerichts.',
            value: naehrwerteKcal,
            setValue: setNaehrwerteKcal,
            keyboardType: 'decimal-pad' as KeyboardTypeOption,
          },
          {
            label: 'Nährwerte (Fett)',
            description: 'Der Fettgehalt des Gerichts.',
            value: naehrwerteFett,
            setValue: setNaehrwerteFett,
            keyboardType: 'decimal-pad' as KeyboardTypeOption,
          },
          {
            label: 'Nährwerte (Eiweiß)',
            description: 'Der Eiweißgehalt des Gerichts.',
            value: naehrwerteEiweiss,
            setValue: setNaehrwerteEiweiss,
            keyboardType: 'decimal-pad' as KeyboardTypeOption,
          },
          {
            label: 'Nährwerte (Kohlenhydrate)',
            description: 'Der Kohlenhydratgehalt des Gerichts.',
            value: naehrwerteKohlenhydrate,
            setValue: setNaehrwerteKohlenhydrate,
            keyboardType: 'decimal-pad' as KeyboardTypeOption,
          },
        ].map(
          ({
            label,
            description,
            value,
            setValue,
            keyboardType,
          }: {
            label: string;
            description: string;
            value: string;
            setValue: (text: string) => void;
            keyboardType?: KeyboardTypeOption;
          }) => (
            <View key={label} style={styles.section}>
              <TouchableOpacity
                onPress={() => toggleSection(label)}
                style={[styles.sectionHeader, { backgroundColor: themeColor.card }]}
              >
                <Text style={[styles.sectionTitle, { color: themeColor.text }]}>{label}</Text>
                <Ionicons
                  name={expandedSections.includes(label) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={themeColor.text}
                />
              </TouchableOpacity>
              {expandedSections.includes(label) && (
                <View style={styles.sectionContent}>
                  <Text style={[styles.sectionDescription, { color: themeColor.text }]}>
                    {description}
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={setValue}
                    placeholder={label}
                    keyboardType={keyboardType ?? 'default'}
                    style={[
                      styles.input,
                      { color: themeColor.text, borderColor: themeColor.border },
                    ]}
                  />
                </View>
              )}
            </View>
          )
        )}

        <View style={styles.checkboxContainer}>
          <Text style={[styles.checkboxLabel, { color: themeColor.text }]}>Meta generiert</Text>
          <TouchableOpacity
            style={[
              styles.checkbox,
              { backgroundColor: metaGeneriert ? themeColor.accent1 : '#f6f6f6' },
            ]}
            onPress={() => setMetaGeneriert((prev) => !prev)}
          >
            <Ionicons
              name={metaGeneriert ? 'checkmark' : 'close'}
              size={20}
              color={metaGeneriert ? '#fff' : themeColor.text}
            />
          </TouchableOpacity>
        </View>

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
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    marginTop: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f6f6f6',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
