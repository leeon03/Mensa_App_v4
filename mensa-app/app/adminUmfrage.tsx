import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';

import UmfrageVorschau from '../components/umfrage/umfrageVorschau';
import FreitextEditor from '../components/umfrage/freitextEditor';
import AuswahlEditor from '../components/umfrage/auswahlEditor';
import RankingEditor from '../components/umfrage/rankingEditor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Fragetyp = 'freitext' | 'einzelauswahl' | 'mehrfachauswahl' | 'ranking';

interface Umfrage {
  id: number;
  frage: string;
  typ: Fragetyp;
  antworten: string[];
}

export default function AdminUmfrageScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [frage, setFrage] = useState('');
  const [antworten, setAntworten] = useState<string[]>([]);
  const [antwortInput, setAntwortInput] = useState('');
  const [typ, setTyp] = useState<Fragetyp>('freitext');
  const [gerichte, setGerichte] = useState<string[]>([]);
  const [ausgewählteGerichte, setAusgewählteGerichte] = useState<string[]>([]);
  const [umfragen, setUmfragen] = useState<Umfrage[]>([]);

  const [vorschauVisible, setVorschauVisible] = useState(false);
  const [vorschauUmfrage, setVorschauUmfrage] = useState<Umfrage | null>(null);

  useEffect(() => {
    async function fetchGerichte() {
      const { data, error } = await supabase.from('gerichte').select('name');
      if (!error && data) {
        setGerichte(data.map((g: any) => g.name));
      }
    }
    fetchGerichte();
  }, []);

  const handleCreateUmfrage = () => {
    if (!frage.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Frage ein.');
      return;
    }

    const neueAntworten =
      typ === 'freitext' ? antworten : ausgewählteGerichte;

    if (neueAntworten.length === 0) {
      Alert.alert('Fehler', 'Bitte füge mindestens eine Antwortoption hinzu.');
      return;
    }

    const neueUmfrage: Umfrage = {
      id: Date.now(),
      frage,
      typ,
      antworten: neueAntworten,
    };

    setUmfragen((prev) => [...prev, neueUmfrage]);
    setFrage('');
    setAntworten([]);
    setAntwortInput('');
    setAusgewählteGerichte([]);
    setModalVisible(false);
  };

  const handleRestart = (umfrage: Umfrage) => {
    Alert.alert('Umfrage neu gestartet', umfrage.frage);
  };

  const handlePreview = (umfrage: Umfrage) => {
    setVorschauUmfrage(umfrage);
    setVorschauVisible(true);
  };

  const handleDelete = (id: number) => {
    setUmfragen((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Umfragen verwalten</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={32} color="#d9534f" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={umfragen}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.umfrageCard}>
            <Text style={styles.frage}>{item.frage}</Text>
            {item.antworten.map((antwort, idx) => (
              <Text key={`${antwort}-${idx}`} style={styles.antwort}>• {antwort}</Text>
            ))}
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handlePreview(item)}>
                <Ionicons name="eye-outline" size={22} color="#444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRestart(item)}>
                <Ionicons name="refresh-outline" size={22} color="#444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Noch keine Umfragen.</Text>}
      />

      <UmfrageVorschau
        visible={vorschauVisible}
        onClose={() => setVorschauVisible(false)}
        frage={vorschauUmfrage?.frage || ''}
        typ={vorschauUmfrage?.typ || 'freitext'}
        antworten={vorschauUmfrage?.antworten || []}
      />

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={100}
          >
            <View style={styles.modalWrapper}>
              <Text style={styles.modalTitle}>Neue Umfrage erstellen</Text>

              <Text style={styles.label}>Fragetyp:</Text>
              <View style={styles.typeSelector}>
                {(['freitext', 'einzelauswahl', 'mehrfachauswahl', 'ranking'] as Fragetyp[]).map((t) => (
                  <TouchableOpacity key={t} onPress={() => setTyp(t)}>
                    <Text style={[styles.typeButton, typ === t && styles.selectedTypeButton]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Frage eingeben..."
                value={frage}
                onChangeText={setFrage}
              />

              {typ === 'ranking' && (
                <View style={styles.rankingWrapper}>
                  <RankingEditor
                    gerichte={ausgewählteGerichte}
                    setGerichte={setAusgewählteGerichte}
                  />
                </View>
              )}

              {typ === 'freitext' && (
                <FreitextEditor
                  antworten={antworten}
                  setAntworten={setAntworten}
                  antwortInput={antwortInput}
                  setAntwortInput={setAntwortInput}
                />
              )}

              {(typ === 'einzelauswahl' || typ === 'mehrfachauswahl' || typ === 'ranking') && (
                <>
                  <Text style={styles.label}>Antwortoptionen:</Text>
                  <AuswahlEditor
                    typ={typ === 'ranking' ? 'mehrfachauswahl' : typ}
                    gerichte={gerichte}
                    ausgewählteGerichte={ausgewählteGerichte}
                    setAusgewählteGerichte={setAusgewählteGerichte}
                  />
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleCreateUmfrage} style={styles.submitButton}>
                  <Text style={styles.submitText}>Erstellen</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{ color: 'gray', marginTop: 12, textAlign: 'center' }}>Abbrechen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#d9534f' },
  umfrageCard: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  frage: { fontWeight: 'bold', fontSize: 18 },
  antwort: { marginTop: 4 },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 12,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#666' },
  modalWrapper: {
    padding: 20,
    flexGrow: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 16, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  modalButtons: { marginTop: 24 },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginTop: 6,
    color: '#333',
  },
  selectedTypeButton: {
    backgroundColor: '#d9534f',
    color: '#fff',
    borderColor: '#d9534f',
  },
  submitButton: {
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  rankingWrapper: {
    marginTop: 12,
    marginBottom: 12,
  },
});
