const tintColorLight = '#2E8B57';
const tintColorDark = '#2E8B57'; // gleiche Farbe wie Light für Konsistenz

export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#11181C',
    primary: '#2E8B57',
    secondary: '#F4A261',
    accent: '#264653',
    danger: '#E76F51',
    icon: '#8A8A8A',
    surface: '#F0F0F0',
    card: '#f1f1f1',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',

    accent1: '#63a53d', // Benutzer Login
    accent2: '#fb8d30', // Registrierung
    accent3: '#fdc128', // Admin Login
    buttonText: '#ffffff',
    placeholder: '#888888', // ✅ hinzugefügt
  },
  dark: {
    background: '#121212',
    text: '#F1F1F1',
    primary: '#2E8B57',
    secondary: '#F4A261',
    accent: '#264653',
    danger: '#E76F51',
    icon: '#BBBBBB',
    surface: '#1E1E1E',
    card: '#1F1F1F',
    tabIconDefault: '#777777',
    tabIconSelected: tintColorDark,
    border: '#333',

    accent1: '#63a53d',
    accent2: '#fb8d30',
    accent3: '#fdc128',
    buttonText: '#ffffff',
    placeholder: '#999999', // ✅ hinzugefügt
  },
} as const;
