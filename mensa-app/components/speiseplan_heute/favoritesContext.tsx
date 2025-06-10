import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../constants/supabase';
import { Alert } from 'react-native';

interface FavoritesContextType {
  favorites: Record<string, boolean>;
  toggleFavorite: (gerichtId: number, gerichtName: string) => Promise<void>;
  isFavorite: (gerichtName: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      setUserId(user.id);

      const { data, error: favError } = await supabase
        .from('favorites')
        .select('gericht_name')
        .eq('user_id', user.id);

      if (favError) {
        console.error('Fehler beim Laden der Favoriten:', favError);
        return;
      }

      const favMap: Record<string, boolean> = {};
      for (const fav of data || []) {
        favMap[fav.gericht_name] = true;
      }
      setFavorites(favMap);
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (gerichtId: number, gerichtName: string) => {
    if (!userId) {
      Alert.alert('Nicht eingeloggt', 'Bitte melde dich an.');
      return;
    }

    const isFav = favorites[gerichtName] || false;

    if (!isFav) {
      // Favorit hinzufügen
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('gericht_name', gerichtName)
        .maybeSingle();

      if (!existing && !checkError) {
        const { error: insertError } = await supabase.from('favorites').insert([
          {
            user_id: userId,
            gericht_id: gerichtId,
            gericht_name: gerichtName,
          },
        ]);

        if (!insertError) {
          setFavorites((prev) => ({ ...prev, [gerichtName]: true }));
        } else {
          console.error('Fehler beim Hinzufügen:', insertError);
        }
      }
    } else {
      // Vor dem Löschen bestätigen
      Alert.alert(
        'Favorit entfernen',
        'Möchtest du dieses Gericht wirklich aus deinen Favoriten löschen?',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Entfernen',
            style: 'destructive',
            onPress: async () => {
              const { error: deleteError } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('gericht_name', gerichtName);

              if (!deleteError) {
                setFavorites((prev) => ({ ...prev, [gerichtName]: false }));
              } else {
                console.error('Fehler beim Entfernen:', deleteError);
                Alert.alert('Fehler', 'Favorit konnte nicht gelöscht werden.');
              }
            },
          },
        ]
      );
    }
  };

  const isFavorite = (gerichtName: string) => {
    return favorites[gerichtName] || false;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
