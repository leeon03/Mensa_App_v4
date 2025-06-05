import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAGS = [
  { key: 'vegan', label: 'Vegan', icon: '🌱' },
  { key: 'vegetarisch', label: 'Vegetarisch', icon: '🥦' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', icon: '🍖' },
  { key: 'fischhaltig', label: 'Fischhaltig', icon: '🐟' },
  { key: 'glutenfrei', label: 'Glutenfrei', icon: '🚫🌾' },
  { key: 'leicht', label: 'Leicht', icon: '🌤️' },
  { key: 'scharf', label: 'Scharf', icon: '🌶️' },
  { key: 'beliebt', label: 'Beliebt', icon: '🔥' },
  { key: 'favorit', label: 'Favorit', iconComponent: <Ionicons name="heart" size={14} color="red" /> },
  { key: 'erinnerung', label: 'Erinnerung', iconComponent: <Ionicons name="notifications" size={14} color="#007AFF" /> },
];

export default function Legende() {
  const [expanded, setExpanded] = useState(true);
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColor.surface }]}>
      <TouchableOpacity onPress={toggleExpanded} style={styles.header}>
        <Text style={[styles.headerText, { color: themeColor.text }]}>Legende</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColor.text}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.tagsWrapper}>
          {TAGS.map((tag) => (
            <View key={tag.key} style={styles.tagChip}>
              {tag.iconComponent ? tag.iconComponent : <Text style={styles.emoji}>{tag.icon}</Text>}
              <Text style={styles.chipText}>{tag.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
  },
  emoji: {
    fontSize: 14,
  },
});
