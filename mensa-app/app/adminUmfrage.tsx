// adminUmfrage.tsx
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

import UmfrageVorschau from '../components/umfrage/umfrageVorschau';
import AuswahlEditor from '../components/umfrage/auswahlEditor';
import RankingEditor from '../components/umfrage/rankingEditor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Fragetyp = 'einzelauswahl' | 'mehrfachauswahl' | 'ranking';

interface Umfrage {
  id: string;
  frage: string;
  typ: Fragetyp;
  antwortoptionen: string[];
}

export default function AdminUmfrageScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [frage, setFrage] = useState('');
  const [antworten, setAntworten] = useState<string[]>([]);
  const [typ, setTyp] = useState<Fragetyp>('einzelauswahl');
  const [gerichte, setGerichte] = useState<string[]>([]);
  const [ausgewählteGerichte, setAusgewählteGerichte] = useState<string[]>([]);
  const [umfragen, setUmfragen] = useState<Umfrage[]>([]);
  const [loading, setLoading] = useState(true);

  const [vorschauVisible, setVorschauVisible] = useState(false);
  const [vorschauUmfrage, setVorschauUmfrage] = useState<Umfrage | null>(null);

  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);

    const { data: gerichteData } = await supabase.from('gerichte').select('name');
    if (gerichteData) setGerichte(gerichteData.map((g: any) => g.name));

    const { data: umfragenData, error } = await supabase
      .from('umfragen')
      .select('id, frage, typ, antwortoptionen')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Fehler beim Laden der Umfragen');
      console.error(error);
    } else {
      setUmfragen(umfragenData);
    }

    setLoading(false);
  };

  const handleCreateUmfrage = async () => {
    if (!frage.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Frage ein.');
      return;
    }

    const neueAntworten = typ === 'ranking' ? antworten : ausgewählteGerichte;

    if (neueAntworten.length === 0) {
      Alert.alert('Fehler', 'Bitte füge mindestens eine Antwortoption hinzu.');
      return;
    }

    const { data: insertResult, error } = await supabase
      .from('umfragen')
      .insert([{ frage, typ, antwortoptionen: neueAntworten }])
      .select()
      .single();

    if (error || !insertResult) {
      Alert.alert('Fehler beim Speichern', error?.message || 'Unbekannter Fehler');
      return;
    }

    const neueUmfrageId = insertResult.id;

    const { data: users, error: userError } = await supabase.from('users').select('id');

    if (userError || !users) {
      Alert.alert('Fehler beim Laden der User');
      return;
    }

    const statusEinträge = users.map((u) => ({
      user_id: u.id,
      umfrage_id: neueUmfrageId,
      beantwortet: false,
    }));

    const { error: statusError } = await supabase
      .from('user_umfragen')
      .insert(statusEinträge);

    if (statusError) {
      Alert.alert('Fehler beim Verknüpfen mit Usern', statusError.message);
      return;
    }

    setFrage('');
    setAntworten([]);
    setAusgewählteGerichte([]);
    setModalVisible(false);
    fetchInitialData();
  };

  const handlePreview = (umfrage: Umfrage) => {
    setVorschauUmfrage(umfrage);
    setVorschauVisible(true);
  };

  const handleRestart = async (umfrageId: string) => {
    try {
      const { error } = await supabase
        .from('user_umfragen')
        .update({ beantwortet: false })
        .eq('umfrage_id', umfrageId);

      if (error) {
        Alert.alert('Fehler beim Neustarten', error.message);
      } else {
        Alert.alert('Umfrage zurückgesetzt', 'Alle Nutzer können die Umfrage erneut beantworten.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Unbekannter Fehler beim Neustarten');
    }
  };

  const handleDelete = async (umfrageId: string) => {
    Alert.alert(
      'Umfrage löschen?',
      'Diese Umfrage und alle zugehörigen Daten werden gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: statusError } = await supabase
                .from('user_umfragen')
                .delete()
                .eq('umfrage_id', umfrageId);

              if (statusError) {
                Alert.alert('Fehler beim Löschen der Verknüpfungen', statusError.message);
                return;
              }

              const { error: umfrageError } = await supabase
                .from('umfragen')
                .delete()
                .eq('id', umfrageId);

              if (umfrageError) {
                Alert.alert('Fehler beim Löschen der Umfrage', umfrageError.message);
                return;
              }

              fetchInitialData();
              Alert.alert('Erfolg', 'Umfrage gelöscht.');
            } catch (err) {
              console.error(err);
              Alert.alert('Unbekannter Fehler beim Löschen');
            }
          },
        },
      ]
    );
  };

  const typLabel = (typ: Fragetyp) => {
    switch (typ) {
      case 'einzelauswahl':
        return 'Einzelauswahl';
      case 'mehrfachauswahl':
        return 'Mehrfachauswahl';
      case 'ranking':
        return 'Ranking';
      default:
        return typ;
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: themeColor.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#d9534f' },
    umfrageCard: {
      backgroundColor: themeColor.card,
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    frage: { fontWeight: 'bold', fontSize: 18, color: themeColor.text },
    typ: { color: themeColor.icon, marginBottom: 8 },
    antwort: { marginTop: 2, color: themeColor.text },
    iconRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 20,
      marginTop: 12,
    },
    emptyText: { textAlign: 'center', marginTop: 40, color: themeColor.icon },
    modalWrapper: { padding: 20, flexGrow: 1 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: themeColor.text },
    label: { marginTop: 16, fontWeight: 'bold', color: themeColor.text, fontSize: 15 },
    input: {
      borderWidth: 1,
      borderColor: themeColor.border,
      padding: 12,
      borderRadius: 10,
      marginTop: 8,
      backgroundColor: themeColor.surface,
      color: themeColor.text,
    },
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 8,
    },
    typeOption: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: themeColor.border,
    },
    typeOptionSelected: {
      backgroundColor: '#d9534f',
      borderColor: '#d9534f',
    },
    typeText: { color: themeColor.text },
    typeTextSelected: { color: '#fff', fontWeight: 'bold' },
    submitButton: {
      backgroundColor: '#d9534f',
      padding: 14,
      borderRadius: 10,
      marginTop: 24,
    },
    submitText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Umfragen verwalten</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={32} color="#d9534f" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={umfragen}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.umfrageCard}>
              <Text style={styles.frage}>{item.frage}</Text>
              <Text style={styles.typ}>{typLabel(item.typ)}</Text>
              {item.antwortoptionen.map((antwort, idx) => (
                <Text key={`${antwort}-${idx}`} style={styles.antwort}>• {antwort}</Text>
              ))}
              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => handlePreview(item)}>
                  <Ionicons name="eye-outline" size={22} color={themeColor.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRestart(item.id)}>
                  <Ionicons name="refresh-outline" size={22} color={themeColor.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="#c00" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Noch keine Umfragen.</Text>}
        />
      )}

      <UmfrageVorschau
        visible={vorschauVisible}
        onClose={() => setVorschauVisible(false)}
        frage={vorschauUmfrage?.frage || ''}
        typ={vorschauUmfrage?.typ || 'einzelauswahl'}
        antworten={vorschauUmfrage?.antwortoptionen || []}
        interaktiv={false}
      />

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={[styles.container, { backgroundColor: themeColor.background }]}>
          <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.modalWrapper}>
              <Text style={styles.modalTitle}>Neue Umfrage erstellen</Text>

              <Text style={styles.label}>Fragetyp wählen:</Text>
              <View style={styles.typeRow}>
                {(['einzelauswahl', 'mehrfachauswahl', 'ranking'] as Fragetyp[]).map((t) => {
                  const iconMap = {
                    einzelauswahl: 'radio-button-on-outline',
                    mehrfachauswahl: 'checkbox-outline',
                    ranking: 'list-outline',
                  };
                  const iconName = iconMap[t];
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeOption,
                        typ === t && styles.typeOptionSelected,
                        { flexDirection: 'row', alignItems: 'center' },
                      ]}
                      onPress={() => {
                        setTyp(t);
                        setAntworten([]);
                        setAusgewählteGerichte([]);
                      }}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={18}
                        color={typ === t ? '#fff' : themeColor.icon}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.typeText, typ === t && styles.typeTextSelected]}>
                        {typLabel(t)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Frage eingeben:</Text>
              <TextInput
                style={styles.input}
                placeholder="Deine Frage hier..."
                placeholderTextColor={themeColor.placeholder}
                value={frage}
                onChangeText={setFrage}
              />

              {typ === 'ranking' && (
                <RankingEditor gerichte={antworten} setGerichte={setAntworten} />
              )}

              {(typ === 'einzelauswahl' || typ === 'mehrfachauswahl') && (
                <>
                  <Text style={styles.label}>Antwortoptionen:</Text>
                  <AuswahlEditor
                    typ={typ}
                    gerichte={gerichte}
                    ausgewählteGerichte={ausgewählteGerichte}
                    setAusgewählteGerichte={setAusgewählteGerichte}
                  />
                </>
              )}

              <TouchableOpacity onPress={handleCreateUmfrage} style={styles.submitButton}>
                <Text style={styles.submitText}>Speichern & an alle senden</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ textAlign: 'center', color: themeColor.icon, marginTop: 20 }}>
                  Abbrechen
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
