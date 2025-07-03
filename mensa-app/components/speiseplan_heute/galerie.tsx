import React, { useState } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';

const { width } = Dimensions.get('window');

type Bewertung = {
  id: string;
  bild_url: string;
  text: string;
  stars: number;
  user: string;
  avatarUri?: string;
  timestamp?: string;
};

type Props = {
  bewertungen: Bewertung[];
};

export default function ImageGallery({ bewertungen }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Bewertung | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleImagePress = (item: Bewertung) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      // Double tap: Show modal with comment
      setSelected(item);
      setModalVisible(true);
    } else {
      // Single tap: Animate image
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
    setLastTap(now);
  };

  if (!bewertungen?.length) return null;

  return (
    <View style={styles.galleryWrapper}>
      <FlatList
        data={bewertungen.filter(b => !!b.bild_url)}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleImagePress(item)}
            style={styles.imageWrapper}
          >
            <Animated.Image
              source={{ uri: item.bild_url }}
              style={[styles.image, { transform: [{ scale: scaleAnim }] }]}
            />
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selected?.bild_url }} style={styles.modalImage} />
            <View style={styles.commentSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="person-circle" size={22} color="#888" />
                <Text style={styles.userText}>{selected?.user}</Text>
                <Text style={styles.timestamp}>{selected?.timestamp}</Text>
              </View>
              <RatingStars value={selected?.stars || 0} editable={false} customColor="#f5b50a" />
              <Text style={styles.commentText}>{selected?.text}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  galleryWrapper: {
    marginVertical: 16,
    minHeight: 90,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  imageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 8,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  commentSection: {
    width: '100%',
    marginBottom: 12,
  },
  userText: {
    fontWeight: 'bold',
    marginLeft: 6,
    marginRight: 8,
    fontSize: 13,
    color: '#444',
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    marginLeft: 'auto',
  },
  commentText: {
    marginTop: 6,
    fontSize: 15,
    color: '#222',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 2,
  },
});