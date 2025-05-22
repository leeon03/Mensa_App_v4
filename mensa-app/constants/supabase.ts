// mensa-app/constants/supabase.ts

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// 🔐 Supabase-Daten – aus deinem Projekt-Dashboard kopieren
const SUPABASE_URL = 'https://qilijpznwoocgfwowciu.supabase.co'; // <- ersetzen
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbGlqcHpud29vY2dmd293Y2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzA3MTEsImV4cCI6MjA2MzUwNjcxMX0.CJZ-Y0JnLKjT9Gj4xYJ4SfDnx5Ahb9_8cPL7yANfVSM'; // <- ersetzen

// ⚙️ Supabase-Client erstellen
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
