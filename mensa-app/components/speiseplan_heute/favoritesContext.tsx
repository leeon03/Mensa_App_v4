import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../constants/supabase';
import { Alert } from 'react-native';

interface FavoritesContextType {
  favorites: Record<string, boolean>;
  toggleFavorite: (gerichtId: number, gerichtName: string) => Promise<boolean>;
  isFavorite: (gerichtName: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const normalize = (name: string) => name.trim().toLowerCase();

  const reloadFavorites = async (uid: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('gericht_name')
      .eq('user_id', uid);

    if (error) {
      console.error('Fehler beim Laden der Favoriten:', error);
      return;
    }

    const favMap: Record<string, boolean> = {};
    for (const fav of data || []) {
      if (fav.gericht_name) {
        favMap[normalize(fav.gericht_name)] = true;
      }
    }
    setFavorites(favMap);
  };

  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await reloadFavorites(session.user.id);
      } else {
        setUserId(null);
        setFavorites({});
      }
    };

    fetchUserAndFavorites();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        reloadFavorites(session.user.id);
      } else {
        setUserId(null);
        setFavorites({});
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const toggleFavorite = async (gerichtId: number, gerichtName: string): Promise<boolean> => {
    if (!userId) {
      Alert.alert('Nicht eingeloggt', 'Bitte melde dich an.');
      return false;
    }

    const nameKey = normalize(gerichtName);
    const isFav = favorites[nameKey] || false;

    if (!isFav) {
      // Gericht hinzufügen
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
          await reloadFavorites(userId);
          return true;
        }
      }

      return false;
    }

    // Gericht entfernen mit Alert
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Favorit entfernen',
        'Möchtest du dieses Gericht wirklich aus deinen Favoriten löschen?',
        [
          { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
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
                await reloadFavorites(userId);
                resolve(true);
              } else {
                console.error('Fehler beim Löschen:', deleteError);
                Alert.alert('Fehler', 'Favorit konnte nicht gelöscht werden.');
                resolve(false);
              }
            },
          },
        ]
      );
    });
  };

  const isFavorite = (gerichtName: string) => {
    return favorites[normalize(gerichtName)] || false;
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
