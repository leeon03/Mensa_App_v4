import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import Avatar from '../components/Avatar';
import * as Animatable from 'react-native-animatable';
import ProfileSection from '../components/profile/profileSection';
import PersonalInfoSection from '../components/profile/personalInfoSection';
import NotificationSection from '../components/profile/notificationSection';
import PasswordSection from '../components/profile/passwortSection';

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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [notifyFavs, setNotifyFavs] = useState(true);
  const [notifyNews, setNotifyNews] = useState(false);
  const [userId, setUserId] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);

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

      const { count, error: favError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!favError) {
        setFavoritesCount(count || 0);
      }
    };

    loadUserData();
  }, []);

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

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Animatable.Text
        animation="fadeInDown"
        duration={700}
        delay={100}
        style={[styles.title, { color: Colors[theme].text }]}
      >
        Profil
      </Animatable.Text>

      <Avatar
        name={name}
        avatarUri={userAvatar}
        userId={userId}
        onUpload={(url) => setUserAvatar(url)}
      />

      <PersonalInfoSection
        name={name}
        email={email}
        createdAt={createdAt}
        favoritesCount={favoritesCount}
      />

      <NotificationSection
        notifyFavs={notifyFavs}
        notifyNews={notifyNews}
        setNotifyFavs={setNotifyFavs}
        setNotifyNews={setNotifyNews}
      />

      <PasswordSection
        newPassword={newPassword}
        repeatPassword={repeatPassword}
        setNewPassword={setNewPassword}
        setRepeatPassword={setRepeatPassword}
        onChangePassword={handlePasswordChange}
      />

      <ProfileSection title="App-Verwaltung">
        <TouchableOpacity onPress={updateProfile} style={[styles.saveButton, { backgroundColor: Colors[theme].primary }]}>
          <Text style={styles.saveButtonText}>💾 Profil speichern</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearStorage} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>🗑️ AsyncStorage zurücksetzen</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: Colors[theme].primary }]}>
          <Text style={styles.logoutButtonText}>🚪 Abmelden</Text>
        </TouchableOpacity>
      </ProfileSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
