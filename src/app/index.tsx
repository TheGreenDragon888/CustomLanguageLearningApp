import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteLanguage,
  loadLanguages,
  renameLanguage,
  saveLanguage,
  type Language,
  type Word,
} from '@/lib/languages';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // word being edited, or null
  const [editWord, setEditWord] = useState(''); // edit box: word
  const [editMeaning, setEditMeaning] = useState(''); // edit box: meaning
  const [confirmingDelete, setConfirmingDelete] = useState(false); // was "Delete language" tapped once?
  const [renaming, setRenaming] = useState(false); // is the rename box showing?
  const [renameText, setRenameText] = useState(''); // rename box text

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
    setEditingIndex(null); // stop any word edit when switching languages
    setConfirmingDelete(false); // and cancel a half-finished delete
    setRenaming(false); // and close the rename box
  }

  // "Rename" button: show the rename box, pre-filled with the current name.
  function startRename(language: Language) {
    setRenaming(true);
    setRenameText(language.name);
    setConfirmingDelete(false);
  }

  // "Save" in the rename box.
  async function saveRename(language: Language) {
    const name = renameText.trim();
    if (name === '') return; // ignore empty names
    // No duplicates: another language (not this one) can't already use the name.
    const taken = languages.some(
      (lang) => lang.name !== language.name && lang.name.toLowerCase() === name.toLowerCase()
    );
    if (taken) return;

    const updated: Language = { ...language, name }; // same words, new name
    await renameLanguage(language.name, updated); // new key saved, old key removed

    // Swap the old language for the renamed one, and keep it open under its new name.
    setLanguages(languages.map((lang) => (lang.name === language.name ? updated : lang)));
    setSelectedName(name);
    setRenaming(false);
  }

  // "Delete language" button. The first tap only asks for confirmation (pop-up
  // dialogs don't work in a web browser); the second tap really deletes.
  async function removeLanguage(name: string) {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    await deleteLanguage(name); // remove from storage
    setLanguages(languages.filter((lang) => lang.name !== name)); // remove from the screen
    setSelectedName(null);
    setConfirmingDelete(false);
  }

  // Runs when the "Add Word" button is tapped. Adds the word to the opened language.
  async function addWord() {
    const word = newWord.trim();
    const meaning = newMeaning.trim();
    const language = languages.find((lang) => lang.name === selectedName);
    if (!language || word === '' || meaning === '') return; // need both fields

    // Copy the language with the new word added to the end of its list.
    await updateLanguage({ ...language, words: [...language.words, { word, meaning }] });
    setNewWord('');
    setNewMeaning('');
  }

  // Remove the word at position "index" from a language.
  async function deleteWord(language: Language, index: number) {
    // filter keeps every word except the one at this index.
    const words = language.words.filter((_, i) => i !== index);
    await updateLanguage({ ...language, words });
    setEditingIndex(null); // positions shifted, so stop any word edit
  }

  // Tapping a word opens it for editing, with the boxes pre-filled.
  function startEditing(index: number, word: Word) {
    setEditingIndex(index);
    setEditWord(word.word);
    setEditMeaning(word.meaning);
  }

  // "Save" on an edited word: replace the word at editingIndex.
  async function saveEdit(language: Language) {
    const word = editWord.trim();
    const meaning = editMeaning.trim();
    if (editingIndex === null || word === '' || meaning === '') return; // need both fields

    // map copies the list, swapping in the edited word at its position.
    const words = language.words.map((w, i) => (i === editingIndex ? { word, meaning } : w));
    await updateLanguage({ ...language, words });
    setEditingIndex(null); // close the edit boxes
  }

  // Save a changed language, then swap it into state so the screen redraws.
  async function updateLanguage(updated: Language) {
    await saveLanguage(updated); // overwrite the saved JSON for this language
    setLanguages(languages.map((lang) => (lang.name === updated.name ? updated : lang)));
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
                    {lang.words.map((w, index) =>
                      editingIndex === index ? (
                        // Edit mode: pre-filled boxes with Save / Cancel
                        <ThemedView key={index} type="backgroundElement" style={styles.editBox}>
                          <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                            value={editWord}
                            onChangeText={setEditWord}
                          />
                          <TextInput
                            style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                            value={editMeaning}
                            onChangeText={setEditMeaning}
                            onSubmitEditing={() => saveEdit(lang)}
                          />
                          <ThemedView type="backgroundElement" style={styles.row}>
                            <Pressable
                              style={[styles.button, styles.wideButton, styles.flexButton]}
                              onPress={() => saveEdit(lang)}>
                              <ThemedText style={styles.buttonText}>Save</ThemedText>
                            </Pressable>
                            <Pressable
                              style={[styles.button, styles.wideButton, styles.flexButton, styles.cancelButton]}
                              onPress={() => setEditingIndex(null)}>
                              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                            </Pressable>
                          </ThemedView>
                        </ThemedView>
                      ) : (
                        <ThemedView key={index} type="backgroundElement" style={styles.wordRow}>
                          {/* Tap the word's text to edit it */}
                          <Pressable style={styles.wordText} onPress={() => startEditing(index, w)}>
                            <ThemedText type="small">
                              <ThemedText type="smallBold">{w.word}</ThemedText> — {w.meaning}
                            </ThemedText>
                          </Pressable>
                          {/* ✕ button: delete this word */}
                          <Pressable
                            style={styles.deleteWordButton}
                            onPress={() => deleteWord(lang, index)}
                            accessibilityLabel={`Delete ${w.word}`}>
                            <ThemedText style={styles.deleteText}>✕</ThemedText>
                          </Pressable>
                        </ThemedView>
                      )
                    )}

                    {/* Rename the language: a button, or the rename box while renaming */}
                    {renaming ? (
                      <ThemedView type="backgroundElement" style={styles.editBox}>
                        <TextInput
                          style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                          value={renameText}
                          onChangeText={setRenameText}
                          onSubmitEditing={() => saveRename(lang)}
                        />
                        <ThemedView type="backgroundElement" style={styles.row}>
                          <Pressable
                            style={[styles.button, styles.wideButton, styles.flexButton]}
                            onPress={() => saveRename(lang)}>
                            <ThemedText style={styles.buttonText}>Save name</ThemedText>
                          </Pressable>
                          <Pressable
                            style={[styles.button, styles.wideButton, styles.flexButton, styles.cancelButton]}
                            onPress={() => setRenaming(false)}>
                            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                          </Pressable>
                        </ThemedView>
                      </ThemedView>
                    ) : (
                      <Pressable
                        style={[styles.button, styles.wideButton, styles.cancelButton, styles.renameButton]}
                        onPress={() => startRename(lang)}>
                        <ThemedText style={styles.buttonText}>Rename language</ThemedText>
                      </Pressable>
                    )}

                    {/* Delete the whole language (two taps) */}
                    <Pressable
                      style={[styles.button, styles.wideButton, styles.dangerButton]}
                      onPress={() => removeLanguage(lang.name)}>
                      <ThemedText style={styles.buttonText}>
                        {confirmingDelete
                          ? `Tap again to delete "${lang.name}" (${lang.words.length} words)`
                          : 'Delete language'}
                      </ThemedText>
                    </Pressable>
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
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  wordText: {
    flex: 1, // take the row's free space so the ✕ stays at the right edge
  },
  editBox: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  flexButton: {
    flex: 1, // Save and Cancel share the row equally
  },
  cancelButton: {
    backgroundColor: '#60646C', // grey
  },
  renameButton: {
    marginTop: Spacing.two,
  },
  dangerButton: {
    backgroundColor: '#D93025', // red
  },
  deleteWordButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  deleteText: {
    color: '#D93025', // red
    fontWeight: 'bold',
  },
});
