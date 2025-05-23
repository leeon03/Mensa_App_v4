import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = 'user_preferences';

const mockFavoritesData = [
  { id: 1, name: 'Spaghetti Bolognese', tags: ['beliebt'] },
  { id: 2, name: 'Veganes Curry', tags: ['vegan', 'scharf'] },
  { id: 3, name: 'Schnitzel mit Pommes', tags: [] },
];

export default function FavoritesScreen() {
  return (
    <SafeAreaProvider>
      <FavoritesInner />
    </SafeAreaProvider>
  );
}

function FavoritesInner() {
  const theme = useColorScheme() || 'light';

  const [favorites, setFavorites] = useState<number[]>([]);
  const [alerts, setAlerts] = useState<Record<number, boolean>>({});
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setFavorites(parsed.favorites || []);
        setAlerts(parsed.alerts || {});
      } else {
        const initialFavorites = mockFavoritesData.map((g) => g.id);
        setFavorites(initialFavorites);
        setAlerts({});
      }
    };
    loadPreferences();
  }, []);

  const savePreferences = async (
    updatedFavorites: number[],
    updatedAlerts: Record<number, boolean>
  ) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ favorites: updatedFavorites, alerts: updatedAlerts })
    );
  };

  const toggleAlert = (id: number) => {
    const updated = { ...alerts, [id]: !alerts[id] };
    setAlerts(updated);
    savePreferences(favorites, updated);
  };

  const toggleLegend = () => {
    LayoutAnimation.easeInEaseOut();
    setShowLegend(!showLegend);
  };

  const renderTags = (tags: string[]) => (
    <View style={styles.tagRow}>
      {tags.includes('vegan') && <Text style={styles.tag}>🌱</Text>}
      {tags.includes('vegetarisch') && <Text style={styles.tag}>🥦</Text>}
      {tags.includes('scharf') && <Text style={styles.tag}>🌶️</Text>}
      {tags.includes('beliebt') && <Text style={styles.tag}>🔥</Text>}
    </View>
  );

  const removeFromFavorites = (id: number) => {
    Alert.alert(
      'Favorit entfernen',
      'Möchtest du dieses Gericht wirklich aus deinen Favoriten löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: () => {
            const updatedFavorites = favorites.filter((fid) => fid !== id);
            const updatedAlerts = { ...alerts };
            delete updatedAlerts[id];
            setFavorites(updatedFavorites);
            setAlerts(updatedAlerts);
            savePreferences(updatedFavorites, updatedAlerts);
          },
        },
      ]
    );
  };

  const visibleFavorites = mockFavoritesData.filter((g) => favorites.includes(g.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Text style={styles.title}>Deine Favoriten</Text>

      <TouchableOpacity onPress={toggleLegend} style={styles.legendToggle}>
        <Text style={[styles.legendeTitle, { color: Colors[theme].text }]}>
          Legende {showLegend ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {showLegend && (
        <View style={[styles.legendeContainer, { backgroundColor: Colors[theme].surface }]}>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🌱 Vegan</Text></View>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🥦 Vegetarisch</Text></View>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🌶️ Scharf</Text></View>
          <View style={styles.legendeChip}><Text style={styles.chipText}>🔥 Beliebt</Text></View>
          <View style={styles.legendeChip}>
            <Ionicons name="heart" size={14} color="red" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Favorit</Text>
          </View>
          <View style={styles.legendeChip}>
            <Ionicons name="notifications" size={14} color="#007AFF" style={{ marginRight: 4 }} />
            <Text style={styles.chipText}>Erinnerung</Text>
          </View>
        </View>
      )}

      {visibleFavorites.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: Colors[theme].text }}>
          Du hast noch keine Favoriten gespeichert.
        </Text>
      ) : (
        <FlatList
          data={visibleFavorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Animatable.View
              animation="fadeInLeft"
              duration={500}
              delay={index * 100}
              useNativeDriver
            >
              <View style={[styles.item, { backgroundColor: Colors[theme].card }]}>
                <View style={styles.itemHeader}>
                  <Animatable.View animation="bounceIn">
                    <TouchableOpacity onPress={() => removeFromFavorites(item.id)}>
                      <Ionicons name="heart" size={20} color="red" />
                    </TouchableOpacity>
                  </Animatable.View>
                  <Text style={[styles.itemText, { color: Colors[theme].text }]}>{item.name}</Text>
                  <Animatable.View animation="pulse" duration={300}>
                    <TouchableOpacity onPress={() => toggleAlert(item.id)}>
                      <Ionicons
                        name={alerts[item.id] ? 'notifications' : 'notifications-outline'}
                        size={20}
                        color={alerts[item.id] ? '#007AFF' : Colors[theme].icon}
                      />
                    </TouchableOpacity>
                  </Animatable.View>
                </View>
                {renderTags(item.tags)}
              </View>
            </Animatable.View>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'AsyncStorage löschen',
            'Willst du wirklich alle gespeicherten Favoriten und Erinnerungen löschen?',
            [
              { text: 'Abbrechen', style: 'cancel' },
              {
                text: 'Löschen',
                style: 'destructive',
                onPress: async () => {
                  await AsyncStorage.removeItem(STORAGE_KEY);
                  setFavorites([]);
                  setAlerts({});
                },
              },
            ]
          );
        }}
        style={{
          marginTop: 24,
          padding: 12,
          backgroundColor: '#ddd',
          borderRadius: 10,
          alignSelf: 'center',
        }}
      >
        <Text style={{ color: '#000', fontWeight: 'bold' }}>🗑️ AsyncStorage zurücksetzen</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    color: 'red',
  },
  legendToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  legendeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  legendeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  chipText: {
    fontSize: 13,
    color: '#333',
  },
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    fontSize: 16,
    marginRight: 6,
  },
});
