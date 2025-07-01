import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
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
  const colorTheme = Colors[theme];

  const renderItem = (label: string, value: string | number) => (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colorTheme.icon }]}>{label}</Text>
      <Text style={[styles.value, { color: colorTheme.text }]}>{value}</Text>
    </View>
  );

  return (
    <ProfileSection title="Persönliche Daten" initiallyExpanded>
      {renderItem('Name', name)}
      {renderItem('E-Mail', email)}
      {renderItem('Mitglied seit', createdAt)}
      {renderItem('Favoriten', favoritesCount)}
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default PersonalInfoSection;
