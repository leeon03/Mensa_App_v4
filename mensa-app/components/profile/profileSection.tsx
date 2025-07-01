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

interface Props {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
}

const ProfileSection: React.FC<Props> = ({ title, children, initiallyExpanded = false }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const theme = useColorScheme() || 'light';

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: Colors[theme].border,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 18, color: Colors[theme].text, fontWeight: '600' }}>
          {expanded ? '⌄' : '›'} {title}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: 18, paddingTop: 12 }}>{children}</View>
      )}
    </View>
  );
};

export default ProfileSection;
