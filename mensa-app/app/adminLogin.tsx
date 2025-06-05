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
import { supabase } from '../constants/supabase';

const ADMIN_CODE = 'GEHEIM1234'; // 🔐 Dein Admin-Code

export default function AdminLoginScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password || !adminCode) {
      Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
      return;
    }

    if (adminCode !== ADMIN_CODE) {
      Alert.alert('Fehler', 'Ungültiger Admin-Code.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      Alert.alert('Fehler beim Login', error?.message || 'Unbekannter Fehler');
      return;
    }

    const { user } = data;

    // 🔒 Prüfen, ob Rolle wirklich "admin" ist
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      Alert.alert('Zugriff verweigert', 'Du bist kein Admin.');
      return;
    }

    // ✅ Login erfolgreich, Admin bestätigt
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
        <Text style={[styles.title, { color: '#fdc128' }]}>Admin Login</Text>

        <TextInput
          style={[styles.input, {
            backgroundColor: Colors[theme].surface,
            color: Colors[theme].text,
            borderColor: focusedField === 'email' ? '#fdc128' : Colors[theme].icon,
          }]}
          placeholder="Admin-E-Mail"
          placeholderTextColor={Colors[theme].icon}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: Colors[theme].surface,
            color: Colors[theme].text,
            borderColor: focusedField === 'password' ? '#fdc128' : Colors[theme].icon,
          }]}
          placeholder="Passwort"
          placeholderTextColor={Colors[theme].icon}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: Colors[theme].surface,
            color: Colors[theme].text,
            borderColor: focusedField === 'adminCode' ? '#fdc128' : Colors[theme].icon,
          }]}
          placeholder="Admin-Code"
          placeholderTextColor={Colors[theme].icon}
          secureTextEntry
          value={adminCode}
          onChangeText={setAdminCode}
          onFocus={() => setFocusedField('adminCode')}
          onBlur={() => setFocusedField(null)}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#fdc128' }]}
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
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});
