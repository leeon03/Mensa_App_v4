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
  tags?: string[];
}

interface Props {
  selectedDate: Date;
}

const TAGS = [
  { key: 'vegan', label: 'Vegan', color: '#A5D6A7' },
  { key: 'vegetarisch', label: 'Vegetarisch', color: '#C5E1A5' },
  { key: 'leicht', label: 'Leicht', color: '#FFF59D' },
  { key: 'glutenfrei', label: 'Glutenfrei', color: '#FFE082' },
  { key: 'scharf', label: 'Scharf', color: '#EF9A9A' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', color: '#E57373' },
  { key: 'fischhaltig', label: 'Fischhaltig', color: '#81D4FA' },
  { key: 'beliebt', label: 'Beliebt', color: '#F48FB1' },
  { key: 'favorit', label: 'Favorit', color: '#F06292' },
  { key: 'erinnerung', label: 'Erinnerung', color: '#B0BEC5' },
];

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
                font-family: 'Arial', sans-serif;
                padding: 24px;
                background-color: #f9f9f9;
                color: #333;
              }

              h1 {
                text-align: center;
                color: #1a202c;
                margin-bottom: 32px;
              }

              h2 {
                color: #2d3748;
                font-size: 18px;
                margin-top: 32px;
                margin-bottom: 12px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 4px;
              }

              .gericht {
                display: flex;
                margin-bottom: 20px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                background-color: #fff;
              }

              .gericht img {
                width: 120px;
                height: 100px;
                object-fit: cover;
              }

              .info {
                padding: 12px;
                flex: 1;
              }

              .name {
                font-weight: 700;
                font-size: 16px;
                margin-bottom: 4px;
              }

              .beschreibung {
                font-size: 13px;
                margin-bottom: 4px;
              }

              .preis {
                font-size: 12px;
                color: #4a5568;
              }

              .tags {
                margin-top: 8px;
              }

              .tag {
                display: inline-block;
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 999px;
                margin-right: 6px;
                margin-bottom: 4px;
                color: #000;
                font-weight: 500;
              }

              .legende {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ccc;
              }

              .legende-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 12px;
              }

              .legende-chip {
                display: inline-block;
                font-size: 11px;
                padding: 4px 10px;
                border-radius: 999px;
                margin: 4px 6px 4px 0;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <h1>Speiseplan (${format(start, 'dd.MM.yyyy')} – ${format(end, 'dd.MM.yyyy')})</h1>

            ${tageDerWoche.map(({ label, gerichte }) => `
              <h2>${label}</h2>
              ${gerichte.length > 0 ? gerichte.map(dish => `
                <div class="gericht">
                  <img src="${dish.bild_url}" alt="Bild" />
                  <div class="info">
                    <div class="name">${dish.anzeigename}</div>
                    <div class="beschreibung">${dish.beschreibung}</div>
                    <div class="preis">Preis: ${dish.preis} €</div>
                    ${dish.tags?.length ? `
                      <div class="tags">
                        ${dish.tags.map(tag => {
                          const found = TAGS.find(t => t.key === tag.toLowerCase());
                          return found ? `<span class="tag" style="background-color: ${found.color}">${found.label}</span>` : '';
                        }).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('') : '<p>Keine Gerichte vorhanden.</p>'}
            `).join('')}

            <div class="legende">
              <div class="legende-title">Legende</div>
              ${TAGS.map(tag => `
                <span class="legende-chip" style="background-color: ${tag.color}">
                  ${tag.label}
                </span>
              `).join('')}
            </div>
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
