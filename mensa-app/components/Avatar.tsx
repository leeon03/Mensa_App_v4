import React from 'react';
import { View, Image, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../constants/supabase';
import { decode } from 'base64-arraybuffer'; // ⬅️ installieren: npm install base64-arraybuffer

// Hilfsfunktion zur Erzeugung des Upload-Pfads
const generateFilePath = (userId: string) => `${userId}/${Date.now()}.jpg`;

interface AvatarProps {
  userId: string;
  avatarUri: string | null;
  onUpload: (url: string) => void;
  name: string;
}

export default function Avatar({ userId, avatarUri, onUpload, name }: AvatarProps) {
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, // ⬅️ wichtig für den Blob-Upload
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const filePath = generateFilePath(userId);
    const base64 = asset.base64;

    if (!base64) {
      Alert.alert('Fehler', 'Bild konnte nicht gelesen werden.');
      return;
    }

    try {
      // Base64 → ArrayBuffer → Blob
      const blob = new Blob([decode(base64)], { type: 'image/jpeg' });

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      // Öffentliche URL generieren
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;

      if (publicUrl) {
        // Callback an Parent weitergeben
        onUpload(publicUrl);

        // DB aktualisieren
        await supabase.from('users')
          .update({ avatar_data: publicUrl })
          .eq('id', userId);

        Alert.alert('Upload erfolgreich');
      }
    } catch (error: any) {
      console.error('Fehler beim Hochladen:', error);
      Alert.alert('Fehler beim Hochladen', error.message);
    }
  };

  return (
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <TouchableOpacity onPress={handleSelectImage}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#ccc',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>{name[0]}</Text>
          </View>
        )}
        <Text style={{ marginTop: 8, color: '#888' }}>Tippen zum Ändern</Text>
      </TouchableOpacity>
    </View>
  );
}
