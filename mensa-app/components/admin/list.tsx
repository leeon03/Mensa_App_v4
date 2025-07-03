// components/ListItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

type ListItemProps = {
  name: string;
  anzeigename: string;
  isFavorite: boolean;
  isAlert: boolean;
  onFavoritePress: () => void;
  onAlertPress: () => void;
  onPress?: () => void;
};

const ListItem: React.FC<ListItemProps> = ({
  name,
  anzeigename,
  isFavorite,
  isAlert,
  onFavoritePress,
  onAlertPress,
  onPress,
}) => {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  const handleFavoritePress = async () => {
    if (!isFavorite) {
      triggerHaptic();
      await playSound(require('../../assets/sounds/heart.wav'));
    }
    onFavoritePress();
  };

  const handleAlertPress = async () => {
    if (!isAlert) {
      triggerHaptic();
      await playSound(require('../../assets/sounds/glocke.wav'));
    }
    onAlertPress();
  };

  return (
    <Pressable onPress={onPress} style={[styles.container, { backgroundColor: themeColor.card }]}>
      <Text style={[styles.text, { color: themeColor.text }]}>{anzeigename}</Text>
      <View style={styles.icons}>
        <Pressable onPress={handleFavoritePress} style={styles.iconButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#e74c3c' : themeColor.text}
          />
        </Pressable>
        <Pressable onPress={handleAlertPress} style={[styles.iconButton, { marginLeft: 8 }]}>
          <Ionicons
            name={isAlert ? 'notifications' : 'notifications-outline'}
            size={20}
            color={isAlert ? '#FFD700' : themeColor.text}
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
});

export default ListItem;
