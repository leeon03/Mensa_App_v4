import React from 'react';
import { View, Image, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../constants/supabase';

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
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const base64 = asset.base64;
    const filePath = generateFilePath(userId);

    if (!base64) {
      Alert.alert('Fehler', 'Bild konnte nicht gelesen werden.');
      return;
    }

    try {
      // Base64 direkt als Data URL hochladen
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, dataUrl, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;

      if (publicUrl) {
        onUpload(publicUrl);

        await supabase.from('users')
          .update({ avatar_data: publicUrl })
          .eq('id', userId);

        Alert.alert('Upload erfolgreich');
      }
    } catch (err: any) {
      console.error('Fehler beim Hochladen:', err);
      Alert.alert('Fehler beim Hochladen', err.message);
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
