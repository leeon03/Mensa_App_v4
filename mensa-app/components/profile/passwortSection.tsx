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
  const colorTheme = Colors[theme];

  return (
    <ProfileSection title="Sicherheit & Passwort">
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colorTheme.border,
            color: colorTheme.text,
            backgroundColor: colorTheme.surface,
          },
        ]}
        placeholder="Neues Passwort"
        placeholderTextColor={colorTheme.icon}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colorTheme.border,
            color: colorTheme.text,
            backgroundColor: colorTheme.surface,
          },
        ]}
        placeholder="Neues Passwort wiederholen"
        placeholderTextColor={colorTheme.icon}
        secureTextEntry
        value={repeatPassword}
        onChangeText={setRepeatPassword}
      />
      <TouchableOpacity
        onPress={onChangePassword}
        style={[
          styles.saveButton,
          {
            backgroundColor: theme === 'dark' ? '#FFFFFF' : '#000000',
          },
        ]}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.saveButtonText,
            {
              color: theme === 'dark' ? '#000000' : '#FFFFFF',
            },
          ]}
        >
          🔒 Passwort speichern
        </Text>
      </TouchableOpacity>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PasswordSection;
