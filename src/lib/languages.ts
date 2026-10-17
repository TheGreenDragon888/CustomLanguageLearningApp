import AsyncStorage from '@react-native-async-storage/async-storage';

// Data types shared by every screen.

// One flashcard: a word and what it means.
export type Word = {
  word: string;
  meaning: string;
};

// A custom language: a name plus all of its words.
// Each language is saved as one JSON object of this shape.
export type Language = {
  name: string;
  words: Word[];
};

// ---------- Saving and loading with AsyncStorage ----------
// AsyncStorage is a simple key/value store on the phone: every key maps to a string.
// We save each language under its own key, e.g. "language:Spanish", with the whole
// Language object (name + word list) turned into a JSON string.

const KEY_PREFIX = 'language:';

// Load every saved language, sorted by name.
export async function loadLanguages(): Promise<Language[]> {
  const allKeys = await AsyncStorage.getAllKeys();
  const languageKeys = allKeys.filter((key) => key.startsWith(KEY_PREFIX));
  const pairs = await AsyncStorage.multiGet(languageKeys); // [[key, value], ...]

  const languages: Language[] = [];
  for (const [, value] of pairs) {
    if (value) languages.push(JSON.parse(value) as Language); // JSON text -> object
  }
  return languages.sort((a, b) => a.name.localeCompare(b.name));
}

// Save (create or overwrite) one language.
export async function saveLanguage(language: Language): Promise<void> {
  await AsyncStorage.setItem(KEY_PREFIX + language.name, JSON.stringify(language)); // object -> JSON text
}
