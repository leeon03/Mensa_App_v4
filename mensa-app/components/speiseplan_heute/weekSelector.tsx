// components/WeekSelector.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
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
  handleDateChange,
}: WeekSelectorProps) {
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 5 }, (_, i) => addDays(startOfCurrentWeek, i));
  const weekLabel = `${format(daysOfWeek[0], 'dd.MM.yyyy')} - ${format(daysOfWeek[4], 'dd.MM.yyyy')}`;

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={() => changeWeek('prev')}>
          <Ionicons name="chevron-back" size={24} color={Colors[theme].text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: Colors[theme].text }}>{weekLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeWeek('next')}>
          <Ionicons name="chevron-forward" size={24} color={Colors[theme].text} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day.toISOString()}
            onPress={() => onSelectDate(day)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderRadius: 6,
              alignItems: 'center',
              width: 56,
              backgroundColor: isSameDay(day, selectedDate)
                ? Colors[theme].accent1
                : Colors[theme].surface,
            }}
          >
            <Text style={{ color: isSameDay(day, selectedDate) ? '#fff' : Colors[theme].text, fontWeight: '600' }}>
              {format(day, 'EE')}
            </Text>
            <Text style={{ color: isSameDay(day, selectedDate) ? '#fff' : Colors[theme].text, fontSize: 12 }}>
              {format(day, 'dd.MM')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </>
  );
}
