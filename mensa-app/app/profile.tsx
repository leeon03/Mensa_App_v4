import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  UIManager,
  View,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import * as Animatable from 'react-native-animatable';

import PersonalInfoSection from '../components/profile/personalInfoSection';
import NotificationSection from '../components/profile/notificationSection';
import PasswordSection from '../components/profile/passwortSection';
import AccountActionsSection from '../components/profile/accountActionSection';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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
  const [userId, setUserId] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

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

      if (!profileError) {
        setUserAvatar(profile?.avatar_url ?? null);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Konto löschen',
      'Bist du sicher? Dieser Vorgang kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.rpc('delete_current_user');
            if (error) {
              Alert.alert('Fehler', 'Konto konnte nicht gelöscht werden.');
              return;
            }
            Alert.alert('Konto gelöscht', 'Du wurdest abgemeldet.');
            router.replace('/');
          },
        },
      ]
    );
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

  const handleSaveName = async (newName: string) => {
    const [first_name, ...lastParts] = newName.split(' ');
    const last_name = lastParts.join(' ') || '';

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name,
        last_name,
        display_name: newName,
      },
    });

    if (error) {
      Alert.alert('Fehler', error.message);
      return;
    }

    setName(newName);
    Alert.alert('Erfolg', 'Name wurde gespeichert.');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <Animatable.Text
        animation="fadeInDown"
        duration={700}
        delay={100}
        style={[styles.title, { color: Colors[theme].text }]}
      >
        Profil
      </Animatable.Text>

      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Avatar
          key={avatarKey}
          name={name}
          avatarUri={userAvatar}
          userId={userId}
          onUpload={(url) => {
            setUserAvatar(url); // url kann null sein, wenn Bild gelöscht wird
            setAvatarKey((prev) => prev + 1); // erzwingt re-render
          }}
        />
      </View>

      <PersonalInfoSection
        name={name}
        email={email}
        createdAt={createdAt}
        favoritesCount={favoritesCount}
        onSaveName={handleSaveName}
      />

      <NotificationSection userId={userId} />

      <PasswordSection
        newPassword={newPassword}
        repeatPassword={repeatPassword}
        setNewPassword={setNewPassword}
        setRepeatPassword={setRepeatPassword}
        onChangePassword={handlePasswordChange}
      />

      <AccountActionsSection
        onSave={updateProfile}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
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
});
