import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import * as Haptics from 'expo-haptics';

type Props = {
  value: number;
  editable?: boolean;
  onChange?: (value: number) => void;
  customColor?: string; // 👈 NEU: Individuelle Farbwahl
};

export default function RatingStars({
  value,
  editable = false,
  onChange,
  customColor,
}: Props) {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const scales = React.useRef(
    Array.from({ length: 5 }, () => new Animated.Value(1))
  ).current;

  const bounce = (index: number) => {
    Animated.sequence([
      Animated.timing(scales[index], {
        toValue: 1.4,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (index: number) => {
    if (!editable) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange?.(index + 1);
    bounce(index);
  };

  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        const iconName = filled ? 'star' : 'star-outline';
        const color = customColor
          ? customColor
          : filled
          ? themeColor.accent2
          : themeColor.icon;

        return (
          <TouchableOpacity
            key={i}
            onPress={() => handlePress(i)}
            disabled={!editable}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
              <Ionicons name={iconName} size={24} color={color} />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  starRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
});
