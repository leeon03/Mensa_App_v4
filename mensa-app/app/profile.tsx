import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar'; // 🔁 Import Avatar-Komponente

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ProfileContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function ProfileContent() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [notifyFavs, setNotifyFavs] = useState(true);
  const [notifyNews, setNotifyNews] = useState(false);
  const [userId, setUserId] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert('Fehler beim Laden der Benutzerdaten');
        return;
      }

      const fullName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
      setName(fullName);
      setEmail(user.email || '');
      setCreatedAt(new Date(user.created_at).toLocaleDateString('de-DE'));
      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (!profileError && profile?.avatar_url) {
        setUserAvatar(profile.avatar_url);
      }
    };

    loadUserData();
  }, []);

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

  const updateProfile = async () => {
    const [first_name, ...lastParts] = name.split(' ');
    const last_name = lastParts.join(' ') || '';

    const { error } = await supabase.auth.updateUser({
      email,
      data: {
        first_name,
        last_name,
        display_name: name,
      },
    });

    if (error) {
      Alert.alert('Fehler', error.message);
      return;
    }

    Alert.alert('Erfolg', 'Profil wurde aktualisiert.');
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !repeatPassword) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }

    if (newPassword !== repeatPassword) {
      Alert.alert('Fehler', 'Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Alert.alert('Fehler', error.message);
      return;
    }

    Alert.alert('Erfolg', 'Passwort wurde geändert.');
    setNewPassword('');
    setRepeatPassword('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Avatar
        name={name}
        avatarUri={userAvatar}
        userId={userId}
        onUpload={(url) => setUserAvatar(url)}
      />
      <Text style={[styles.title, { color: Colors[theme].text }]}>Dein Profil</Text>
      <Text style={[styles.name, { color: Colors[theme].text }]}>{name}</Text>
      <Text style={[styles.email, { color: Colors[theme].text }]}>{email}</Text>

      <View style={[styles.infoBox, { backgroundColor: Colors[theme].card }]}>
        <Text style={[styles.infoText, { color: Colors[theme].text }]}>Mitglied seit: {createdAt}</Text>
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
          <TouchableOpacity
            onPress={updateProfile}
            style={[styles.saveButton, { backgroundColor: Colors[theme].primary }]}
          >
            <Text style={styles.saveButtonText}>💾 Änderungen speichern</Text>
          </TouchableOpacity>

          <Text style={[styles.panelTitle, { color: Colors[theme].text, marginTop: 16 }]}>🔐 Passwort ändern</Text>
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
            <Text style={styles.saveButtonText}>🔁 Passwort speichern</Text>
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

      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: Colors[theme].primary }]}
      >
        <Text style={styles.logoutButtonText}>🚪 Abmelden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  name: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email: { fontSize: 16, marginBottom: 20 },
  infoBox: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  infoText: { fontSize: 16, marginBottom: 8 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: { fontWeight: '600', textAlign: 'center', fontSize: 16 },
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
  switchLabel: { fontSize: 16 },
  resetButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ddd',
    borderRadius: 10,
    alignSelf: 'center',
  },
  resetButtonText: { color: '#000', fontWeight: 'bold' },
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
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  panelTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
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
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
