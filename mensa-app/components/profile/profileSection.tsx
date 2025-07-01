// components/ProfileSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  showDivider?: boolean;
}

const ProfileSection: React.FC<Props> = ({
  title,
  children,
  initiallyExpanded = false,
  showDivider = true,
}) => {
  const theme = useColorScheme() || 'light';
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.wrapper, showDivider && { borderBottomWidth: 1, borderColor: '#ccc' }]}>
      <TouchableOpacity onPress={toggleExpanded} style={styles.header}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          {expanded ? '⌄' : '›'} {title}
        </Text>
      </TouchableOpacity>

      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    width: '100%',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    marginTop: 12,
  },
});

export default ProfileSection;
