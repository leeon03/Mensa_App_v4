import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';

interface Props {
  newPassword: string;
  repeatPassword: string;
  setNewPassword: (value: string) => void;
  setRepeatPassword: (value: string) => void;
  onChangePassword: () => void;
}

const PasswordSection: React.FC<Props> = ({
  newPassword,
  repeatPassword,
  setNewPassword,
  setRepeatPassword,
  onChangePassword,
}) => {
  const theme = useColorScheme() || 'light';

  return (
    <ProfileSection title="Sicherheit & Passwort">
      <TextInput
        style={[styles.input, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
        placeholder="Neues Passwort"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={[styles.input, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
        placeholder="Neues Passwort wiederholen"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={repeatPassword}
        onChangeText={setRepeatPassword}
      />
      <TouchableOpacity
        onPress={onChangePassword}
        style={[styles.saveButton, { backgroundColor: Colors[theme].primary }]}
      >
        <Text style={styles.saveButtonText}>🔁 Passwort speichern</Text>
      </TouchableOpacity>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  saveButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PasswordSection;
