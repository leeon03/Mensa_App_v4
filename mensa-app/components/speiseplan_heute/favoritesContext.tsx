import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../constants/supabase';
import { Alert } from 'react-native';

interface FavoritesContextType {
  favorites: Record<string, boolean>;
  toggleFavorite: (gerichtId: number, gerichtName: string) => Promise<boolean>; // changed from void ➜ boolean
  isFavorite: (gerichtName: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Auth-Status beobachten
  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setUserId(null);
        return;
      }

      const user = session.user;
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

    fetchUserAndFavorites();

    // 2. Bei Login/Logout neu laden
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        supabase
          .from('favorites')
          .select('gericht_name')
          .eq('user_id', session.user.id)
          .then(({ data, error }) => {
            if (error) return;
            const favMap: Record<string, boolean> = {};
            for (const fav of data || []) {
              favMap[fav.gericht_name] = true;
            }
            setFavorites(favMap);
          });
      } else {
        setUserId(null);
        setFavorites({});
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const toggleFavorite = async (
    gerichtId: number,
    gerichtName: string
  ): Promise<boolean> => {
    if (!userId) {
      Alert.alert('Nicht eingeloggt', 'Bitte melde dich an.');
      return false;
    }

    const isFav = favorites[gerichtName] || false;

    if (!isFav) {
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
          return true;
        } else {
          console.error('Fehler beim Hinzufügen:', insertError);
          return false;
        }
      } else {
        return false;
      }
    } else {
      return new Promise((resolve) => {
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
                  setFavorites((prev) => ({ ...prev, [gerichtName]: false }));
                  resolve(true);
                } else {
                  console.error('Fehler beim Entfernen:', deleteError);
                  Alert.alert('Fehler', 'Favorit konnte nicht gelöscht werden.');
                  resolve(false);
                }
              },
            },
          ]
        );
      });
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
