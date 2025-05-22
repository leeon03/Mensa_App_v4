import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '../../constants/Colors';
import HapticTab from '../../components/navigation/HapticTab';
import TabBarBackground from '../../components/ui/TabBarBackground';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tabIconSelected,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Transparenter Hintergrund für iOS (z. B. mit Blur)
            position: 'absolute',
          },
        }),
      }}
    />
  );
}
