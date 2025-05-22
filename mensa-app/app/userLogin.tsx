import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// ✅ Supabase importieren
import { supabase } from '../constants/supabase'; // Pfad ggf. anpassen

export default function UserLoginScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login fehlgeschlagen', error.message);
      return;
    }

    // ✅ Eingeloggt – weiterleiten
    router.replace('/startseite');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: Colors[theme].background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: '#63a53d' }]}>
          Benutzer Login
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[theme].surface,
              color: Colors[theme].text,
              borderColor: emailFocused ? '#63a53d' : Colors[theme].icon,
            },
          ]}
          placeholder="E-Mail"
          placeholderTextColor={Colors[theme].icon}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[theme].surface,
              color: Colors[theme].text,
              borderColor: passwordFocused ? '#63a53d' : Colors[theme].icon,
            },
          ]}
          placeholder="Passwort"
          placeholderTextColor={Colors[theme].icon}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#63a53d' }]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Einloggen</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
