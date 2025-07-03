import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  View,
  Modal,
  Button,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';

interface Props {
  onChangePassword: (newPassword: string) => void;
}

const PasswordSection: React.FC<Props> = ({ onChangePassword }) => {
  const theme = useColorScheme() || 'light';
  const colorTheme = Colors[theme];

  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSave = () => {
    if (newPassword === repeatPassword && newPassword.trim().length > 0) {
      onChangePassword(newPassword);
      setModalVisible(false);
      setNewPassword('');
      setRepeatPassword('');
    } else {
      // Optional: Fehleranzeige einbauen
      alert('Die Passwörter stimmen nicht überein oder sind leer.');
    }
  };

  return (
    <>
      <ProfileSection title="Sicherheit & Passwort">
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: colorTheme.tint }]}>🔒 Passwort ändern</Text>
        </TouchableOpacity>
      </ProfileSection>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: colorTheme.background }]}>
            <Text style={[styles.modalTitle, { color: colorTheme.text }]}>Neues Passwort</Text>
            <TextInput
              style={[styles.input, { color: colorTheme.text, borderColor: colorTheme.icon }]}
              placeholder="Neues Passwort"
              placeholderTextColor={colorTheme.icon}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={[styles.input, { color: colorTheme.text, borderColor: colorTheme.icon }]}
              placeholder="Wiederholen"
              placeholderTextColor={colorTheme.icon}
              secureTextEntry
              value={repeatPassword}
              onChangeText={setRepeatPassword}
            />
            <View style={styles.modalButtons}>
              <Button title="Abbrechen" onPress={() => setModalVisible(false)} />
              <Button title="Speichern" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PasswordSection;
