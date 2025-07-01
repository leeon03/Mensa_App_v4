import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';

interface Props {
  name: string;
  email: string;
  createdAt: string;
  favoritesCount: number;
}

const PersonalInfoSection: React.FC<Props> = ({
  name,
  email,
  createdAt,
  favoritesCount,
}) => {
  const theme = useColorScheme() || 'light';

  return (
    <ProfileSection title="Persönliche Daten" initiallyExpanded>
      <Text style={[styles.infoText, { color: Colors[theme].text }]}>
        Name: {name}
      </Text>
      <Text style={[styles.infoText, { color: Colors[theme].text }]}>
        E-Mail: {email}
      </Text>
      <Text style={[styles.infoText, { color: Colors[theme].text }]}>
        Mitglied seit: {createdAt}
      </Text>
      <Text style={[styles.infoText, { color: Colors[theme].text }]}>
        Favoriten: {favoritesCount}
      </Text>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default PersonalInfoSection;
