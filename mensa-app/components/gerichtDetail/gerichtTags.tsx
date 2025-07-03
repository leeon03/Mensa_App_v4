import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const TAGS = [
  { key: 'vegan', label: 'Vegan', icon: 'leaf', color: '#A5D6A7' },
  { key: 'vegetarisch', label: 'Vegetarisch', icon: 'food-apple', color: '#C5E1A5' },
  { key: 'leicht', label: 'Leicht', icon: 'sunny', color: '#FFF59D' },
  { key: 'glutenfrei', label: 'Glutenfrei', icon: 'ban', color: '#FFE082' },
  { key: 'scharf', label: 'Scharf', icon: 'chili-hot', color: '#EF9A9A' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', icon: 'cow', color: '#E57373' },
  { key: 'fischhaltig', label: 'Fischhaltig', icon: 'fish', color: '#81D4FA' },
  { key: 'beliebt', label: 'Beliebt', icon: 'flame', color: '#F48FB1' },
  { key: 'favorit', label: 'Favorit', icon: 'heart', color: '#F06292' },
  { key: 'erinnerung', label: 'Erinnerung', icon: 'notifications', color: '#B0BEC5' },
];

const getPastellBackground = (hex: string, theme: string) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = theme === 'dark' ? -20 : 40;
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `rgb(${R},${G},${B})`;
};

export default function GerichtTags({ tags, theme, themeColor }: { tags: string[], theme: string, themeColor: any }) {
  if (!tags?.length) return null;

  return (
    <View style={styles.tagsContainer}>
      {tags.map((tag: string) => {
        const tagData = TAGS.find(t => t.key === tag);
        if (!tagData) return null;

        const IconComponent = ['sunny', 'ban', 'flame', 'heart', 'notifications'].includes(tagData.icon)
          ? Ionicons
          : MaterialCommunityIcons;

        return (
          <View key={tag} style={[styles.tagChip, { backgroundColor: getPastellBackground(tagData.color, theme) }]}>
            <IconComponent name={tagData.icon as any} size={14} color={themeColor.text} />
            <Text style={[styles.chipText, { color: themeColor.text }]}>{tagData.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    marginLeft: 6,
  },
});