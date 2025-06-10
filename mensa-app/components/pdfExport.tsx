import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format, addDays, startOfWeek } from 'date-fns';
import { supabase } from '../constants/supabase';
import { generateMetaData } from '../hooks/dataSync';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Dish {
  anzeigename: string;
  beschreibung: string;
  bild_url: string;
  preis: string;
  datum: string;
  name: string;
  zutaten: string | string[];
}

interface Props {
  selectedDate: Date;
}

export default function SpeiseplanPDFExport({ selectedDate }: Props) {
  const theme = useColorScheme() || 'light';

  const handleGeneratePDF = async () => {
    try {
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        Alert.alert('Fehler', 'Ungültiges Datum.');
        return;
      }

      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = addDays(start, 4);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('gerichte')
        .select('*')
        .gte('datum', startStr)
        .lte('datum', endStr);

      if (error || !Array.isArray(data)) {
        console.error('Supabase-Fehler:', error);
        Alert.alert('Fehler', 'Gerichte konnten nicht geladen werden.');
        return;
      }

      const wochengerichte: Dish[] = data.map((dish) => {
        if (!dish.anzeigename || !dish.beschreibung || !dish.bild_url) {
          const meta = generateMetaData({
            name: dish.name,
            zutaten: dish.zutaten,
          });
          return { ...dish, ...meta };
        }
        return dish;
      });

      const tageDerWoche = Array.from({ length: 5 }, (_, i) => {
        const datum = addDays(start, i);
        const datumStr = format(datum, 'yyyy-MM-dd');
        return {
          label: format(datum, 'EEEE, dd.MM.yyyy'),
          gerichte: wochengerichte.filter(d => d.datum === datumStr),
        };
      });

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              h1 {
                text-align: center;
                color: #333;
              }
              h2 {
                color: #555;
                border-bottom: 1px solid #ccc;
                padding-bottom: 4px;
              }
              .gericht {
                margin-bottom: 20px;
                display: flex;
                align-items: flex-start;
              }
              .gericht img {
                width: 120px;
                height: 100px;
                object-fit: cover;
                border-radius: 6px;
                margin-right: 12px;
              }
              .info {
                flex: 1;
              }
              .name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 4px;
              }
              .beschreibung {
                font-size: 14px;
                color: #444;
              }
              .preis {
                margin-top: 4px;
                font-size: 13px;
                color: #777;
              }
            </style>
          </head>
          <body>
            <h1>Speiseplan der Woche (${format(start, 'dd.MM.yyyy')} – ${format(end, 'dd.MM.yyyy')})</h1>
            ${tageDerWoche.map(({ label, gerichte }) => `
              <h2>${label}</h2>
              ${gerichte.length > 0 ? gerichte.map(dish => `
                <div class="gericht">
                  <img src="${dish.bild_url}" alt="Bild zu ${dish.anzeigename}" />
                  <div class="info">
                    <div class="name">${dish.anzeigename}</div>
                    <div class="beschreibung">${dish.beschreibung}</div>
                    <div class="preis">Preis: ${dish.preis} €</div>
                  </div>
                </div>
              `).join('') : '<p>Keine Gerichte vorhanden.</p>'}
            `).join('')}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('PDF erstellt', 'PDF konnte nicht geteilt werden.');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error: any) {
      console.error('PDF-Fehler:', error);
      Alert.alert('Fehler beim Erstellen des PDFs', error.message);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleGeneratePDF}
      activeOpacity={0.8}
      style={[styles.fab, { backgroundColor: Colors[theme].accent1 }]}
    >
      <Ionicons name="document-outline" size={22} color={Colors[theme].buttonText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
