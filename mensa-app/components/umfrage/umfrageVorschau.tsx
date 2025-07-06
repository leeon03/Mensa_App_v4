import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VorschauProps {
  visible: boolean;
  onClose: () => void;
  frage: string;
  typ: 'freitext' | 'einzelauswahl' | 'mehrfachauswahl' | 'ranking';
  antworten: string[];
}

export default function UmfrageVorschau({ visible, onClose, frage, typ, antworten }: VorschauProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>📋 Umfrage-Vorschau</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.question}>{frage}</Text>

          <ScrollView contentContainerStyle={styles.answerContainer}>
            {typ === 'freitext' && (
              <Text style={styles.info}>Antwort wird als Textfeld eingegeben.</Text>
            )}

            {(typ === 'einzelauswahl' || typ === 'mehrfachauswahl') && (
              <>
                {antworten.map((antwort, index) => (
                  <View key={`${antwort}-${index}`} style={styles.option}>
                    <Ionicons
                      name={typ === 'einzelauswahl' ? 'radio-button-off' : 'square-outline'}
                      size={20}
                      color="#555"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.optionText}>{antwort}</Text>
                  </View>
                ))}
              </>
            )}

            {typ === 'ranking' && (
              <>
                {antworten.map((antwort, index) => (
                  <View key={`${antwort}-${index}`} style={styles.rankingOption}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.optionText}>{antwort}</Text>
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
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  answerContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  rankingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rankBadge: {
    backgroundColor: '#d9534f',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  info: {
    fontStyle: 'italic',
    color: '#777',
    fontSize: 16,
  },
});