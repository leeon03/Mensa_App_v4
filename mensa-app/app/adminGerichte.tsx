import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import GridCard, { GridCardList } from '../components/admin/gridCrad';
import GerichtItem from '../components/admin/gerichtItem';
import ListItem from '../components/admin/list';

export default function AdminGerichte() {
  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [longPressedId, setLongPressedId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; timer: number } | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const timerRef = useRef<any>(null);
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
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: themeColor.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const isLongPressed = longPressedId === item.id;
    const isPendingDelete = pendingDelete?.id === item.id;

    if (viewMode === 'compact') {
      return (
        <ListItem
          key={item.id}
          name={item.name}
          anzeigename={item.anzeigename}
          onPress={() =>
            router.push({
              pathname: '/adminBearbeiten',
              params: { id: item.id.toString() },
            })
          }
        />
      );
    }

    if (viewMode === 'list') {
      return (
        <GerichtItem
          key={item.id}
          gericht={{ ...item, preis: parseFloat(item.preis) }}
          isLongPressed={isLongPressed}
          isPendingDelete={isPendingDelete}
          countdown={countdown}
          onPress={() => {
            if (isLongPressed || isPendingDelete) {
              setLongPressedId(null);
            } else {
              router.push({
                pathname: '/adminBearbeiten',
                params: { id: item.id.toString() },
              });
            }
          }}
          onLongPress={() => setLongPressedId(item.id)}
          onStartDelete={() => startDeleteCountdown(item.id)}
          onUndoDelete={undoDelete}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Text style={[styles.title, { color: '#d9534f' }]}>GERICHTE VERWALTEN</Text>

      <TextInput
        style={[styles.searchInput, { borderColor: themeColor.border, color: themeColor.text }]}
        placeholder="Suche nach Gericht..."
        placeholderTextColor={themeColor.placeholder || '#999'}
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => setViewMode('list')}>
          <Feather name="list" size={28} color={viewMode === 'list' ? '#d9534f' : themeColor.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('grid')}>
          <MaterialIcons name="grid-view" size={28} color={viewMode === 'grid' ? '#d9534f' : themeColor.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('compact')}>
          <Ionicons
            name="reorder-three-outline"
            size={28}
            color={viewMode === 'compact' ? '#d9534f' : themeColor.text}
          />
        </TouchableOpacity>
      </View>

      {filteredGerichte.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: themeColor.text }}>Keine passenden Gerichte gefunden.</Text>
        </View>
      ) : viewMode === 'grid' ? (
        <GridCardList
          daten={filteredGerichte.map((g) => ({
            name: g.name,
            anzeigename: g.anzeigename,
            bild_url: g.bild_url,
            preis: parseFloat(g.preis),
            isFavorite: false,
          }))}
          onGerichtPress={(item) =>
            router.push({
              pathname: '/adminBearbeiten',
              params: { id: gerichte.find((g) => g.name === item.name)?.id?.toString() },
            })
          }
        />
      ) : (
        <FlatList
          data={filteredGerichte}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
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
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
});
