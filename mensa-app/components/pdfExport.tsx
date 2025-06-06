// components/SpeiseplanPDFExport.tsx
import React from 'react';
import { Button, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

interface Dish {
  anzeigename: string;
  beschreibung: string;
  bild_url: string;
  preis: string;
  datum: string;
}

interface Props {
  wochengerichte: Dish[];
}

export default function SpeiseplanPDFExport({ wochengerichte }: Props) {
  const handleGeneratePDF = async () => {
    try {
      const groupedByDate = wochengerichte.reduce((acc, dish) => {
        const date = format(new Date(dish.datum), 'EEEE, dd.MM.yyyy');
        if (!acc[date]) acc[date] = [];
        acc[date].push(dish);
        return acc;
      }, {} as Record<string, Dish[]>);

      const html = `
        <html>
          <head>
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
            <h1>Speiseplan der Woche</h1>
            ${Object.entries(groupedByDate).map(([tag, dishes]) => `
              <h2>${tag}</h2>
              ${dishes.map(dish => `
                <div class="gericht">
                  <img src="${dish.bild_url}" alt="Bild zu ${dish.anzeigename}" />
                  <div class="info">
                    <div class="name">${dish.anzeigename}</div>
                    <div class="beschreibung">${dish.beschreibung}</div>
                    <div class="preis">Preis: ${dish.preis} €</div>
                  </div>
                </div>
              `).join('')}
            `).join('')}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('PDF erstellt', 'Kann nicht geteilt werden.');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error: any) {
      Alert.alert('Fehler beim Erstellen des PDFs', error.message);
    }
  };

  return <Button title="Speiseplan als PDF exportieren" onPress={handleGeneratePDF} />;
}
