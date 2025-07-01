import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';
import { supabase } from '../../constants/supabase';

interface Props {
  userId: string;
}

const NotificationSection: React.FC<Props> = ({ userId }) => {
  const theme = useColorScheme() || 'light';
  const [seenIntro, setSeenIntro] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    if (!userId) return; // ⛔ Skip if userId not set

    const loadFlags = async () => {
      const { data, error } = await supabase
        .from('intro_flags')
        .select('seen_intro, onboarding_seen')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fehler beim Laden der Intro-Flags:', error);
        return;
      }

      if (data) {
        setSeenIntro(data.seen_intro);
        setOnboardingSeen(data.onboarding_seen);
      }
    };

    loadFlags();
  }, [userId]);

  const updateFlags = async (field: 'seen_intro' | 'onboarding_seen', value: boolean) => {
    if (!userId) return;

    const { error } = await supabase
      .from('intro_flags')
      .upsert({ user_id: userId, [field]: value }, { onConflict: 'user_id' });

    if (error) {
      Alert.alert('Fehler', 'Konnte Status nicht speichern.');
      return;
    }

    if (field === 'seen_intro') setSeenIntro(value);
    if (field === 'onboarding_seen') setOnboardingSeen(value);
  };

  return (
    <ProfileSection title="Intros ansehen">
      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].text }]}>Intro gesehen</Text>
        <Switch
          value={seenIntro}
          onValueChange={(value) => updateFlags('seen_intro', value)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].text }]}>Onboarding abgeschlossen</Text>
        <Switch
          value={onboardingSeen}
          onValueChange={(value) => updateFlags('onboarding_seen', value)}
        />
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default NotificationSection;
