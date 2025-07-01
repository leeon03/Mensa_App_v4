import React from 'react';
import { View, Text, Switch, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';

interface Props {
  notifyFavs: boolean;
  notifyNews: boolean;
  setNotifyFavs: (value: boolean) => void;
  setNotifyNews: (value: boolean) => void;
}

const NotificationSection: React.FC<Props> = ({
  notifyFavs,
  notifyNews,
  setNotifyFavs,
  setNotifyNews,
}) => {
  const theme = useColorScheme() || 'light';

  return (
    <ProfileSection title="Benachrichtigungen verwalten">
      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].text }]}>
          Bei Favoriten erinnern
        </Text>
        <Switch value={notifyFavs} onValueChange={setNotifyFavs} />
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: Colors[theme].text }]}>
          App-Neuigkeiten
        </Text>
        <Switch value={notifyNews} onValueChange={setNotifyNews} />
      </View>
    </ProfileSection>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
});

export default NotificationSection;
