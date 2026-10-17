import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { loadLanguages, type Language } from '@/lib/languages';

// The "Study" screen (second tab): pick a language, then go through its words as flashcards.
export default function StudyScreen() {
  const [languages, setLanguages] = useState<Language[]>([]); // all saved languages
  const [selectedName, setSelectedName] = useState<string | null>(null); // language being studied
  const [cardIndex, setCardIndex] = useState(0); // which word is showing
  const [revealed, setRevealed] = useState(false); // is the meaning visible?

  // Reload from storage each time this tab is opened, so new words show up.
  useFocusEffect(
    useCallback(() => {
      loadLanguages().then(setLanguages);
    }, [])
  );

  // The language object for the selected name (undefined if none chosen yet).
  const language = languages.find((lang) => lang.name === selectedName);
  const words = language?.words ?? [];
  // Keep the index in range, in case the word list changed.
  const card = words.length > 0 ? words[cardIndex % words.length] : undefined;

  // Choose a language and start again from its first card.
  function chooseLanguage(name: string) {
    setSelectedName(name);
    setCardIndex(0);
    setRevealed(false);
  }

  // Go to the next card (wrapping back to the first after the last) and hide the meaning.
  function nextCard() {
    setCardIndex((cardIndex + 1) % words.length);
    setRevealed(false);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Study</ThemedText>

          {/* Language picker: one button per saved language */}
          {languages.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              Create a language on the Languages tab first.
            </ThemedText>
          ) : (
            <ThemedView style={styles.pickerRow}>
              {languages.map((lang) => (
                <Pressable
                  key={lang.name}
                  onPress={() => chooseLanguage(lang.name)}
                  // Highlight the selected language's button.
                  style={[styles.chip, lang.name === selectedName && styles.chipSelected]}>
                  <ThemedText
                    type="smallBold"
                    style={lang.name === selectedName ? styles.chipTextSelected : undefined}>
                    {lang.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}

          {/* The flashcard area changes depending on what is selected */}
          {!language ? (
            languages.length > 0 && (
              <ThemedText themeColor="textSecondary">Pick a language to study.</ThemedText>
            )
          ) : !card ? (
            <ThemedText themeColor="textSecondary">
              {language.name} has no words yet. Add some on the Languages tab.
            </ThemedText>
          ) : (
            <>
              {/* The flashcard: tap it to show/hide the meaning */}
              <Pressable style={styles.flashcard} onPress={() => setRevealed(!revealed)}>
                <ThemedText type="title" style={styles.cardText}>
                  {card.word}
                </ThemedText>
                <ThemedText style={styles.cardHint}>
                  {revealed ? card.meaning : 'Tap to reveal the meaning'}
                </ThemedText>
              </Pressable>

              <ThemedText themeColor="textSecondary">
                Card {(cardIndex % words.length) + 1} of {words.length}
              </ThemedText>

              <Pressable style={styles.nextButton} onPress={nextCard}>
                <ThemedText style={styles.nextText}>Next →</ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // wrap to a new line when there are many languages
    justifyContent: 'center',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    borderWidth: 1,
    borderColor: '#208AEF',
  },
  chipSelected: {
    backgroundColor: '#208AEF',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  flashcard: {
    alignSelf: 'stretch',
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    backgroundColor: '#208AEF',
  },
  cardText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  cardHint: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#143C78',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  nextText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
