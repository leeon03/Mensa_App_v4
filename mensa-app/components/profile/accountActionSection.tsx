import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';

interface Props {
  onSave: () => void;
  onClearStorage: () => void;
  onLogout: () => void;
}

const AccountActionsSection: React.FC<Props> = ({
  onSave,
  onClearStorage,
  onLogout,
}) => {
  const theme = useColorScheme() || 'light';

  return (
    <ProfileSection title="App-Verwaltung">
      <TouchableOpacity
        onPress={onSave}
        style={[styles.saveButton, { backgroundColor: Colors[theme].primary }]}
      >
        <Text style={styles.buttonText}>💾 Profil speichern</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClearStorage} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>🗑️ AsyncStorage zurücksetzen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogout}
        style={[styles.logoutButton, { backgroundColor: Colors[theme].primary }]}
      >
        <Text style={styles.buttonText}>🚪 Abmelden</Text>
      </TouchableOpacity>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ddd',
    borderRadius: 10,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});

export default AccountActionsSection;
