import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  LayoutAnimation,
  Alert,
  ScrollView,
  Platform,
  UIManager,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const theme = useColorScheme() || 'light';

  const [editOpen, setEditOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [name, setName] = useState('Max Mustermann');
  const [email, setEmail] = useState('max@beispiel.de');
  const [notifyFavs, setNotifyFavs] = useState(true);
  const [notifyNews, setNotifyNews] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const toggleEdit = () => {
    LayoutAnimation.easeInEaseOut();
    setEditOpen(!editOpen);
  };

  const toggleNotify = () => {
    LayoutAnimation.easeInEaseOut();
    setNotifyOpen(!notifyOpen);
  };

  const clearStorage = () => {
    Alert.alert('App zurücksetzen', 'Alle gespeicherten Daten wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('Erledigt', 'Daten wurden gelöscht.');
        },
      },
    ]);
  };

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !repeatPassword) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }
    if (newPassword !== repeatPassword) {
      Alert.alert('Fehler', 'Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    Alert.alert('Erfolg', 'Das Passwort wurde geändert.');
    setOldPassword('');
    setNewPassword('');
    setRepeatPassword('');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Ionicons name="person-circle" size={100} color={Colors[theme].primary} style={styles.icon} />
      <Text style={[styles.title, { color: Colors[theme].text }]}>Dein Profil</Text>
      <Text style={[styles.name, { color: Colors[theme].text }]}>{name}</Text>
      <Text style={[styles.email, { color: Colors[theme].text }]}>{email}</Text>

      <View style={[styles.infoBox, { backgroundColor: Colors[theme].card }]}>
        <Text style={[styles.infoText, { color: Colors[theme].text }]}>Mitglied seit: Januar 2024</Text>
        <Text style={[styles.infoText, { color: Colors[theme].text }]}>Favorisierte Gerichte: 12</Text>
      </View>

      <TouchableOpacity onPress={toggleEdit} style={styles.button}>
        <Text style={styles.buttonText}>📝 Profil bearbeiten</Text>
      </TouchableOpacity>
      {editOpen && (
        <View style={[styles.panelModern, { backgroundColor: Colors[theme].surface, shadowColor: Colors[theme].primary }]}>
          <Text style={[styles.panelTitle, { color: Colors[theme].text }]}>Profilinformationen</Text>
          <TextInput
            style={[styles.inputModern, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={[styles.inputModern, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="E-Mail"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
          />

          <Text style={[styles.panelTitle, { color: Colors[theme].text, marginTop: 16 }]}>🔐 Passwort ändern</Text>
          <TextInput
            style={[styles.inputModern, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
            placeholder="Aktuelles Passwort"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TextInput
            style={[styles.inputModern, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
            placeholder="Neues Passwort"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={[styles.inputModern, { borderColor: Colors[theme].primary, color: Colors[theme].text }]}
            placeholder="Neues Passwort wiederholen"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
          />
          <TouchableOpacity
            onPress={handlePasswordChange}
            style={[styles.saveButton, { backgroundColor: Colors[theme].primary }]}
          >
            <Text style={styles.saveButtonText}>💾 Änderungen speichern</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={toggleNotify} style={styles.button}>
        <Text style={styles.buttonText}>🔔 Benachrichtigungen verwalten</Text>
      </TouchableOpacity>
      {notifyOpen && (
        <View style={[styles.panel, { backgroundColor: Colors[theme].surface }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: Colors[theme].text }]}>Bei Favoriten erinnern</Text>
            <Switch value={notifyFavs} onValueChange={setNotifyFavs} />
          </View>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: Colors[theme].text }]}>App-Neuigkeiten</Text>
            <Switch value={notifyNews} onValueChange={setNotifyNews} />
          </View>
        </View>
      )}

      <TouchableOpacity onPress={clearStorage} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>🗑️ AsyncStorage zurücksetzen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
  },
  infoBox: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  panel: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
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
  panelModern: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputModern: {
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
