import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '../../constants/supabase';

interface RankingEditorProps {
  gerichte: string[];
  setGerichte: (gerichte: string[]) => void;
}

interface Item {
  key: string;
  label: string;
}

interface Gericht {
  id: number;
  name: string;
  anzeigename: string;
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
  const [alleGerichte, setAlleGerichte] = useState<Gericht[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ladeAlleGerichte = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('gerichte').select('id, name, anzeigename');
      if (error) {
        Alert.alert('Fehler beim Laden der Gerichte');
        console.error(error);
      } else {
        setAlleGerichte(data || []);
      }
      setLoading(false);
    };

    ladeAlleGerichte();
  }, []);

  const handleDragEnd = ({ data }: { data: Item[] }) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setData(data);
    setGerichte(data.map((item) => item.label));
  };

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

  const toggleGericht = (gericht: Gericht) => {
    const existiert = data.some((item) => item.label === gericht.name);

    if (existiert) {
      eintragEntfernen(gericht.name);
    } else {
      const neuesItem: Item = { key: gericht.name, label: gericht.name };
      const neueListe = [...data, neuesItem];
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setData(neueListe);
      setGerichte(neueListe.map((i) => i.label));
    }
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Item>) => (
      <TouchableOpacity
        style={[styles.item, isActive && styles.activeItem]}
        onLongPress={drag}
        delayLongPress={150}
        activeOpacity={1}
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

  const isSelected = (gericht: Gericht) =>
    data.some((item) => item.label === gericht.name);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Deine Reihenfolge (Drag & Drop):</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Eintrag manuell hinzufügen..."
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

        <View style={styles.dragListWrapper}>
          <DraggableFlatList
            data={data}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
          />
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Alle verfügbaren Gerichte:</Text>

        {loading ? (
          <ActivityIndicator size="small" style={{ marginTop: 8 }} />
        ) : (
          <View style={styles.gerichteListeWrapper}>
            <FlatList
              data={alleGerichte}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const selected = isSelected(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.gerichtItem,
                      selected && styles.gerichtItemSelected,
                    ]}
                    onPress={() => toggleGericht(item)}
                  >
                    <Text
                      style={[
                        styles.gerichtText,
                        selected && styles.gerichtTextSelected,
                      ]}
                    >
                      {item.anzeigename || item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 300 }} // ca. 5–6 Einträge
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  dragListWrapper: {
    maxHeight: 400,
    minHeight: 100,
    marginBottom: 12,
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
  gerichteListeWrapper: {
    maxHeight: 300,
  },
});
