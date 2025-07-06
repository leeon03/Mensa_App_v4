import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';


export default function AdminBearbeiten() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

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

  const [gericht, setGericht] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [modalTags, setModalTags] = useState<string[]>([]);

  const [anzeigename, setAnzeigename] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [preis, setPreis] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [bildUrl, setBildUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);


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
      setTags(data.tags || []);
      setBildUrl(data.bild_url || '');
      setLoading(false);
    };

    loadGericht();
  }, [id]);

  const openEditModal = (field: string, value: string | string[]) => {
    setActiveField(field);
    if (field === 'tags') {
      setModalTags(Array.isArray(value) ? value : []);
    } else {
      setFieldValue(String(value));
    }
    setModalVisible(true);
  };

  const handleSelectImage = async (source: 'camera' | 'gallery') => {
    setLoadingImage(true);
  
    const pickerResult = source === 'camera'
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
  
    if (pickerResult.canceled) {
      setLoadingImage(false);
      return;
    }
  
    const base64 = pickerResult.assets?.[0]?.base64;
    if (!base64) {
      setLoadingImage(false);
      Alert.alert('Fehler', 'Bild konnte nicht geladen werden.');
      return;
    }
  
    setBildUrl(`data:image/jpeg;base64,${base64}`);
    setLoadingImage(false);
  };
  

  const saveEditedField = () => {
    switch (activeField) {
      case 'anzeigename':
        setAnzeigename(fieldValue);
        break;
      case 'beschreibung':
        setBeschreibung(fieldValue);
        break;
      case 'kategorie':
        setKategorie(fieldValue);
        break;
      case 'preis':
        setPreis(fieldValue);
        break;
      case 'tags':
        setTags(modalTags);
        break;
    }
    setModalVisible(false);
  };

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
      tags,
      bild_url: bildUrl, // <-- hier neu
    })

      .eq('id', gericht.id);

    if (error) {
      Alert.alert('Fehler beim Speichern', error.message);
    } else {
      Alert.alert('Änderungen gespeichert');
      // 🧠 Stack-Reset vermeiden: Doppelt ersetzen, um keine Duplikate beim Zurückswipen zu erzeugen
      router.replace('/adminGerichte');
      setTimeout(() => router.replace('/adminGerichte'), 10);
    }
  };

  const openImageOptions = () => {
    Alert.alert('Bild ändern', 'Wähle eine Option:', [
      { text: 'Kamera', onPress: () => handleSelectImage('camera') },
      { text: 'Galerie', onPress: () => handleSelectImage('gallery') },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };
  

  const renderItem = (label: string, value: string | string[], field: string, editable = true) => (
    <View style={styles.row}>
      <Text style={[styles.label, { color: themeColor.icon }]}>{label}</Text>
      <View style={styles.editableRow}>
        <Text style={[styles.value, { color: themeColor.text }]}>
          {Array.isArray(value) ? value.join(', ') : value}
        </Text>
        {editable && (
          <TouchableOpacity onPress={() => openEditModal(field, value)}>
            <Ionicons name="pencil-outline" size={18} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.title, { color: '#d9534f' }]}>GERICHT BEARBEITEN</Text>

        <TouchableOpacity onPress={openImageOptions} style={{ alignItems: 'center', marginBottom: 24 }}>
          {loadingImage ? (
            <ActivityIndicator size="large" color={themeColor.text} />
          ) : bildUrl ? (
            <Image source={{ uri: bildUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="image-outline" size={40} color="#fff" />
            </View>
          )}
          <Text style={{ color: themeColor.text, marginTop: 8 }}>Bild ändern</Text>
        </TouchableOpacity>


        {renderItem('Anzeigename', anzeigename, 'anzeigename')}
        {renderItem('Beschreibung', beschreibung, 'beschreibung')}
        {renderItem('Kategorie', kategorie, 'kategorie')}
        {renderItem('Preis (€)', preis, 'preis')}
        {renderItem('Tags', tags, 'tags')}

        <TouchableOpacity style={styles.saveButton} onPress={handleSpeichern}>
          <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveText}>Änderungen speichern</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal zum Bearbeiten */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: themeColor.card }]}>
            <Text style={[styles.modalTitle, { color: themeColor.text }]}>
              {activeField === 'tags' ? 'Tags bearbeiten' : `${activeField} bearbeiten`}
            </Text>

            {activeField === 'tags' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {verfügbareTags.map((tag) => {
                  const selected = modalTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() =>
                        setModalTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        )
                      }
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        backgroundColor: selected ? '#d9534f' : '#eee',
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
            ) : (
              <TextInput
                style={[styles.input, { color: themeColor.text, borderColor: themeColor.icon }]}
                value={fieldValue}
                onChangeText={setFieldValue}
                multiline={activeField === 'beschreibung'}
                keyboardType={activeField === 'preis' ? 'decimal-pad' : 'default'}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#d9534f' }}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEditedField}>
                <Text style={{ color: '#d9534f' }}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#d9534f',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 24,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
