import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import Card from '../components/ui/card';
import GridCard, { GridCardList } from '../components/admin/gridCrad';
import ListItem from '../components/admin/list';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminGerichte() {
  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [longPressedId, setLongPressedId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; timer: number } | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const timerRef = React.useRef<any>(null);
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
      Alert.alert('Fehler', 'Gerichte konnten nicht geladen werden.');
      console.error(error);
    } else {
      setGerichte(data || []);
    }
    setLoading(false);
  };

  const deleteGericht = async (id: number) => {
    Alert.alert('Löschen bestätigen', 'Willst du dieses Gericht wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('gerichte').delete().eq('id', id);
          if (error) {
            Alert.alert('Fehler beim Löschen', error.message);
          } else {
            loadGerichte();
            setLongPressedId(null);
          }
        },
      },
    ]);
  };

  const startDeleteCountdown = (id: number) => {
    setPendingDelete({ id, timer: 30 });
    setCountdown(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          confirmDelete(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmDelete = async (id: number) => {
    setPendingDelete(null);
    setLongPressedId(null);
    const { error } = await supabase.from('gerichte').delete().eq('id', id);
    if (error) {
      Alert.alert('Fehler beim Löschen', error.message);
    } else {
      loadGerichte();
    }
  };

  const undoDelete = () => {
    setPendingDelete(null);
    setLongPressedId(null);
    timerRef.current && clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    loadGerichte();
  }, []);

  const filteredGerichte =
    searchText.length >= 3
      ? gerichte.filter((gericht) =>
          gericht.name.toLowerCase().startsWith(searchText.toLowerCase())
        )
      : gerichte;

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: themeColor.background }]}
      >
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Animatable.Text
          animation="fadeInDown"
          duration={700}
          delay={100}
          style={[styles.title, { color: '#d9534f' }]}
        >
          GERICHTE VERWALTEN
        </Animatable.Text>

        <TextInput
          style={[styles.searchInput, { borderColor: themeColor.border, color: themeColor.text }]}
          placeholder="Suche nach Gericht..."
          placeholderTextColor={themeColor.placeholder || '#999'}
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Ansicht Icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => setViewMode('list')}>
            <Feather name="list" size={28} color={viewMode === 'list' ? '#d9534f' : themeColor.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('grid')}>
            <MaterialIcons name="grid-view" size={28} color={viewMode === 'grid' ? '#d9534f' : themeColor.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('compact')}>
            <Ionicons name="reorder-three-outline" size={28} color={viewMode === 'compact' ? '#d9534f' : themeColor.text} />
          </TouchableOpacity>
        </View>

        {filteredGerichte.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: themeColor.text }}>Keine passenden Gerichte gefunden.</Text>
          </View>
        ) : (
          // Ansicht je nach viewMode
          viewMode === 'grid' ? (
            <GridCardList
              daten={filteredGerichte.map(g => ({
                name: g.name,
                anzeigename: g.anzeigename,
                bild_url: g.bild_url,
                preis: parseFloat(g.preis),
                isFavorite: false, // oder aus deinen Daten
              }))}
              onGerichtPress={(item) =>
                router.push({
                  pathname: '/adminBearbeiten',
                  params: { id: gerichte.find(g => g.name === item.name)?.id?.toString() },
                })
              }
              onFavoriteToggle={() => {}}
            />
          ) : viewMode === 'compact' ? (
            filteredGerichte.map((gericht) => {
              const isLongPressed = longPressedId === gericht.id;
              const isPendingDelete = pendingDelete?.id === gericht.id;
              return (
                <Animatable.View
                  key={gericht.id}
                  animation="fadeInUp"
                  delay={gericht.id * 100}
                  style={{ marginBottom: 8 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      if (longPressedId === gericht.id || pendingDelete?.id === gericht.id) {
                        setLongPressedId(null);
                      } else {
                        router.push({
                          pathname: '/adminBearbeiten',
                          params: { id: gericht.id.toString() },
                        });
                      }
                    }}
                    onLongPress={() => setLongPressedId(gericht.id)}
                    disabled={pendingDelete?.id === gericht.id}
                  >
                    <View>
                      <ListItem
                        name={gericht.name}
                        anzeigename={gericht.anzeigename}
                        isFavorite={false}
                        isAlert={false}
                        onFavoritePress={() => {}}
                        onAlertPress={() => {}}
                        onPress={() => {
                          router.push({
                            pathname: '/adminBearbeiten',
                            params: { id: gericht.id.toString() },
                          });
                        }}
                      />
                      {isLongPressed && !pendingDelete?.id && (
                        <View style={styles.deleteIconContainer}>
                          <TouchableOpacity onPress={() => startDeleteCountdown(gericht.id)}>
                            <Feather name="trash-2" size={36} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                      {isPendingDelete && (
                        <>
                          <View style={styles.deleteIconContainer}>
                            <TouchableOpacity onPress={undoDelete}>
                              <Feather name="rotate-ccw" size={36} color="#fff" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.undoContainer}>
                            <Text style={styles.undoText}>
                              Wird in <Text style={styles.countdown}>{countdown}s</Text> gelöscht
                            </Text>
                            <TouchableOpacity onPress={undoDelete} style={styles.undoButton}>
                              <Text style={styles.undoButtonText}>Rückgängig</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })
          ) : (
            filteredGerichte.map((gericht) => {
              const isLongPressed = longPressedId === gericht.id;
              const isPendingDelete = pendingDelete?.id === gericht.id;
              return (
                <Animatable.View
                  key={gericht.id}
                  animation="fadeInUp"
                  delay={gericht.id * 100}
                  style={{ marginBottom: 16 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      if (longPressedId === gericht.id || pendingDelete?.id === gericht.id) {
                        setLongPressedId(null);
                      } else {
                        router.push({
                          pathname: '/adminBearbeiten',
                          params: { id: gericht.id.toString() },
                        });
                      }
                    }}
                    onLongPress={() => setLongPressedId(gericht.id)}
                    disabled={pendingDelete?.id === gericht.id}
                  >
                    <View
                      style={[
                        styles.cardWrapper,
                        (longPressedId === gericht.id || pendingDelete?.id === gericht.id) && styles.cardLongPressed,
                        pendingDelete?.id === gericht.id && { backgroundColor: '#FFA500' },
                      ]}
                    >
                      <Card
                        name={gericht.name}
                        anzeigename={gericht.anzeigename}
                        beschreibung={gericht.beschreibung}
                        bild_url={gericht.bild_url}
                        kategorie={gericht.kategorie || ''}
                        bewertungen={[]}
                        tags={gericht.tags}
                        preis={parseFloat(gericht.preis)}
                        isFavorite={false}
                        isAlert={false}
                        onFavoritePress={() => {}}
                        onAlertPress={() => {}}
                      />
                      {longPressedId === gericht.id && !pendingDelete?.id && (
                        <View style={styles.deleteIconContainer}>
                          <TouchableOpacity onPress={() => startDeleteCountdown(gericht.id)}>
                            <Feather name="trash-2" size={36} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                      {pendingDelete?.id === gericht.id && (
                        <>
                          <View style={styles.deleteIconContainer}>
                            <TouchableOpacity onPress={undoDelete}>
                              <Feather name="rotate-ccw" size={36} color="#fff" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.undoContainer}>
                            <Text style={styles.undoText}>
                              Wird in <Text style={styles.countdown}>{countdown}s</Text> gelöscht
                            </Text>
                            <TouchableOpacity onPress={undoDelete} style={styles.undoButton}>
                              <Text style={styles.undoButtonText}>Rückgängig</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              );
            })
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  cardWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardLongPressed: {
    backgroundColor: '#ffcccc',
  },
  deleteIconContainer: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderRadius: 40,
    padding: 16,
    zIndex: 2,
  },
  undoContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFA500',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  undoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  countdown: {
    color: '#fff',
    fontWeight: 'bold',
  },
  undoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  undoButtonText: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  compactCard: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 60,
    backgroundColor: '#f5f5f5',
  },
});
