import { supabase } from '../constants/supabase';

type Gericht = {
  name: string;
  zutaten: string | string[];
};

type GerichtMeta = {
  anzeigename: string;
  beschreibung: string;
  bild_url: string;
  tags: string[];
  naehrwerte_kcal: number;
  naehrwerte_fett: number;
  naehrwerte_eiweiss: number;
  naehrwerte_kohlenhydrate: number;
};

const ALLOWED_TAGS = [
  "vegetarisch",
  "vegan",
  "fleischhaltig",
  "scharf",
  "fischhaltig",
  "glutenfrei",
  "leicht",
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function fetchPexelsImage(searchText: string): Promise<string | null> {
  const apiKey = 'kpS8vGJ046GbXg7DcGMbMu8FKzSiyKh4O2DQMWFgVXiIGBcjuWkqRNH9';
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchText)}&per_page=5`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: apiKey },
    });
    const result = await response.json();
    const photo = result.photos?.find((p: any) => p?.src?.large);
    return photo?.src?.large || null;
  } catch (error) {
    console.error("❌ Fehler beim Abrufen von Pexels:", error);
    return null;
  }
}

export async function generateMetaData({ name, zutaten }: Gericht): Promise<GerichtMeta | null> {
  const prompt = `
Du bist ein KI-Kochassistent. Erstelle zu folgendem Gericht kompakte Metadaten:

- "beschreibung": max. 15 Wörter, ein kurzer, realistischer Satz.
- "bild_suche": eine englische, bildhafte Beschreibung (z. B. "crispy schnitzel with fries and salad on white plate").
  - KEINE exakte Zutatenliste, KEINE Aufzählung.
- "tags": nur aus dieser Liste: ${ALLOWED_TAGS.join(', ')}.
- Nährwerte grob realistisch pro Portion schätzen.

Gericht:
Name: ${name}
Zutaten: ${Array.isArray(zutaten) ? zutaten.join(', ') : zutaten}

Format:
{
  "anzeigename": "...",
  "beschreibung": "...",
  "bild_suche": "...",
  "tags": ["..."],
  "naehrwerte_kcal": 0,
  "naehrwerte_fett": 0.0,
  "naehrwerte_eiweiss": 0.0,
  "naehrwerte_kohlenhydrate": 0.0
}`.trim();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/devstral-small:free",
        messages: [
          { role: "system", content: "You are a helpful AI chef assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const result = await response.json();
    let content = result.choices?.[0]?.message?.content;
    if (!content) {
      console.error("❌ KI-Antwort leer.");
      return null;
    }

    content = content.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(content);

    const pexelsImage = await fetchPexelsImage(parsed.bild_suche || name);
    parsed.bild_url = pexelsImage || "https://via.placeholder.com/600x400?text=Kein+Bild";
    parsed.tags = (parsed.tags || []).filter((tag: string) => ALLOWED_TAGS.includes(tag.toLowerCase()));
    delete parsed.bild_suche;

    return parsed;
  } catch (err) {
    console.error("❌ Fehler bei Metadaten-Generierung:", err);
    return null;
  }
}

export const completeMissingGerichte = async () => {
  const { data, error } = await supabase.from('gerichte').select('id, name, zutaten').eq('meta_generiert', false);
  if (error || !data) {
    console.error("❌ Fehler beim Laden der Gerichte:", error);
    return;
  }

  for (const gericht of data) {
    const { name, zutaten } = gericht;
    if (!name || !zutaten) continue;

    const meta = await generateMetaData({ name, zutaten });
    await delay(1200);
    if (!meta) continue;

    const { error: updateError } = await supabase
      .from('gerichte')
      .update({ ...meta, meta_generiert: true })
      .eq('id', gericht.id);

    if (updateError) {
      console.error(`❌ Fehler bei Update ID ${gericht.id}:`, updateError);
    } else {
      console.log(`✅ Metadaten ergänzt für ${meta.anzeigename}`);
    }
  }
};

export const fetchDataFromRenderAPI = async () => {
  try {
    const res = await fetch('https://mensahd-api.onrender.com/api/mensa');
    return await res.json();
  } catch (err) {
    console.error("❌ Fehler bei externem API-Fetch:", err);
    return [];
  }
};

export const saveDataToSupabase = async (data: any[]) => {
  const allowedCategories = ["menü 1", "menü vegan"];
  let changesMade = false;

  for (const item of data) {
    const rawCategory = (item.category || "").trim().toLowerCase();
    if (!allowedCategories.includes(rawCategory)) continue;

    const gericht = {
      name: item.name.trim(),
      zutaten: item.notes || [],
      kategorie: item.category || null,
      datum: item.date || null,
      preis: item.prices?.student || null,
      created_at: new Date().toISOString(),
    };

    if (!gericht.name || !gericht.datum) continue;

    // 🔐 Duplikatprüfung: Kein Gericht mit gleichem Namen und Datum
    const { data: existing, error: selectError } = await supabase
      .from('gerichte')
      .select('*')
      .eq('name', gericht.name)
      .eq('datum', gericht.datum)
      .maybeSingle();

    if (selectError) {
      console.error('❌ Fehler bei Duplikatprüfung:', selectError);
      continue;
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('gerichte').insert({ ...gericht, meta_generiert: false });
      if (!insertError) {
        changesMade = true;
        console.log(`✅ Gericht eingefügt: ${gericht.name}`);
      } else {
        console.error('❌ Fehler beim Einfügen:', insertError);
      }
    } else {
      const aktualisierungNoetig =
        JSON.stringify(existing.zutaten) !== JSON.stringify(gericht.zutaten) ||
        existing.kategorie !== gericht.kategorie ||
        existing.preis !== gericht.preis;

      if (!aktualisierungNoetig) continue;

      const { error: updateError } = await supabase
        .from('gerichte')
        .update({
          zutaten: gericht.zutaten,
          kategorie: gericht.kategorie,
          preis: gericht.preis,
          meta_generiert: false,
        })
        .eq('id', existing.id);

      if (!updateError) {
        changesMade = true;
        console.log(`🔄 Gericht aktualisiert: ${gericht.name}`);
      } else {
        console.error(`❌ Fehler beim Update: ${gericht.name}`, updateError);
      }
    }
  }

  if (changesMade) {
    await completeMissingGerichte();
  } else {
    console.log("🚀 Keine Änderungen – Weiterleitung zur Startseite empfohlen.");
  }

  return changesMade;
};
