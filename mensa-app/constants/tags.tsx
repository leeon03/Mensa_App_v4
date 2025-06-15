// src/constants/tags.tsx
import React from 'react';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export interface Tag {
  key: string;
  label: string;
  icon: () => JSX.Element;
  color: string;
}

export const TAGS: Tag[] = [
  {
    key: 'vegan',
    label: 'Vegan',
    icon: () => <MaterialCommunityIcons name="leaf" size={14} color="#000" />,
    color: '#A5D6A7',
  },
  {
    key: 'vegetarisch',
    label: 'Vegetarisch',
    icon: () => <MaterialCommunityIcons name="food-apple" size={14} color="#000" />,
    color: '#C5E1A5',
  },
  {
    key: 'leicht',
    label: 'Leicht',
    icon: () => <Ionicons name="sunny" size={14} color="#000" />,
    color: '#FFF59D',
  },
  {
    key: 'glutenfrei',
    label: 'Glutenfrei',
    icon: () => <Ionicons name="ban" size={14} color="#000" />,
    color: '#FFE082',
  },
  {
    key: 'scharf',
    label: 'Scharf',
    icon: () => <MaterialCommunityIcons name="chili-hot" size={14} color="#000" />,
    color: '#EF9A9A',
  },
  {
    key: 'fleischhaltig',
    label: 'Fleischhaltig',
    icon: () => <MaterialCommunityIcons name="cow" size={14} color="#000" />,
    color: '#E57373',
  },
  {
    key: 'fischhaltig',
    label: 'Fischhaltig',
    icon: () => <MaterialCommunityIcons name="fish" size={14} color="#000" />,
    color: '#81D4FA',
  },
  {
    key: 'beliebt',
    label: 'Beliebt',
    icon: () => <Ionicons name="flame" size={14} color="#000" />,
    color: '#F48FB1',
  },
  {
    key: 'favorit',
    label: 'Favorit',
    icon: () => <Ionicons name="heart" size={14} color="#000" />,
    color: '#F06292',
  },
  {
    key: 'erinnerung',
    label: 'Erinnerung',
    icon: () => <Ionicons name="notifications" size={14} color="#000" />,
    color: '#B0BEC5',
  },
];
