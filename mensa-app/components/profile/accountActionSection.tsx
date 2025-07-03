import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import ProfileSection from '../profile/profileSection';

interface Props {
  onSave: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const AccountActionsSection: React.FC<Props> = ({
  onSave,
  onLogout,
  onDeleteAccount,
}) => {
  const theme = useColorScheme() || 'light';
  const isDark = theme === 'dark';

  const backgroundColor = isDark ? '#ffffff' : '#000000';
  const textColor = isDark ? '#000000' : '#ffffff';

  return (
    <ProfileSection title="App-Verwaltung">
      <TouchableOpacity
        onPress={onSave}
        style={[styles.button, { backgroundColor }]}
        activeOpacity={0.9}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          ✏️ Profil aktualisieren
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogout}
        style={[styles.button, { backgroundColor }]}
        activeOpacity={0.9}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          🚪 Abmelden
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDeleteAccount}
        style={[styles.button, { backgroundColor }]}
        activeOpacity={0.9}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>
          🗑 Konto löschen
        </Text>
      </TouchableOpacity>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountActionsSection;