import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../constants/supabase';
import { Colors } from '../constants/Colors';

const generateFilePath = (userId: string) => `${userId}/${Date.now()}.jpg`;

interface AvatarProps {
  userId: string;
  avatarUri: string | null;
  onUpload: (url: string) => void;
  name: string;
}

export default function Avatar({ userId, avatarUri, onUpload, name }: AvatarProps) {
  const theme = useColorScheme() || 'light';

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

        await supabase
          .from('users')
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
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={handleSelectImage} style={styles.centered}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{name[0]}</Text>
          </View>
        )}
        <Text style={[styles.label, { color: Colors[theme].text }]}>Tippen zum Ändern</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 24,
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
