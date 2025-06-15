import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  findNodeHandle,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'; // Anpassen falls Pfad anders

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ZutatenTabelleProps {
  zutaten: string[];
  scrollViewRef?: React.RefObject<ScrollView>;
}

const ZutatenTabelle: React.FC<ZutatenTabelleProps> = ({ zutaten, scrollViewRef }) => {
  const [visible, setVisible] = useState(false);
  const parsedZutaten = Array.isArray(zutaten) ? zutaten : [];
  const animatedValues = useRef(parsedZutaten.map(() => new Animated.Value(0))).current;
  const boxRef = useRef<View>(null);

  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const toggleVisible = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setVisible(!visible);
  };

  useEffect(() => {
    if (visible) {
      const animations = animatedValues.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: i * 80,
          useNativeDriver: true,
        })
      );
      Animated.stagger(50, animations).start();

      setTimeout(() => {
        if (scrollViewRef?.current && boxRef.current) {
          boxRef.current.measureLayout(
            findNodeHandle(scrollViewRef.current) as number,
            (_x, y) => {
              scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
            },
            () => {}
          );
        }
      }, 300);
    } else {
      animatedValues.forEach(anim => anim.setValue(0));
    }
  }, [visible]);

  if (parsedZutaten.length === 0) return null;

  return (
    <View style={styles.container} ref={boxRef}>
      <TouchableOpacity onPress={toggleVisible} style={styles.toggleRow}>
        <Text style={[styles.sectionHeading, { color: themeColor.text }]}>
          Zutaten{' '}
          <Ionicons
            name={visible ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={themeColor.text}
          />
        </Text>
      </TouchableOpacity>

      {visible && (
        <View style={[styles.card, {
          backgroundColor: themeColor.card,
          shadowColor: themeColor.text,
        }]}>
          {parsedZutaten.map((item, index) => {
            const opacity = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            const translateY = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            });

            return (
              <Animated.View
                key={index}
                style={{
                  opacity,
                  transform: [{ translateY }],
                }}
              >
                <View style={styles.ingredientRow}>
                  <View style={[styles.bullet, { backgroundColor: themeColor.icon }]} />
                  <Text style={[styles.itemText, { color: themeColor.text }]}>{item}</Text>
                </View>
                {index < parsedZutaten.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: themeColor.border }]} />
                )}
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ZutatenTabelle;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 2,
  },
  itemText: {
    fontSize: 15,
    flexShrink: 1,
  },
  separator: {
    height: 1,
    marginLeft: 14,
  },
});
