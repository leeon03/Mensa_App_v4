// expandableInputField.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label: string;
  description: string;
  value: string;
  onChange: (text: string) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  themeColor: any;
};

const ExpandableInputField = ({
  label,
  description,
  value,
  onChange,
  isExpanded,
  toggleExpand,
  keyboardType = 'default',
  themeColor,
}: Props) => {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={[styles.header, { backgroundColor: themeColor.card }]}
      >
        <Text style={[styles.label, { color: themeColor.icon }]}>{label}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColor.text}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <Text style={[styles.description, { color: themeColor.text }]}>
            {description}
          </Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={label}
            keyboardType={keyboardType}
            style={[
              styles.input,
              {
                color: themeColor.text,
                borderColor: themeColor.border,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});

export default ExpandableInputField;
