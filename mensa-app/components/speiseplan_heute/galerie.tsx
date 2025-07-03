
import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
  useColorScheme,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

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
  const theme = useColorScheme() || 'light';
  const themeColors = Colors[theme];

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const bilder = bewertungen.filter(
    b => typeof b.bild_url === 'string' && b.bild_url.startsWith('data:image')
  );

  const selected = bilder[selectedIndex];

  const handleImagePress = (index: number) => {
    setSelectedIndex(index);
    incrementViewCount(bilder[index].id);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const incrementViewCount = (id: string) => {
    setViewCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleShare = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Fehler', 'Teilen nicht verfügbar');
      return;
    }

    const filename = FileSystem.cacheDirectory + 'shared.jpg';
    await FileSystem.writeAsStringAsync(filename, selected.bild_url.replace(/^data:image\/\w+;base64,/, ''), {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Sharing.shareAsync(filename);
  };

  const renderItem = ({ item, index }: { item: Bewertung; index: number }) => (
    <TouchableOpacity
      onPress={() => handleImagePress(index)}
      style={[styles.thumbnailWrapper, { borderColor: themeColors.border }]}
    >
      <Image source={{ uri: item.bild_url }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={{ marginVertical: 16, minHeight: 120, width: '100%' }}>
      <Text style={[styles.heading, { color: themeColors.text }]}>Bilder aus Bewertungen</Text>

      {bilder.length === 0 ? (
        <Text style={[styles.noImagesText, { color: themeColors.icon }]}>Noch keine Bilder</Text>
      ) : (
        <FlatList
          data={bilder}
          keyExtractor={(item) => item.id}
          horizontal
          ref={flatListRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
        />
      )}

      <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Animated.View style={[styles.modalWrapper, { backgroundColor: themeColors.background, opacity: fadeAnim }]}>
          <FlatList
            data={bilder}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedIndex}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedIndex(index);
              incrementViewCount(bilder[index].id);
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ScrollView
                maximumZoomScale={4}
                minimumZoomScale={1}
                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <Image source={{ uri: item.bild_url }} style={styles.fullscreenImage} resizeMode="contain" />
              </ScrollView>
            )}
          />

          <View style={styles.toolbar}>
            <TouchableOpacity onPress={handleShare} style={styles.toolbarButton}>
              <Ionicons name="share-outline" size={22} color={themeColors.text} />
              <Text style={[styles.toolbarText, { color: themeColors.text }]}>Teilen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.toolbarButton}>
              <Ionicons name="close-outline" size={26} color={themeColors.danger} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaInfo}>
            <Text style={[styles.userText, { color: themeColors.text }]}>
              {selected?.user} • {new Date(selected?.timestamp || '').toLocaleDateString('de-DE')}
            </Text>
            <RatingStars value={selected?.stars || 0} editable={false} customColor="#f5b50a" />
            <Text style={[styles.commentText, { color: themeColors.text }]}>
              {selected?.text}
            </Text>
            <Text style={[styles.viewCount, { color: themeColors.icon }]}>
              {viewCounts[selected?.id || ''] || 1} Ansicht(en)
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  noImagesText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 16,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  thumbnailWrapper: {
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height * 0.6,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarText: {
    fontSize: 12,
    marginTop: 2,
  },
  metaInfo: {
    padding: 16,
  },
  userText: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  commentText: {
    marginTop: 4,
    fontSize: 14,
  },
  viewCount: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.6,
  },
});
