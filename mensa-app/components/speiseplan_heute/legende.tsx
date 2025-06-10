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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAGS = [
  {
    key: 'vegan',
    label: 'Vegan',
    icon: <MaterialCommunityIcons name="leaf" size={14} color="#000" />,
    color: '#A5D6A7',
  },
  {
    key: 'vegetarisch',
    label: 'Vegetarisch',
    icon: <MaterialCommunityIcons name="food-apple" size={14} color="#000" />,
    color: '#C5E1A5',
  },
  {
    key: 'leicht',
    label: 'Leicht',
    icon: <Ionicons name="sunny" size={14} color="#000" />,
    color: '#FFF59D',
  },
  {
  key: 'glutenfrei',
  label: 'Glutenfrei',
  icon: <Ionicons name="ban" size={14} color="#000" />,
  color: '#FFE082',
},
{
  key: 'scharf',
  label: 'Scharf',
  icon: <Ionicons name="flame" size={14} color="#000" />,
  color: '#EF9A9A',
},
  {
    key: 'fleischhaltig',
    label: 'Fleischhaltig',
    icon: <MaterialCommunityIcons name="cow" size={14} color="#000" />,
    color: '#E57373',
  },
  {
    key: 'fischhaltig',
    label: 'Fischhaltig',
    icon: <MaterialCommunityIcons name="fish" size={14} color="#000" />,
    color: '#81D4FA',
  },
  {
    key: 'beliebt',
    label: 'Beliebt',
    icon: <Ionicons name="flame" size={14} color="#000" />,
    color: '#F48FB1',
  },
  {
    key: 'favorit',
    label: 'Favorit',
    icon: <Ionicons name="heart" size={14} color="#000" />,
    color: '#F06292',
  },
  {
    key: 'erinnerung',
    label: 'Erinnerung',
    icon: <Ionicons name="notifications" size={14} color="#000" />,
    color: '#B0BEC5',
  },
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
    <View style={[styles.container, { backgroundColor: themeColor.card }]}>
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
            <View
              key={tag.key}
              style={[styles.tagChip, { backgroundColor: tag.color }]}
            >
              {tag.icon}
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
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
    color: '#000',
    marginLeft: 6,
  },
});
