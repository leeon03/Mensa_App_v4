import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface RankingEditorProps {
  gerichte: string[];
  setGerichte: (gerichte: string[]) => void;
}

interface Item {
  key: string;
  label: string;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RankingEditor({ gerichte, setGerichte }: RankingEditorProps) {
  const initialData: Item[] = useMemo(
    () => gerichte.map((g) => ({ key: g, label: g })),
    [gerichte]
  );

  const [data, setData] = useState<Item[]>(initialData);
  const [neuerEintrag, setNeuerEintrag] = useState('');

  const handleDragEnd = ({ data }: { data: Item[] }) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setData(data);
    setGerichte(data.map((item) => item.label));
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Item>) => (
      <TouchableOpacity
        style={[styles.item, isActive && styles.activeItem]}
        onPressIn={drag}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {data.findIndex((d) => d.key === item.key) + 1}
          </Text>
        </View>
        <Text style={styles.itemText}>{item.label}</Text>
        <TouchableOpacity onPress={() => eintragEntfernen(item.key)}>
          <Text style={styles.removeX}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [data]
  );

  const eintragHinzufuegen = () => {
    const text = neuerEintrag.trim();
    if (!text) return;

    if (data.some((item) => item.label === text)) {
      Alert.alert('Eintrag existiert bereits');
      return;
    }

    const neuesItem: Item = { key: text, label: text };
    const neueListe = [...data, neuesItem];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setData(neueListe);
    setGerichte(neueListe.map((i) => i.label));
    setNeuerEintrag('');
  };

  const eintragEntfernen = (key: string) => {
    const neueListe = data.filter((item) => item.key !== key);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setData(neueListe);
    setGerichte(neueListe.map((i) => i.label));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Deine Reihenfolge (Drag & Drop):</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Eintrag hinzufügen..."
          value={neuerEintrag}
          onChangeText={setNeuerEintrag}
          style={styles.input}
          onSubmitEditing={eintragHinzufuegen}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={eintragHinzufuegen}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {data.length === 0 ? (
        <Text style={styles.placeholder}>Noch keine Einträge</Text>
      ) : (
        <DraggableFlatList
          data={data}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          containerStyle={{ paddingBottom: 20 }}
          autoscrollSpeed={60}
          activationDistance={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 12,
    color: '#222',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
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
  activeItem: {
    backgroundColor: '#f0f8ff',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
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
  removeX: {
    color: '#d9534f',
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});
