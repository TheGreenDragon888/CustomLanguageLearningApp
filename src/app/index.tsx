import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { loadLanguages, saveLanguage, type Language } from '@/lib/languages';

// The "Languages" screen. Every file in src/app/ is a screen (route) in Expo Router;
// index.tsx is the first screen the app opens to.
export default function LanguagesScreen() {
  const theme = useTheme(); // light/dark colors

  // State: values the screen remembers. Calling a "set" function updates the
  // value and makes React redraw the screen with the new value.
  const [languages, setLanguages] = useState<Language[]>([]); // all languages
  const [newName, setNewName] = useState(''); // text typed in the input box
  const [selectedName, setSelectedName] = useState<string | null>(null); // the opened language, or null
  const [newWord, setNewWord] = useState(''); // word input
  const [newMeaning, setNewMeaning] = useState(''); // meaning input

  // Load saved languages from storage every time this screen comes into view
  // (on app start, and when switching back from another tab).
  useFocusEffect(
    useCallback(() => {
      loadLanguages().then(setLanguages);
    }, [])
  );

  // Runs when the "Add" button is tapped.
  async function addLanguage() {
    const name = newName.trim();
    if (name === '') return; // ignore empty names
    if (languages.some((lang) => lang.name.toLowerCase() === name.toLowerCase())) return; // no duplicates

    const language: Language = { name, words: [] };
    await saveLanguage(language); // save to the phone first...

    // ...then update the screen. Create a new array (never edit state directly) so React notices.
    setLanguages([...languages, language]);
    setNewName(''); // clear the input box
  }

  // Tapping a language opens it; tapping the open one again closes it.
  function toggleLanguage(name: string) {
    setSelectedName(selectedName === name ? null : name);
  }

  // Runs when the "Add Word" button is tapped. Adds the word to the opened language.
  async function addWord() {
    const word = newWord.trim();
    const meaning = newMeaning.trim();
    const language = languages.find((lang) => lang.name === selectedName);
    if (!language || word === '' || meaning === '') return; // need both fields

    // Copy the language with the new word added to the end of its list.
    const updated: Language = { ...language, words: [...language.words, { word, meaning }] };
    await saveLanguage(updated); // overwrite the saved JSON for this language

    // Swap the old language for the updated one in state so the screen redraws.
    setLanguages(languages.map((lang) => (lang.name === updated.name ? updated : lang)));
    setNewWord('');
    setNewMeaning('');
  }

  return (
    <ThemedView style={styles.container}>
      {/* SafeAreaView keeps content away from the phone's notch and status bar. */}
      <SafeAreaView style={styles.safeArea}>
        {/* ScrollView lets the page scroll when the list gets long. */}
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* A local image asset. require() bundles the picture into the app. */}
          <Image source={require('@/assets/images/app-icon.png')} style={styles.logo} />

          <ThemedText type="title" style={styles.center}>
            My Languages
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            Create a language, add words, then study them as flashcards.
          </ThemedText>

          {/* Input row: text box + Add button */}
          <ThemedView style={styles.row}>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="New language name"
              placeholderTextColor={theme.textSecondary}
              value={newName}
              onChangeText={setNewName} // update state on every keystroke
              onSubmitEditing={addLanguage} // pressing "return" on the keyboard also adds
            />
            <Pressable style={styles.button} onPress={addLanguage}>
              <ThemedText style={styles.buttonText}>Add</ThemedText>
            </Pressable>
          </ThemedView>

          {/* The list of languages. It redraws whenever "languages" state changes. */}
          {languages.length === 0 ? (
            <ThemedText themeColor="textSecondary">No languages yet. Add one above!</ThemedText>
          ) : (
            languages.map((lang) => (
              <ThemedView key={lang.name} type="backgroundElement" style={styles.card}>
                {/* Card header: tap to open/close this language */}
                <Pressable style={styles.cardHeader} onPress={() => toggleLanguage(lang.name)}>
                  <ThemedText type="smallBold">
                    {selectedName === lang.name ? '▼ ' : '▶ '}
                    {lang.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {lang.words.length} words
                  </ThemedText>
                </Pressable>

                {/* Only the opened language shows its words and the add-word form */}
                {selectedName === lang.name && (
                  <ThemedView type="backgroundElement" style={styles.details}>
                    <TextInput
                      style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                      placeholder="Word"
                      placeholderTextColor={theme.textSecondary}
                      value={newWord}
                      onChangeText={setNewWord}
                    />
                    <TextInput
                      style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                      placeholder="Meaning"
                      placeholderTextColor={theme.textSecondary}
                      value={newMeaning}
                      onChangeText={setNewMeaning}
                      onSubmitEditing={addWord}
                    />
                    <Pressable style={[styles.button, styles.wideButton]} onPress={addWord}>
                      <ThemedText style={styles.buttonText}>Add Word</ThemedText>
                    </Pressable>

                    {/* The word list for this language */}
                    {lang.words.map((w, index) => (
                      <ThemedText key={index} type="small">
                        <ThemedText type="smallBold">{w.word}</ThemedText> — {w.meaning}
                      </ThemedText>
                    ))}
                  </ThemedView>
                )}
              </ThemedView>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// StyleSheet.create groups the styles for this screen (similar to CSS).
const styles = StyleSheet.create({
  container: {
    flex: 1, // fill the whole screen
  },
  safeArea: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  center: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row', // place children side by side
    gap: Spacing.two,
    alignSelf: 'stretch',
  },
  input: {
    flex: 1, // take all space the button doesn't use
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    borderRadius: Spacing.two,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  wideButton: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  details: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
