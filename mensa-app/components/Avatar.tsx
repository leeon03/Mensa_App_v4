import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../constants/supabase'; // Pfad ggf. anpassen
import { Ionicons } from '@expo/vector-icons';

type AvatarProps = {
  name: string;
  avatarUri?: string; // Jetzt Base64-DataURL
  size?: number;
  userId: string;
  onUpload?: (dataUrl: string) => void;
};

export default function Avatar({
  name,
  avatarUri,
  size = 64,
  userId,
  onUpload,
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const pickAndSaveImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true, // Base64 aktivieren
    });

    if (result.canceled || !result.assets?.length) return;

    const base64 = result.assets[0].base64;
    if (!base64) {
      Alert.alert('Fehler', 'Bild konnte nicht verarbeitet werden.');
      return;
    }

    const dataUrl = `data:image/jpeg;base64,${base64}`;

    const { error } = await supabase
      .from('users')
      .update({ avatar_data: dataUrl })
      .eq('id', userId);

    if (error) {
      Alert.alert('Fehler beim Speichern in der Datenbank', error.message);
      return;
    }

    onUpload?.(dataUrl);
  };

  return (
    <TouchableOpacity onPress={pickAndSaveImage} activeOpacity={0.8}>
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.initialsCircle,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
      )}
      <View style={styles.editIcon}>
        <Ionicons name="camera" size={18} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initialsCircle: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: '600',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0008',
    borderRadius: 10,
    padding: 4,
  },
});
