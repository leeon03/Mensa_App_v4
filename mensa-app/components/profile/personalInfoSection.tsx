import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import ProfileSection from '../profile/profileSection';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  name: string;
  email: string;
  createdAt: string;
  favoritesCount: number;
  onSaveName: (newName: string) => void; // Speichert den Namen extern (z. B. API)
}

const PersonalInfoSection: React.FC<Props> = ({
  name,
  email,
  createdAt,
  favoritesCount,
  onSaveName,
}) => {
  const theme = useColorScheme() || 'light';
  const colorTheme = Colors[theme];

  const [modalVisible, setModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleSave = () => {
    onSaveName(editedName); // Callback zum Speichern in DB
    setModalVisible(false);
  };

  const renderItem = (
    label: string,
    value: string | number,
    editable?: boolean,
    onEdit?: () => void
  ) => (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colorTheme.icon }]}>{label}</Text>
      <View style={styles.editableRow}>
        <Text style={[styles.value, { color: colorTheme.text }]}>{value}</Text>
        {editable && (
          <TouchableOpacity onPress={onEdit}>
            <Ionicons
              name="pencil-outline"
              size={16}
              color={theme === 'dark' ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <ProfileSection title="Persönliche Daten" initiallyExpanded>
        {renderItem('Name', name, true, () => setModalVisible(true))}
        {renderItem('E-Mail', email)}
        {renderItem('Mitglied seit', createdAt)}
        {renderItem('Favoriten', favoritesCount)}
      </ProfileSection>

      {/* Modal zum Bearbeiten des Namens */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: colorTheme.background }]}>
            <Text style={[styles.modalTitle, { color: colorTheme.text }]}>Name bearbeiten</Text>
            <TextInput
              style={[styles.input, { color: colorTheme.text, borderColor: colorTheme.icon }]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Neuer Name"
              placeholderTextColor={colorTheme.icon}
            />
            <View style={styles.modalButtons}>
              <Button title="Abbrechen" onPress={() => setModalVisible(false)} />
              <Button title="Speichern" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PersonalInfoSection;
