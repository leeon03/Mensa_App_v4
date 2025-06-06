// components/IntroModal.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface IntroModalProps {
  visible: boolean;
  step: number;
  onNextStep: () => void;
  onDismiss: () => void;
}

export default function IntroModal({
  visible,
  step,
  onNextStep,
  onDismiss,
}: IntroModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.matchContainer}>
        <BlurView intensity={40} tint="dark" style={styles.matchCard}>
          <Text style={[styles.matchTitle, { color: 'white' }]}>
            👋 Na, heiß auf was Leckeres?
          </Text>
          <Animated.View style={{ opacity: fadeAnim, marginTop: 20 }}>
            {step === 1 && (
              <Text style={[styles.description, { color: 'white' }]}>
                1️⃣ Swipe nach rechts, um ein Gericht zu liken.
              </Text>
            )}
            {step === 2 && (
              <Text style={[styles.description, { color: 'white' }]}>
                2️⃣ Swipe nach links, um ein Gericht zu überspringen.
              </Text>
            )}
            {step === 3 && (
              <Text style={[styles.description, { color: 'white' }]}>
                3️⃣ Deine Favoriten findest du später gesammelt.
              </Text>
            )}
          </Animated.View>
          <View style={styles.introControls}>
            {step < 3 ? (
              <TouchableOpacity onPress={onNextStep} style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={28} color="#2ecc71" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onDismiss} style={styles.startButton}>
                <Text style={styles.startButtonText}>Los geht’s!</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onDismiss} style={{ marginTop: 20 }}>
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                textDecorationLine: 'underline',
              }}
            >
              Nicht mehr anzeigen
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  matchContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchCard: {
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    overflow: 'hidden',
  },
  matchTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  description: {
    fontSize: 16,
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  introControls: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  startButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
