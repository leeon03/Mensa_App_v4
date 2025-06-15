// components/WeekSelector.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
} from 'date-fns';
import { Colors } from '../../constants/Colors';

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  theme: 'light' | 'dark';
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  changeWeek: (direction: 'prev' | 'next') => void;
  handleDateChange: (event: any, date?: Date) => void;
}

export default function WeekSelector({
  selectedDate,
  onSelectDate,
  theme,
  showDatePicker,
  setShowDatePicker,
  changeWeek,
}: WeekSelectorProps) {
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 5 }, (_, i) =>
    addDays(startOfCurrentWeek, i)
  );
  const weekLabel = `${format(daysOfWeek[0], 'dd.MM.yyyy')} - ${format(
    daysOfWeek[4],
    'dd.MM.yyyy'
  )}`;

  const [tempDate, setTempDate] = useState(selectedDate);

  const confirmDate = () => {
    onSelectDate(tempDate);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeWeek('prev')}>
          <Ionicons name="chevron-back" size={24} color={Colors[theme].text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTempDate(selectedDate);
            setShowDatePicker(true);
          }}
        >
          <Text style={[styles.weekLabel, { color: Colors[theme].text }]}>
            {weekLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeWeek('next')}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors[theme].text}
          />
        </TouchableOpacity>
      </View>

      {/* Days of Week */}
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => onSelectDate(day)}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected
                    ? Colors[theme].accent1
                    : Colors[theme].surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isSelected ? '#fff' : Colors[theme].text,
                  },
                ]}
              >
                {format(day, 'EE')}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  {
                    color: isSelected ? '#fff' : Colors[theme].text,
                  },
                ]}
              >
                {format(day, 'dd.MM')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Android Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            if (event?.type === 'set' && date) {
              onSelectDate(date);
            }
            setShowDatePicker(false);
          }}
        />
      )}

      {/* iOS Modal Picker */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide" visible={showDatePicker}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: Colors[theme].background },
              ]}
            >
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => {
                  if (date) setTempDate(date);
                }}
                style={{ backgroundColor: Colors[theme].background }}
              />
              <TouchableOpacity
                onPress={confirmDate}
                style={[
                  styles.doneButton,
                  { backgroundColor: Colors[theme].accent1 },
                ]}
              >
                <Text
                  style={{
                    color: Colors[theme].buttonText,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Fertig
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 6,
  },
  dayButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: 60,
    elevation: 2,
  },
  dayText: {
    fontWeight: '700',
    fontSize: 13,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000088',
  },
  modalContent: {
    paddingBottom: 32,
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
