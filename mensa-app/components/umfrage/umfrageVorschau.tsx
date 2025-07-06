import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface VorschauProps {
  visible: boolean;
  onClose: () => void;
  frage: string;
  typ: 'freitext' | 'einzelauswahl' | 'mehrfachauswahl' | 'ranking';
  antworten: string[];
}

const typeInfo = {
  freitext: {
    icon: 'create-outline',
    label: 'Freitext',
    description: 'Teilnehmer*innen geben ihre Antwort frei ein.',
  },
  einzelauswahl: {
    icon: 'radio-button-on-outline',
    label: 'Einzelauswahl',
    description: 'Bitte wähle **eine** Option aus.',
  },
  mehrfachauswahl: {
    icon: 'checkbox-outline',
    label: 'Mehrfachauswahl',
    description: 'Du kannst **mehrere** Optionen auswählen.',
  },
  ranking: {
    icon: 'reorder-four-outline',
    label: 'Ranking',
    description: 'Ordne die Optionen nach deiner Präferenz (Drag & Drop).',
  },
};

export default function UmfrageVorschau({ visible, onClose, frage, typ, antworten }: VorschauProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [ranked, setRanked] = useState([...antworten]);

  const toggleOption = (value: string) => {
    if (typ === 'einzelauswahl') {
      setSelected([value]);
    } else if (typ === 'mehrfachauswahl') {
      if (selected.includes(value)) {
        setSelected(selected.filter((v) => v !== value));
      } else {
        setSelected([...selected, value]);
      }
    }
  };

  const handleMove = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= ranked.length) return;

    const newRanked = [...ranked];
    const temp = newRanked[from];
    newRanked[from] = newRanked[to];
    newRanked[to] = temp;
    setRanked(newRanked);
  };

  const info = typeInfo[typ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>📋 Umfrage-Vorschau</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* INFO */}
          <View style={styles.typeInfo}>
            <Ionicons name={info.icon as any} size={20} color="#d9534f" />
            <Text style={styles.typeText}>{info.label}</Text>
          </View>
          <Text style={styles.description}>{info.description}</Text>

          {/* FRAGE */}
          <Text style={styles.question}>{frage}</Text>

          {/* ANTWORTBEREICH */}
          <ScrollView contentContainerStyle={styles.answerContainer}>
            {typ === 'freitext' && (
              <TextInput
                style={styles.textInput}
                placeholder="Hier könnte deine Antwort stehen..."
                editable={false}
              />
            )}

            {(typ === 'einzelauswahl' || typ === 'mehrfachauswahl') && (
              <>
                {antworten.map((antwort, index) => {
                  const isSelected = selected.includes(antwort);
                  const icon =
                    typ === 'einzelauswahl'
                      ? isSelected
                        ? 'radio-button-on'
                        : 'radio-button-off'
                      : isSelected
                        ? 'checkbox'
                        : 'square-outline';

                  return (
                    <TouchableOpacity
                      key={`${antwort}-${index}`}
                      style={styles.selectItem}
                      onPress={() => toggleOption(antwort)}
                    >
                      <Ionicons name={icon as any} size={22} color="#d9534f" style={{ marginRight: 10 }} />
                      <Text style={styles.selectText}>{antwort}</Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {typ === 'ranking' && (
              <>
                {ranked.map((antwort, index) => (
                  <View key={`${antwort}-${index}`} style={styles.rankingItem}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.selectText}>{antwort}</Text>
                    <View style={styles.arrows}>
                      <TouchableOpacity onPress={() => handleMove(index, -1)}>
                        <MaterialIcons name="arrow-upward" size={20} color="#555" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleMove(index, 1)}>
                        <MaterialIcons name="arrow-downward" size={20} color="#555" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#222',
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
  },
  question: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  answerContainer: {
    gap: 14,
    paddingBottom: 30,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between',
  },
  rankBadge: {
    backgroundColor: '#d9534f',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  arrows: {
    flexDirection: 'column',
    gap: 2,
  },
});
