import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface AuswahlEditorProps {
  typ: 'einzelauswahl' | 'mehrfachauswahl';
  gerichte: string[];
  ausgewählteGerichte: string[];
  setAusgewählteGerichte: (gerichte: string[]) => void;
  hideSelected?: boolean;
}

export default function AuswahlEditor({
  typ,
  gerichte,
  ausgewählteGerichte,
  setAusgewählteGerichte,
  hideSelected = false,
}: AuswahlEditorProps) {
  const handleToggle = (gericht: string) => {
    if (ausgewählteGerichte.includes(gericht)) {
      // Gericht entfernen
      setAusgewählteGerichte(ausgewählteGerichte.filter((g) => g !== gericht));
    } else {
      // Gericht hinzufügen
      setAusgewählteGerichte([...ausgewählteGerichte, gericht]);
    }
  };

  return (
    <View style={styles.container}>
      {!hideSelected && (
        <>
          <Text style={styles.label}>Ausgewählte Gerichte:</Text>
          {ausgewählteGerichte.length === 0 ? (
            <Text style={styles.placeholder}>Keine ausgewählt</Text>
          ) : (
            <View style={styles.auswahlListe}>
              {ausgewählteGerichte.map((g, i) => (
                <View key={`${g}-${i}`} style={styles.item}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{g}</Text>
                  <TouchableOpacity onPress={() => handleToggle(g)}>
                    <Text style={styles.removeX}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Gerichte auswählen:</Text>
      <ScrollView style={{ maxHeight: 250 }}>
        {gerichte.map((gericht, idx) => {
          const selected = ausgewählteGerichte.includes(gericht);
          return (
            <TouchableOpacity
              key={`${gericht}-${idx}`}
              style={[styles.gerichtItem, selected && styles.gerichtItemSelected]}
              onPress={() => handleToggle(gericht)}
            >
              <Text
                style={[styles.gerichtText, selected && styles.gerichtTextSelected]}
              >
                {gericht}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 12,
    color: '#222',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 8,
  },
  auswahlListe: {
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badge: {
    backgroundColor: '#d9534f',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  removeX: {
    color: '#d9534f',
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  gerichtItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  gerichtItemSelected: {
    backgroundColor: '#ffe6e6',
  },
  gerichtText: {
    fontSize: 15,
    color: '#555',
  },
  gerichtTextSelected: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
});
