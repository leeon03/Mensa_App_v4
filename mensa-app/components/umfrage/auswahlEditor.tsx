import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface AuswahlEditorProps {
  typ: 'einzelauswahl' | 'mehrfachauswahl';
  gerichte: string[];
  ausgewählteGerichte: string[];
  setAusgewählteGerichte: (gerichte: string[]) => void;
  hideSelected?: boolean; // Neue optionale Prop
}

export default function AuswahlEditor({
  typ,
  gerichte,
  ausgewählteGerichte,
  setAusgewählteGerichte,
  hideSelected = false,
}: AuswahlEditorProps) {
  const handleToggle = (gericht: string) => {
    if (typ === 'einzelauswahl') {
      setAusgewählteGerichte([gericht]);
    } else {
      if (ausgewählteGerichte.includes(gericht)) {
        setAusgewählteGerichte(ausgewählteGerichte.filter((g) => g !== gericht));
      } else {
        setAusgewählteGerichte([...ausgewählteGerichte, gericht]);
      }
    }
  };

  return (
    <>
      {!hideSelected && (
        <>
          <Text style={styles.label}>Ausgewählte Gerichte:</Text>
          {ausgewählteGerichte.length === 0 ? (
            <Text style={styles.placeholder}>Keine ausgewählt</Text>
          ) : (
            <View style={styles.auswahlAnzeige}>
              {ausgewählteGerichte.map((g, i) => (
                <Text key={`${g}-${i}`} style={styles.auswahlItem}>
                  {i + 1}. {g}
                </Text>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Gerichte auswählen:</Text>
      <ScrollView style={{ maxHeight: 250 }}>
        {gerichte.map((gericht, idx) => {
          const istAusgewählt = ausgewählteGerichte.includes(gericht);
          return (
            <TouchableOpacity key={`${gericht}-${idx}`} onPress={() => handleToggle(gericht)}>
              <Text
                style={[
                  styles.gerichtOption,
                  istAusgewählt && styles.selectedGerichtOption,
                ]}
              >
                {gericht}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 8,
  },
  auswahlAnzeige: {
    marginTop: 8,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fef6f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  auswahlItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  gerichtOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedGerichtOption: {
    backgroundColor: '#fdecea',
    fontWeight: 'bold',
  },
});
