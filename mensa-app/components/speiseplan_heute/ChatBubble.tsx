import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import RatingStars from './RatingStars';

type Props = {
  user: string;
  text: string;
  stars: number;
  timestamp: string;
  avatarUri?: string;
  loading?: boolean;
  own?: boolean;
  highlightColor?: string;
};

export default function ChatBubble({
  user,
  text,
  stars,
  timestamp,
  avatarUri,
  loading = false,
  own = false,
  highlightColor,
}: Props) {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const isDark = theme === 'dark';

  const bubbleColors = {
    backgroundColor: own
      ? highlightColor || themeColor.accent2
      : themeColor.surface,
    textColor: own ? '#fff' : themeColor.text,
    starColor: own
      ? '#fff'
      : highlightColor || themeColor.accent2,
    borderColor: isDark ? '#444' : '#ddd',
  };

  const initials = user
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const displayName = own ? 'Du' : user;

  const avatar = avatarUri ? (
    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
  ) : (
    <View style={styles.avatarInitials}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.row, own ? styles.alignRight : styles.alignLeft]}
    >
      {!own && avatar}

      <View style={{ maxWidth: '85%' }}>
        <Text
          style={[
            styles.userName,
            {
              color: themeColor.text,
              alignSelf: own ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          {displayName}
        </Text>

        <TouchableWithoutFeedback>
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: bubbleColors.backgroundColor,
                borderColor: bubbleColors.borderColor,
                alignSelf: own ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <View style={styles.starsWrapper}>
              <RatingStars
                value={stars}
                editable={false}
                customColor={bubbleColors.starColor}
              />
            </View>

            <Text
              style={[
                styles.messageText,
                {
                  color: own ? '#ffffff' : bubbleColors.textColor,
                  textAlign: own ? 'right' : 'left',
                },
              ]}
            >
              {text}
            </Text>

            <View style={styles.meta}>
              <Text style={[styles.timestamp, { color: bubbleColors.textColor }]}>
                {timestamp}
              </Text>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color={bubbleColors.textColor}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>

      {own && avatar}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.75,
    marginBottom: 4,
    marginHorizontal: 4,
  },
  bubble: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  starsWrapper: {
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignSelf: 'flex-end',
    marginRight: 8,
    marginLeft: 2,
  },
  avatarInitials: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 8,
    marginLeft: 2,
  },
  initialsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
