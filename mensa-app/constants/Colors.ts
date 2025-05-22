const tintColorLight = '#2E8B57';
const tintColorDark = '#2E8B57'; // Gleich wie Light Mode, damit Farben konsistent bleiben

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

    accent1: '#63a53d', // Benutzer Login
    accent2: '#fb8d30', // Registrierung
    accent3: '#fdc128', // Admin Login
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

    accent1: '#63a53d', // Benutzer Login
    accent2: '#fb8d30', // Registrierung
    accent3: '#fdc128', // Admin Login
  },
};
