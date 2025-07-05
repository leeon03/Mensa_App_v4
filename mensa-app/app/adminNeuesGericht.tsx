import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';
import * as ImagePicker from 'expo-image-picker';

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

  const verfügbareTags = [
    'Vegan',
    'Vegetarisch',
    'Leicht',
    'Glutenfrei',
    'Scharf',
    'Fleischhaltig',
    'Fischhaltig',
    'Beliebt',
    'Favorit',
    'Erinnerung',
  ];

  const [name, setName] = useState('');
  const [anzeigename, setAnzeigename] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [preis, setPreis] = useState('');
  const [zutaten, setZutaten] = useState('');
  const [naehrwerteKcal, setNaehrwerteKcal] = useState('');
  const [naehrwerteFett, setNaehrwerteFett] = useState('');
  const [naehrwerteEiweiss, setNaehrwerteEiweiss] = useState('');
  const [naehrwerteKohlenhydrate, setNaehrwerteKohlenhydrate] = useState('');
  const [metaGeneriert, setMetaGeneriert] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [bildBase64, setBildBase64] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleSelectImage = async (source: 'camera' | 'gallery') => {
    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });

    if (pickerResult.canceled) return;

    const base64 = pickerResult.assets?.[0]?.base64;
    if (!base64) {
      Alert.alert('Fehler', 'Bild konnte nicht geladen werden.');
      return;
    }

    const base64DataUrl = `data:image/jpeg;base64,${base64}`;
    setBildBase64(base64DataUrl);
  };

  const openImageOptions = () => {
    Alert.alert('Bild auswählen', 'Wähle eine Option:', [
      { text: 'Kamera', onPress: () => handleSelectImage('camera') },
      { text: 'Galerie', onPress: () => handleSelectImage('gallery') },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };

  const handleSpeichern = async () => {
    const fehlendeFelder: string[] = [];
  
    if (!name.trim()) fehlendeFelder.push('Name');
    if (!anzeigename.trim()) fehlendeFelder.push('Anzeigename');
    if (!preis.trim()) fehlendeFelder.push('Preis');
    if (!kategorie.trim()) fehlendeFelder.push('Kategorie');
    if (!bildBase64) fehlendeFelder.push('Bild');
    if (!tags || tags.length === 0) fehlendeFelder.push('Tags');
  
    if (fehlendeFelder.length > 0) {
      Alert.alert(
        'Fehlende Angaben',
        `Bitte fülle folgende Felder aus:\n\n- ${fehlendeFelder.join('\n- ')}`
      );
      return;
    }

    const { error } = await supabase.from('gerichte').insert({
  name,
  anzeigename,
  beschreibung: beschreibung || null,
  kategorie,
  preis: parseFloat(preis),
  tags: Array.isArray(tags) ? tags : [],
  bild_url: bildBase64 || null,
  zutaten:
    zutaten.trim() === ''
      ? []
      : zutaten
          .split(',')
          .map((z) => z.trim())
          .filter((z) => z.length > 0),
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
        <Text style={[styles.title, { color: '#d9534f' }]}>NEUES GERICHT</Text>


        {/* Bildauswahl */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <TouchableOpacity onPress={openImageOptions}>
            {loadingImage ? (
              <ActivityIndicator size="large" color={themeColor.text} />
            ) : bildBase64 ? (
              <Image
                source={{ uri: bildBase64 }}
                style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 8 }}
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: '#ccc',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name="image-outline" size={40} color="#fff" />
              </View>
            )}
            <Text style={{ color: themeColor.text, textAlign: 'center' }}>Bild wählen / ändern</Text>
          </TouchableOpacity>
        </View>

        {/* Tags Auswahl */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: themeColor.text, marginBottom: 8 }]}>
            Tags auswählen
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {verfügbareTags.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() =>
                    setTags((prev) =>
                      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                    )
                  }
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: selected ? '#e57373' : '#eee',
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: selected ? '#fff' : '#333' }}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Eingabefelder */}
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
            description: 'Die Kategorie des Gerichts.',
            value: kategorie,
            setValue: setKategorie,
          },
          {
            label: 'Preis *',
            description: 'Der Preis des Gerichts.',
            value: preis,
            setValue: setPreis,
            keyboardType: 'decimal-pad' as KeyboardTypeOption,
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
