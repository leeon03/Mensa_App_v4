import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
}

const ProfileSection: React.FC<Props> = ({
  title,
  children,
  initiallyExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const theme = useColorScheme() || 'light';

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={[
          styles.header,
          {
            backgroundColor: 'transparent',
            borderColor: Colors[theme].border,
          },
        ]}
        activeOpacity={0.8}
      >
        <Ionicons
          name={expanded ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={Colors[theme].text}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.titleText, { color: Colors[theme].text }]}>
          {title}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.content, { backgroundColor: Colors[theme].background }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default ProfileSection;
