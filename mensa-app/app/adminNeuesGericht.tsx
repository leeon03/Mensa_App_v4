import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminNeuesGericht() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const verfügbareTags = [
    'Vegan', 'Vegetarisch', 'Leicht', 'Glutenfrei', 'Scharf',
    'Fleischhaltig', 'Fischhaltig', 'Beliebt', 'Favorit', 'Erinnerung',
  ];

  const [formState, setFormState] = useState({
    name: '',
    anzeigename: '',
    beschreibung: '',
    kategorie: '',
    preis: '',
    zutaten: '',
    naehrwerteKcal: '',
    naehrwerteFett: '',
    naehrwerteEiweiss: '',
    naehrwerteKohlenhydrate: '',
  });

  const [metaGeneriert, setMetaGeneriert] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [bildBase64, setBildBase64] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [modalTags, setModalTags] = useState<string[]>([]);

  const openEditModal = (field: string, value: string | string[]) => {
    setActiveField(field);
    if (field === 'tags') {
      setModalTags(Array.isArray(value) ? value : []);
    } else {
      setFieldValue(String(value));
    }
    setModalVisible(true);
  };

  const saveEditedField = () => {
    if (activeField === 'tags') {
      setTags(modalTags);
    } else {
      setFormState((prev) => ({ ...prev, [activeField]: fieldValue }));
    }
    setModalVisible(false);
  };

  const handleSelectImage = async (source: 'camera' | 'gallery') => {
    const pickerResult = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true });

    if (pickerResult.canceled) return;

    const base64 = pickerResult.assets?.[0]?.base64;
    if (!base64) {
      Alert.alert('Fehler', 'Bild konnte nicht geladen werden.');
      return;
    }

    setBildBase64(`data:image/jpeg;base64,${base64}`);
  };

  const openImageOptions = () => {
    Alert.alert('Bild auswählen', 'Wähle eine Option:', [
      { text: 'Kamera', onPress: () => handleSelectImage('camera') },
      { text: 'Galerie', onPress: () => handleSelectImage('gallery') },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  };

  const handleSpeichern = async () => {
    const { name, anzeigename, preis, kategorie } = formState;
    const fehlendeFelder: string[] = [];

    if (!name.trim()) fehlendeFelder.push('Name');
    if (!anzeigename.trim()) fehlendeFelder.push('Anzeigename');
    if (!preis.trim()) fehlendeFelder.push('Preis');
    if (!kategorie.trim()) fehlendeFelder.push('Kategorie');
    if (!bildBase64) fehlendeFelder.push('Bild');
    if (!tags.length) fehlendeFelder.push('Tags');

    if (fehlendeFelder.length > 0) {
      Alert.alert('Fehlende Angaben', `Bitte fülle folgende Felder aus:\n\n- ${fehlendeFelder.join('\n- ')}`);
      return;
    }

    const { error } = await supabase.from('gerichte').insert({
      ...formState,
      preis: parseFloat(formState.preis),
      tags,
      bild_url: bildBase64,
      zutaten: formState.zutaten.split(',').map(z => z.trim()).filter(Boolean),
      naehrwerte_kcal: parseFloat(formState.naehrwerteKcal) || null,
      naehrwerte_fett: parseFloat(formState.naehrwerteFett) || null,
      naehrwerte_eiweiss: parseFloat(formState.naehrwerteEiweiss) || null,
      naehrwerte_kohlenhydrate: parseFloat(formState.naehrwerteKohlenhydrate) || null,
      datum: new Date().toISOString().split('T')[0],
      meta_generiert: metaGeneriert,
    });

    if (error) {
      Alert.alert('Fehler beim Speichern', error.message);
    } else {
      Alert.alert('Gericht hinzugefügt');
      router.replace('/adminGerichte');
    }
  };

  const renderItem = (label: string, key: string, editable = true) => (
    <View style={styles.row} key={key}>
      <Text style={[styles.label, { color: themeColor.icon }]}>{label}</Text>
      <View style={styles.editableRow}>
        <Text style={[styles.value, { color: themeColor.text }]}>
          {formState[key as keyof typeof formState]}
        </Text>
        {editable && (
          <TouchableOpacity onPress={() => openEditModal(key, formState[key as keyof typeof formState])}>
            <Ionicons name="pencil-outline" size={18} color={themeColor.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColor.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: '#d9534f' }]}>Neues Gericht</Text>

        {/* Bildauswahl */}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <TouchableOpacity onPress={openImageOptions}>
            {loadingImage ? (
              <ActivityIndicator size="large" color={themeColor.text} />
            ) : bildBase64 ? (
              <Image source={{ uri: bildBase64 }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#fff" />
              </View>
            )}
            <Text style={{ color: themeColor.text, textAlign: 'center' }}>Bild wählen / ändern</Text>
          </TouchableOpacity>
        </View>

        {/* Felder */}
        {renderItem('Name', 'name')}
        {renderItem('Anzeigename', 'anzeigename')}
        {renderItem('Beschreibung', 'beschreibung')}
        {renderItem('Kategorie', 'kategorie')}
        {renderItem('Preis (€)', 'preis')}
        {renderItem('Zutaten', 'zutaten')}
        {renderItem('Kcal', 'naehrwerteKcal')}
        {renderItem('Fett (g)', 'naehrwerteFett')}
        {renderItem('Eiweiß (g)', 'naehrwerteEiweiss')}
        {renderItem('Kohlenhydrate (g)', 'naehrwerteKohlenhydrate')}

        {/* Tags */}
        <View style={styles.row}>
          <Text style={[styles.label, { color: themeColor.icon }]}>Tags</Text>
          <View style={styles.editableRow}>
            <Text style={[styles.value, { color: themeColor.text }]}>{tags.join(', ')}</Text>
            <TouchableOpacity onPress={() => openEditModal('tags', tags)}>
              <Ionicons name="pencil-outline" size={18} color={themeColor.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta Checkbox */}
        <View style={styles.checkboxRow}>
          <Text style={[styles.label, { color: themeColor.icon }]}>Meta generiert</Text>
          <TouchableOpacity onPress={() => setMetaGeneriert((prev) => !prev)}>
            <Ionicons
              name={metaGeneriert ? 'checkbox-outline' : 'square-outline'}
              size={22}
              color={themeColor.text}
            />
          </TouchableOpacity>
        </View>

        {/* Speichern */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSpeichern}>
          <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveText}>Gericht speichern</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
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
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
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
