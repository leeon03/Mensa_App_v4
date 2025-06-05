import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import RatingStars from './RatingStars';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onSubmit: (data: { text: string; stars: number; imageUri?: string }) => void;
  disabled?: boolean;
};

export default function KommentarBox({ onSubmit, disabled }: Props) {
  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const theme = useColorScheme() || 'light';
  const headerHeight = useHeaderHeight();
  const { showActionSheetWithOptions } = useActionSheet();

  const checkRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    if (submitted) {
      checkRef.current?.play();
      confettiRef.current?.play();
    }
  }, [submitted]);

  const handleSubmit = () => {
    if (submitted || text.trim().length === 0 || stars === 0 || disabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    onSubmit({ text, stars, imageUri: imageUri || undefined });
    setText('');
    setStars(0);
    setImageUri(null);
    setSubmitted(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => setSubmitted(false), 2000);
  };

  const handlePickImage = async () => {
    const options = ['Foto aufnehmen', 'Aus Galerie wählen', 'Abbrechen'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Anhang hinzufügen',
      },
      async (selectedIndex) => {
        if (selectedIndex === 0) {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Zugriff verweigert', 'Die Kameraerlaubnis wurde nicht erteilt.');
            return;
          }

          const cameraRes = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
          });

          if (!cameraRes.canceled && cameraRes.assets?.length > 0) {
            setImageUri(cameraRes.assets[0].uri);
          }
        } else if (selectedIndex === 1) {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Zugriff verweigert', 'Die Galerieerlaubnis wurde nicht erteilt.');
            return;
          }

          const galleryRes = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.7,
          });

          if (!galleryRes.canceled && galleryRes.assets?.length > 0) {
            setImageUri(galleryRes.assets[0].uri);
          }
        }
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
      style={styles.keyboardAvoiding}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <RatingStars value={stars} editable onChange={setStars} />

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Wie hat es dir geschmeckt?"
          placeholderTextColor={Colors[theme].icon}
          style={[
            styles.input,
            {
              color: Colors[theme].text,
              backgroundColor: Colors[theme].surface,
              borderColor: Colors[theme].icon,
            },
          ]}
          multiline
          accessibilityLabel="Kommentartext"
          accessibilityHint="Gib hier deine Meinung zum Gericht ein"
        />

        {imageUri && (
          <View style={{ marginBottom: 8 }}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          </View>
        )}

        <View style={styles.actionRow}>
          {!submitted && (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors[theme].accent2 }]}
                onPress={handleSubmit}
                accessibilityRole="button"
                accessibilityLabel="Kommentar absenden"
              >
                <Text style={styles.buttonText}>Absenden</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handlePickImage}
                accessibilityLabel="Anhang hinzufügen"
                accessibilityRole="button"
              >
                <Ionicons name="attach" size={24} color={Colors[theme].accent2} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {submitted && (
          <>
            <LottieView
              ref={checkRef}
              source={require('../assets/animations/check.json')}
              style={styles.checkmark}
              loop={false}
            />
            <LottieView
              ref={confettiRef}
              source={require('../assets/animations/confetti.json')}
              style={styles.confetti}
              loop={false}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  checkmark: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginTop: 10,
  },
  confetti: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    pointerEvents: 'none',
    zIndex: 10,
  },
});
