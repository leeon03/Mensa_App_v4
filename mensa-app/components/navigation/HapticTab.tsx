import React from 'react';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function HapticTab({ children, onPress, accessibilityState }: BottomTabBarButtonProps) {
  const isSelected = accessibilityState?.selected;

  const handlePress = (event: GestureResponderEvent) => {
    if (!isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event); // ✅ richtig mit Event übergeben
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
}
