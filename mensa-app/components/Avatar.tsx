import React, { useState } from 'react';
import {
  View,
  Image,
  Pressable,
  Text,
  Alert,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  userId: string;
  avatarUri: string | null;
  onUpload: (url: string | null) => void;
  name: string;
}

export default function Avatar({ userId, avatarUri, onUpload, name }: AvatarProps) {
  const theme = useColorScheme() || 'light';
  const [loading, setLoading] = useState(false);

  const handleSelectImage = async (source: 'gallery' | 'camera') => {
    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });

    if (pickerResult.canceled) return;

    const base64 = pickerResult.assets?.[0]?.base64;
    if (!base64) {
      Alert.alert('Fehler', 'Bild konnte nicht geladen werden.');
      return;
    }

    const base64DataUrl = `data:image/jpeg;base64,${base64}`;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: base64DataUrl })
        .eq('id', userId);

      if (error) throw error;

      onUpload(base64DataUrl);
      Alert.alert('Erfolg', 'Profilbild aktualisiert!');
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err);
      Alert.alert('Fehler beim Speichern', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCameraWithPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Keine Berechtigung', 'Bitte erlaube den Kamerazugriff in den Einstellungen.');
      return;
    }

    handleSelectImage('camera');
  };

  const openImageOptions = () => {
    Alert.alert('Profilbild ändern', 'Wähle eine Option:', [
      {
        text: 'Kamera',
        onPress: () => openCameraWithPermission(),
      },
      {
        text: 'Galerie',
        onPress: () => handleSelectImage('gallery'),
      },
      {
        text: 'Abbrechen',
        style: 'cancel',
      },
    ]);
  };

  const handleDeleteImage = async () => {
    Alert.alert('Profilbild löschen', 'Möchtest du dein Bild wirklich entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase
              .from('users')
              .update({ avatar_url: null })
              .eq('id', userId);

            if (error) throw error;

            onUpload(null);
            Alert.alert('Bild gelöscht');
          } catch (err: any) {
            console.error('Fehler beim Löschen:', err);
            Alert.alert('Fehler beim Löschen', err.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      {avatarUri && (
        <Pressable style={styles.deleteIcon} onPress={handleDeleteImage}>
          <Ionicons name="trash-outline" size={22} color="#e57373" />
        </Pressable>
      )}

      <Pressable onPress={openImageOptions} style={styles.centered}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors[theme].text} />
        ) : avatarUri ? (
          <Image
            key={avatarUri}
            source={{ uri: avatarUri }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{name[0]?.toUpperCase() || '?'}</Text>
          </View>
        )}
        <Text style={[styles.label, { color: Colors[theme].text }]}>
          Tippe zum Ändern
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteIcon: {
    position: 'absolute',
    top: -6,
    right: 6,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#ffeaea',
    borderRadius: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 8,
  },
  placeholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 36,
    color: '#444',
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
});
