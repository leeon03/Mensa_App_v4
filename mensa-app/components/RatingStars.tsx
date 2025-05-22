import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import * as Haptics from 'expo-haptics'; // ✅ Haptics importieren

type Props = {
  value: number;
  editable?: boolean;
  onChange?: (value: number) => void;
};

export default function RatingStars({ value, editable = false, onChange }: Props) {
  const theme = useColorScheme() || 'light';

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

    // ✅ Haptisches Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onChange) onChange(index + 1);
    bounce(index);
  };

  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <TouchableOpacity key={i} onPress={() => handlePress(i)} disabled={!editable}>
            <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={24}
                color={filled ? Colors[theme].accent2 : Colors[theme].icon}
              />
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
