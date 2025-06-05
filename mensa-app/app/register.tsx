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

export default function RegisterScreen() {
  const theme = useColorScheme() || 'light';
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error || !data.user) {
      Alert.alert('Registrierung fehlgeschlagen', error?.message || 'Unbekannter Fehler');
      return;
    }

    const { user } = data;
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      role: role, // Speichert die ausgewählte Rolle
    });

    if (insertError) {
      console.error('Fehler beim Einfügen in users-Tabelle:', insertError);
    }

    Alert.alert('Erfolg', 'Bitte bestätige deine E-Mail-Adresse.');
    router.replace('/userLogin');
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
        <Text style={[styles.title, { color: '#fb8d30' }]}>Registrieren</Text>

        <TextInput
          style={[styles.input, {
            backgroundColor: Colors[theme].surface,
            color: Colors[theme].text,
            borderColor: focusedField === 'firstName' ? '#fb8d30' : Colors[theme].icon,
          }]}
          placeholder="Vorname"
          placeholderTextColor={Colors[theme].icon}
          value={firstName}
          onChangeText={setFirstName}
          onFocus={() => setFocusedField('firstName')}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: Colors[theme].surface,
            color: Colors[theme].text,
            borderColor: focusedField === 'lastName' ? '#fb8d30' : Colors[theme].icon,
          }]}
          placeholder="Nachname"
          placeholderTextColor={Colors[theme].icon}
          value={lastName}
          onChangeText={setLastName}
          onFocus={() => setFocusedField('lastName')}
          onBlur={() => setFocusedField(null)}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: Colors[theme].surface,
            color: Colors[theme].text,
            borderColor: focusedField === 'email' ? '#fb8d30' : Colors[theme].icon,
          }]}
          placeholder="E-Mail"
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
            borderColor: focusedField === 'password' ? '#fb8d30' : Colors[theme].icon,
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
            borderColor: focusedField === 'confirmPassword' ? '#fb8d30' : Colors[theme].icon,
          }]}
          placeholder="Passwort wiederholen"
          placeholderTextColor={Colors[theme].icon}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => setFocusedField('confirmPassword')}
          onBlur={() => setFocusedField(null)}
        />

        {/* Rollenwahl */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: role === 'user' ? '#fb8d30' : Colors[theme].icon,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 6,
              backgroundColor: role === 'user' ? '#fb8d30' : 'transparent',
            }}
            onPress={() => setRole('user')}
          >
            <Text style={{ color: role === 'user' ? '#fff' : Colors[theme].text }}>User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: role === 'admin' ? '#fb8d30' : Colors[theme].icon,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 6,
              backgroundColor: role === 'admin' ? '#fb8d30' : 'transparent',
            }}
            onPress={() => setRole('admin')}
          >
            <Text style={{ color: role === 'admin' ? '#fff' : Colors[theme].text }}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#fb8d30' }]}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Registrieren</Text>
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
