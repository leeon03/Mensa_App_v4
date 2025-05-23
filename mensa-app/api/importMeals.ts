// api/importMeals.ts
import { supabase } from '../constants/supabase';
import { getMealsForDay } from './openMensa';

const FIXED_CANTEEN_ID = 42; // TU Berlin

type GerichtInsert = {
  name: string;
  beschreibung: string;
  datum: string;
  tags: string[];
};

export const importMealsFromOpenMensa = async (date: string): Promise<void> => {
  try {
    const meals = await getMealsForDay(FIXED_CANTEEN_ID, date);

    if (!Array.isArray(meals)) {
      console.warn('Keine Mahlzeiten gefunden.');
      return;
    }

    const mapped: GerichtInsert[] = meals.map((meal) => ({
      name: meal.name,
      beschreibung: meal.notes.join(', '),
      datum: date,
      tags: [meal.category.toLowerCase()],
    }));

    const { error } = await supabase.from('gerichte').insert(mapped);

    if (error) {
      console.error('❌ Fehler beim Einfügen in Supabase:', error);
    } else {
      console.log('✅ Gerichte importiert:', mapped.length);
    }
  } catch (err: any) {
    if (err.response) {
      console.error(`❌ Fehler beim Abrufen von OpenMensa: ${err.response.status} - ${err.response.data?.message || ''}`);
    } else {
      console.error('❌ Fehler beim Abrufen von OpenMensa:', err.message);
    }
  }
};
