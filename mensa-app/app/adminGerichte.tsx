import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';

export default function AdminGerichte() {
  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const loadGerichte = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gerichte')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Fehler beim Laden der Gerichte');
      console.error(error);
    } else {
      setGerichte(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadGerichte();
  }, []);

  const deleteGericht = async (id: number) => {
    const confirm = await new Promise((resolve) =>
      Alert.alert(
        'Löschen bestätigen',
        'Willst du dieses Gericht wirklich löschen?',
        [
          { text: 'Abbrechen', onPress: () => resolve(false), style: 'cancel' },
          { text: 'Löschen', onPress: () => resolve(true), style: 'destructive' },
        ]
      )
    );

    if (confirm) {
      const { error } = await supabase.from('gerichte').delete().eq('id', id);
      if (error) {
        Alert.alert('Fehler beim Löschen');
        console.error(error);
      } else {
        loadGerichte();
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColor.background }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: themeColor.text }]}>Gerichte verwalten</Text>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: themeColor.accent1 }]}
          onPress={() => router.push('/adminNeuesGericht')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Neues Gericht hinzufügen</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={themeColor.accent1} />
        ) : (
          gerichte.map((gericht) => (
            <View key={gericht.id} style={styles.gerichtBox}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: themeColor.text }]}>
                  {gericht.anzeigename}
                </Text>
                <Text style={{ color: themeColor.icon }}>{gericht.kategorie}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/adminBearbeiten',
                      params: { id: gericht.id.toString() },
                    })
                  }
                >
                  <Ionicons name="create-outline" size={22} color={themeColor.accent2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteGericht(gericht.id)}>
                  <Ionicons name="trash-outline" size={22} color="#c00" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gerichtBox: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
