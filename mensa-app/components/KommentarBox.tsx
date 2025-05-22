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
} from 'react-native';
import RatingStars from './RatingStars'; // Eigene Bewertungskomponente
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors'; // Farbschema (hell/dunkel)
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

type Props = {
  onSubmit: (data: { text: string; stars: number }) => void;
};

export default function KommentarBox({ onSubmit }: Props) {
  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const theme = useColorScheme() || 'light';

  const checkRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);

  // Animation abspielen wenn submitted true wird
  useEffect(() => {
    if (submitted) {
      checkRef.current?.play();
      confettiRef.current?.play();
    }
  }, [submitted]);

  const handleSubmit = () => {
    if (text.trim().length > 0 && stars > 0) {
      onSubmit({ text, stars });
      setText('');
      setStars(0);
      setSubmitted(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Zurücksetzen nach 2 Sekunden
      setTimeout(() => {
        setSubmitted(false);
      }, 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={styles.keyboardAvoiding}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
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
        />

        {/* Nur anzeigen, wenn NICHT submitted */}
        {!submitted && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[theme].accent2 }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Absenden</Text>
          </TouchableOpacity>
        )}

        {/* Lottie-Animationen */}
        {submitted && (
          <LottieView
            ref={checkRef}
            source={require('../assets/animations/check.json')}
            style={styles.checkmark}
            loop={false}
          />
        )}

        {submitted && (
          <LottieView
            ref={confettiRef}
            source={require('../assets/animations/confetti.json')}
            style={styles.confetti}
            loop={false}
          />
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
  button: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  },
});
