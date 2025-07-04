import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Card from '../../components/ui/card';

type Gericht = {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  bild_url: string;
  kategorie: string;
  tags?: string[];
  preis: number;
};

type Props = {
  gericht: Gericht;
  isLongPressed: boolean;
  isPendingDelete: boolean;
  countdown: number;
  onPress: () => void;
  onLongPress: () => void;
  onStartDelete: () => void;
  onUndoDelete: () => void;
};

const GerichtItem: React.FC<Props> = ({
  gericht,
  isLongPressed,
  isPendingDelete,
  countdown,
  onPress,
  onLongPress,
  onStartDelete,
  onUndoDelete,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={isPendingDelete}
    >
      <View
        style={[
          styles.cardWrapper,
          isLongPressed && styles.cardLongPressed,
          isPendingDelete && styles.cardPendingDelete,
        ]}
      >
        <Card
          name={gericht.name}
          anzeigename={gericht.anzeigename}
          beschreibung={gericht.beschreibung}
          bild_url={gericht.bild_url}
          kategorie={gericht.kategorie || ''}
          bewertungen={[]}
          tags={gericht.tags}
          preis={gericht.preis}
          isFavorite={false}
          isAlert={false}
          onFavoritePress={() => {}}
          onAlertPress={() => {}}
        />

        {/* Löschen-Icon (rot) */}
        {isLongPressed && !isPendingDelete && (
          <View style={styles.deleteIconContainerRed}>
            <TouchableOpacity onPress={onStartDelete}>
              <Feather name="trash-2" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Rückgängig-Icon (orange) + Undo-Box */}
        {isPendingDelete && (
          <>
            <View style={styles.deleteIconContainerOrange}>
              <TouchableOpacity onPress={onUndoDelete}>
                <Feather name="rotate-ccw" size={36} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.undoContainer}>
              <Text style={styles.undoText}>
                Wird in <Text style={styles.countdown}>{countdown}s</Text> gelöscht
              </Text>
              <TouchableOpacity onPress={onUndoDelete} style={styles.undoButton}>
                <Text style={styles.undoButtonText}>Rückgängig</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardLongPressed: {
    backgroundColor: '#ffcccc',
  },
  cardPendingDelete: {
    backgroundColor: '#FFA500',
  },
  deleteIconContainerRed: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderRadius: 40,
    padding: 16,
    zIndex: 2,
  },
  deleteIconContainerOrange: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    backgroundColor: 'rgba(255, 165, 0, 0.8)', // Orange
    borderRadius: 40,
    padding: 16,
    zIndex: 2,
  },
  undoContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFA500',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  undoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  countdown: {
    color: '#fff',
    fontWeight: 'bold',
  },
  undoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  undoButtonText: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GerichtItem;
