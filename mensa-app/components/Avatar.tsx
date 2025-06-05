import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type AvatarProps = {
  name: string;
  avatarUri?: string;
  size?: number;
};

export default function Avatar({ name, avatarUri, size = 32 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.initialsCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initialsCircle: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: '600',
  },
});
