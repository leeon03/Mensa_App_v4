import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

interface MatchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.container}>
        <BlurView intensity={40} tint="light" style={styles.card}>
          <Text style={styles.title}>✨ It's a Match!</Text>

          <LottieView
            source={require('../../assets/animations/match.json')}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.hint}>Zum Fortfahren tippen</Text>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
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
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  lottie: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  hint: {
    marginTop: 20,
    fontSize: 15,
    color: '#2ecc71',
    fontStyle: 'italic',
  },
});
