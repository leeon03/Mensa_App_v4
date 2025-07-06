import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface VorschauProps {
  visible: boolean;
  onClose: () => void;
  frage: string;
  typ: 'freitext' | 'einzelauswahl' | 'mehrfachauswahl' | 'ranking';
  antworten: string[];
  onSubmit?: (antwort: any) => void;
  interaktiv?: boolean;
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

export default function UmfrageVorschau({
  visible,
  onClose,
  frage,
  typ,
  antworten,
  onSubmit,
  interaktiv = false,
}: VorschauProps) {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const [selected, setSelected] = useState<string[]>([]);
  const [ranked, setRanked] = useState([...antworten]);
  const [textAntwort, setTextAntwort] = useState('');

  const toggleOption = (value: string) => {
    if (!interaktiv) return;

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
    if (!interaktiv) return;
    const to = from + direction;
    if (to < 0 || to >= ranked.length) return;
    const newRanked = [...ranked];
    const temp = newRanked[from];
    newRanked[from] = newRanked[to];
    newRanked[to] = temp;
    setRanked(newRanked);
  };

  const handleSubmit = () => {
    if (!interaktiv || !onSubmit) return;

    if (typ === 'freitext') {
      onSubmit(textAntwort.trim());
    } else if (typ === 'einzelauswahl') {
      if (selected.length === 0) return;
      onSubmit(selected[0]);
    } else if (typ === 'mehrfachauswahl') {
      onSubmit(selected);
    } else if (typ === 'ranking') {
      onSubmit(ranked);
    }
  };

  const info = typeInfo[typ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColor.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: '#d9534f' }]}>📋 Umfrage-Vorschau</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={themeColor.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.typeInfo}>
            <Ionicons name={info.icon as any} size={20} color="#d9534f" />
            <Text style={[styles.typeText, { color: themeColor.text }]}>{info.label}</Text>
          </View>
          <Text style={[styles.description, { color: themeColor.icon }]}>{info.description}</Text>

          <Text style={[styles.question, { color: themeColor.text }]}>{frage}</Text>

          <ScrollView contentContainerStyle={styles.answerContainer}>
            {typ === 'freitext' && (
              <TextInput
                placeholder="Hier könnte deine Antwort stehen..."
                style={[
                  styles.textInput,
                  {
                    backgroundColor: themeColor.surface,
                    borderColor: themeColor.border,
                    color: themeColor.text,
                  },
                ]}
                placeholderTextColor={themeColor.placeholder}
                value={textAntwort}
                onChangeText={setTextAntwort}
                editable={interaktiv}
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
                      style={[
                        styles.selectItem,
                        { backgroundColor: themeColor.surface, borderColor: themeColor.border },
                      ]}
                      onPress={() => toggleOption(antwort)}
                      disabled={!interaktiv}
                    >
                      <Ionicons
                        name={icon as any}
                        size={22}
                        color="#d9534f"
                        style={{ marginRight: 10 }}
                      />
                      <Text style={[styles.selectText, { color: themeColor.text }]}>
                        {antwort}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {typ === 'ranking' && (
              <>
                {ranked.map((antwort, index) => (
                  <View
                    key={`${antwort}-${index}`}
                    style={[
                      styles.rankingItem,
                      { backgroundColor: themeColor.card, borderColor: themeColor.border },
                    ]}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.selectText, { color: themeColor.text }]}>
                      {antwort}
                    </Text>
                    {interaktiv && (
                      <View style={styles.arrows}>
                        <TouchableOpacity onPress={() => handleMove(index, -1)}>
                          <MaterialIcons name="arrow-upward" size={20} color={themeColor.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMove(index, 1)}>
                          <MaterialIcons name="arrow-downward" size={20} color={themeColor.icon} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {interaktiv && onSubmit && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Antwort abschicken</Text>
            </TouchableOpacity>
          )}
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
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  question: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
  },
  answerContainer: {
    gap: 14,
    paddingBottom: 30,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
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
  submitButton: {
    marginTop: 20,
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
