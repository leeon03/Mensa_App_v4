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
  "vegan", "vegetarisch", "scharf", "glutenfrei", "laktosefrei",
  "fleischhaltig", "fisch", "leicht", "deftig", "beliebt"
];

const EXCLUDED_INGREDIENTS = [
  "farbstoff", "konservierungsstoff", "antioxidationsmittel", "geschmacksverstärker",
  "süßungsmittel", "kakaohaltige fettglasur", "koffeinhaltig", "geschwärzt",
  "geschwefelt", "gewascht", "phosphat", "säuerungsmittel", "natriumnitrit",
  "phenylalaninquelle", "portion preis", "glas preis", "=",

  "gluten", "dinkel", "hafer", "roggen", "weizen", "gerste",
  "milch", "laktose", "ei", "erdnüsse", "haselnüsse", "cashewnüsse",
  "mandeln", "walnüsse", "pistazien", "sesam", "senf", "sellerie", "soja", "lupinen",
  "rind", "schwein", "lamm", "wild", "fisch", "geflügel", "krebse", "meeresfrüchte", "weichtiere",
  "bio", "hausgemacht", "vegetarisch", "vegan", "veg", "vga", "sc", "gi", "gid", "gih", "gir", "glw",
  "kr", "lu", "mi", "scm", "scp", "scw", "se", "sf", "si", "so", "sw", "wt", "w", "fi", "h", "scc", "sch", "en"
];

// Filtert irrelevante Zutaten
function cleanZutaten(raw: string): string[] {
  return raw
    .split(',')
    .map(z => z.trim())
    .filter(z => {
      const l = z.toLowerCase();
      return l && !EXCLUDED_INGREDIENTS.some(ex => l.includes(ex));
    });
}

// Generiert Titel aus gefilterten Zutaten oder Namen
function generateAnzeigename(name: string, zutatenListe: string[]): string {
  if (zutatenListe.length >= 2) {
    return `${zutatenListe[0]} & ${zutatenListe[1]}`;
  }
  const fallback = name.split(',').map(z => z.trim()).filter(Boolean);
  return fallback.slice(0, 2).join(' & ') || "Tagesgericht";
}

// Generiert eine nette Kurzbeschreibung
function generateBeschreibung(zutatenListe: string[], name: string): string {
  const basis = zutatenListe.length > 0
    ? zutatenListe.slice(0, 3).join(', ')
    : name.split(',').map(z => z.trim()).slice(0, 3).join(', ');

  return basis ? `Mit ${basis}.` : "Ein leckeres Gericht des Tages.";
}

// KI-ähnliche Metadaten-Erzeugung
export function generateMetaData({ name, zutaten }: Gericht): GerichtMeta {
  const raw = Array.isArray(zutaten) ? zutaten.join(', ') : zutaten || '';
  const cleaned = cleanZutaten(raw);

  const anzeigename = generateAnzeigename(name, cleaned);
  const beschreibung = generateBeschreibung(cleaned, name);

  const lower = raw.toLowerCase();
  const tags = [
    /chili|scharf|pfeffer|jalapeno|curry/.test(lower) ? "scharf" : null,
    !/(fleisch|huhn|wurst|schinken|speck)/i.test(lower) ? "vegetarisch" : null,
    !/(fleisch|ei|milch|käse|joghurt|butter|honig)/i.test(lower) ? "vegan" : null,
    /fisch|lachs|thunfisch/.test(lower) ? "fisch" : null,
    /schwein|rind|huhn|ente/.test(lower) ? "fleischhaltig" : null,
    /pizza|burger|pommes|nudeln|spaghetti|lasagne/.test(lower) ? "beliebt" : null,
  ].filter(Boolean) as string[];

  return {
    anzeigename,
    beschreibung,
    bild_url: `https://source.unsplash.com/featured/?food,${encodeURIComponent(anzeigename)}`,
    tags: tags.filter(tag => ALLOWED_TAGS.includes(tag)),
    naehrwerte_kcal: Math.floor(200 + Math.random() * 400),
    naehrwerte_fett: +(Math.random() * 20).toFixed(1),
    naehrwerte_eiweiss: +(Math.random() * 30).toFixed(1),
    naehrwerte_kohlenhydrate: +(Math.random() * 50).toFixed(1),
  };
}

// Ergänzt alle fehlenden Metadaten
export const completeMissingGerichte = async () => {
  const { data, error } = await supabase.from('gerichte').select('*');

  if (error) {
    console.error("❌ Fehler beim Laden der Gerichte:", error);
    return;
  }

  if (!data || data.length === 0) return;

  for (const gericht of data) {
    const { name, zutaten } = gericht;
    if (!name || !zutaten) continue;

    const meta = generateMetaData({ name, zutaten });

    const { error: updateError } = await supabase
      .from('gerichte')
      .update(meta)
      .eq('id', gericht.id);

    if (updateError) {
      console.error(`❌ Fehler bei Gericht ID ${gericht.id}:`, updateError);
    } else {
      console.log(`✅ Metadaten ergänzt für ${meta.anzeigename}`);
    }
  }
};

// Holt externe Daten
export const fetchDataFromRenderAPI = async () => {
  try {
    const res = await fetch('https://mensahd-api.onrender.com/api/mensa');
    return await res.json();
  } catch (err) {
    console.error("❌ API-Fetch fehlgeschlagen:", err);
    return [];
  }
};

// Speichert neue Gerichte + ergänzt automatisch
export const saveDataToSupabase = async (data: any[]) => {
  for (const item of data) {
    const gericht = {
      name: item.name,
      zutaten: item.notes || [],
      kategorie: item.category || null,
      datum: item.date || null,
      preis: item.prices?.student || null,
      created_at: new Date().toISOString(),
    };

    const { data: existing, error: selectError } = await supabase
      .from('gerichte')
      .select('id')
      .eq('name', gericht.name)
      .eq('datum', gericht.datum)
      .maybeSingle();

    if (selectError) {
      console.error('❌ Fehler bei Duplikatprüfung:', selectError);
      continue;
    }

    if (!existing) {
      const { error: insertError } = await supabase.from('gerichte').insert(gericht);
      if (insertError) console.error('❌ Fehler beim Einfügen:', insertError);
      else console.log(`✅ Eingefügt: ${gericht.name}`);
    } else {
      const { error: updateError } = await supabase
        .from('gerichte')
        .update({ zutaten: gericht.zutaten, kategorie: gericht.kategorie, preis: gericht.preis })
        .eq('id', existing.id);

      if (updateError) console.error('❌ Fehler beim Aktualisieren:', updateError);
      else console.log(`🔄 Aktualisiert: ${gericht.name}`);
    }
  }

  // Immer danach: ergänzen
  await completeMissingGerichte();
};
