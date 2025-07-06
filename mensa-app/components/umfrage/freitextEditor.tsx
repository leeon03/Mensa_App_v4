import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface FreitextEditorProps {
  antworten: string[];
  setAntworten: (antworten: string[]) => void;
  antwortInput: string;
  setAntwortInput: (input: string) => void;
}

export default function FreitextEditor({
  antworten,
  setAntworten,
  antwortInput,
  setAntwortInput,
}: FreitextEditorProps) {
  const handleAddAntwort = () => {
    if (antwortInput.trim()) {
      setAntworten([...antworten, antwortInput.trim()]);
      setAntwortInput('');
    }
  };

  return (
    <>
      <Text style={styles.label}>Antwortmöglichkeiten:</Text>
      <TextInput
        style={styles.input}
        placeholder="Antwort hinzufügen"
        value={antwortInput}
        onChangeText={setAntwortInput}
        onSubmitEditing={handleAddAntwort}
      />
      <View style={styles.antwortListe}>
        {antworten.map((a, i) => (
          <Text key={`${a}-${i}`}>• {a}</Text>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 16, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  antwortListe: { marginTop: 8 },
});
