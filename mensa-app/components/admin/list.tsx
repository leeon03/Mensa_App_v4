// components/ListItem.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

type ListItemProps = {
  name: string;
  anzeigename: string;
  onPress?: () => void;
};

const ListItem: React.FC<ListItemProps> = ({
  name,
  anzeigename,
  onPress,
}) => {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  return (
    <Pressable onPress={onPress} style={[styles.container, { backgroundColor: themeColor.card }]}>
      <Text style={[styles.text, { color: themeColor.text }]}>{anzeigename}</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});

export default ListItem;
