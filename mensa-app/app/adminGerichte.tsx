import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import Card from '../components/ui/card';
import { Feather } from '@expo/vector-icons';

export default function AdminGerichte() {
  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [longPressedId, setLongPressedId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number, timer: number } | null>(null);
  const [countdown, setCountdown] = useState(30);
  const timerRef = React.useRef<any>(null); // <--- Typ auf any ändern
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
    Alert.alert(
      'Löschen bestätigen',
      'Willst du dieses Gericht wirklich löschen?',
      [
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
      ]
    );
  };

  // Startet den Countdown und setzt pendingDelete
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

  // Löscht das Gericht wirklich
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

  // Undo-Funktion
  const undoDelete = () => {
    setPendingDelete(null);
    setLongPressedId(null);
    timerRef.current && clearInterval(timerRef.current);
  };

  // Clean up Timer beim Unmount
  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    loadGerichte();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColor.background }]}>
      {gerichte.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: themeColor.text }}>Keine Gerichte gefunden.</Text>
        </View>
      ) : (
        gerichte.map((gericht) => {
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
                  if (isLongPressed || isPendingDelete) {
                    setLongPressedId(null);
                  } else {
                    router.push({
                      pathname: '/adminBearbeiten',
                      params: { id: gericht.id.toString() },
                    });
                  }
                }}
                onLongPress={() => setLongPressedId(gericht.id)}
                disabled={isPendingDelete}
              >
                <View style={[
                  styles.cardWrapper,
                  (isLongPressed || isPendingDelete) && styles.cardLongPressed,
                  isPendingDelete && { backgroundColor: '#FFA500' } // Orange
                ]}>
                  <Card
                    name={gericht.name}
                    anzeigename={gericht.anzeigename}
                    beschreibung={gericht.beschreibung}
                    bild_url={gericht.bild_url}
                    kategorie={gericht.kategorie || ''}
                    bewertungen={[]} // Admin zeigt keine Bewertungen
                    tags={gericht.tags}
                    preis={parseFloat(gericht.preis)}
                    isFavorite={false}
                    isAlert={false}
                    onFavoritePress={() => {}}
                    onAlertPress={() => {}}
                  />
                  {isLongPressed && !isPendingDelete && (
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
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
});
