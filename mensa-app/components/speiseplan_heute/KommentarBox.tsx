import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../constants/supabase';

type Props = {
  onSubmit: (data: { text: string; stars: number; bild_url?: string }) => void;
  disabled?: boolean;
  buttonColor?: string;
};

export default function KommentarBox({ onSubmit, disabled, buttonColor }: Props) {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const highlight = buttonColor || themeColor.accent2;

  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handlePress = () => {
    if (text.trim() && stars > 0) {
      onSubmit({ text: text.trim(), stars, bild_url: imageUrl || undefined });
      setText('');
      setStars(0);
      setImageUri(null);
      setImageUrl(null);
    }
  };

  const pickImage = async (fromCamera: boolean) => {
    try {
      let result;
      if (fromCamera) {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPerm.granted) {
          Alert.alert('Kamera-Zugriff benötigt');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
      } else {
        const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPerm.granted) {
          Alert.alert('Galerie-Zugriff benötigt');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
      }

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setImageUri(asset.uri);

      // Bild zu Supabase hochladen
      setUploading(true);
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileExt = asset.uri.split('.').pop() || 'jpg';
      const filePath = `kommentare/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bewertungen')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Fehler beim Hochladen', uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from('bewertungen').getPublicUrl(filePath);
      setImageUrl(data?.publicUrl || null);
      setUploading(false);
    } catch (err: any) {
      Alert.alert('Fehler', err.message);
      setUploading(false);
    }
  };

  const showAttachmentOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Abbrechen', 'Foto aufnehmen', 'Aus Galerie wählen'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          if (buttonIndex === 2) pickImage(false);
        }
      );
    } else {
      Alert.alert('Bild anhängen', 'Wähle eine Option', [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Foto aufnehmen', onPress: () => pickImage(true) },
        { text: 'Aus Galerie wählen', onPress: () => pickImage(false) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => !disabled && setStars(i + 1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i < stars ? 'star' : 'star-outline'}
              size={24}
              color={highlight}
              style={{ marginRight: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: themeColor.border,
            color: themeColor.text,
          },
        ]}
        placeholder="Was möchtest du sagen?"
        placeholderTextColor={themeColor.icon}
        multiline
        editable={!disabled}
        value={text}
        onChangeText={setText}
      />

      {imageUri && (
        <View style={styles.imagePreviewRow}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => {
              setImageUri(null);
              setImageUrl(null);
            }}
            style={styles.removeImageButton}
          >
            <Ionicons name="close-circle" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: highlight,
              opacity: disabled || stars === 0 || text.trim() === '' || uploading ? 0.5 : 1,
            },
          ]}
          onPress={handlePress}
          disabled={disabled || stars === 0 || text.trim() === '' || uploading}
        >
          <Text style={styles.submitText}>Absenden</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={showAttachmentOptions}
          style={styles.attachmentButton}
          disabled={uploading}
        >
          <Ionicons
            name="attach"
            size={24}
            color={uploading ? '#aaa' : highlight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  attachmentButton: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 12,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  removeImageButton: {
    backgroundColor: '#888',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8, // Abstand zwischen Button und Icon
    marginTop: 4,
  },
});
