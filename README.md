# Custom Language Learning App

An app that allows you to store custom language flash cards.

Created by Isaac Day for CSE 310 (Mobile App module). Create your own "languages" (word dictionaries), add words and their meanings, and study them as flashcards. The app shows a word, you tap to reveal its meaning, and then move on to the next card. All data is saved on the device with AsyncStorage, so it is still there after the app is closed.

[Video Demonstration](https://youtu.be/GgiCccqUY6I)

## Instructions for Build and Use

Steps to build and/or run the software:

1. Install [Node.js](https://nodejs.org/) (LTS version) and clone this repository.
2. In the project folder, run `npm install` to download the dependencies.
3. Run `npx expo start`, then press `w` to open the app in a web browser, or scan the QR code with the Expo Go app on a phone.

Instructions for using the software:

1. On the **Languages** tab, type a language name (for example "Spanish") and tap **Add**.
2. Tap the language to open it, type a word and its meaning, and tap **Add Word**. Repeat for more words.
3. To fix a word, tap it to edit it and tap **Save**, or tap the red **✕** to delete it. Use **Rename language** to change a language's name, or tap **Delete language** twice to delete it with all its words.
4. Open the **Study** tab and choose a language. Tap the flashcard to reveal the meaning, then tap **Next →** to go to the next word.

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

* Node.js 24.19.0 and npm 11.17.0
* Expo SDK 58 (`expo` ~58.0.13) with Expo Router ~58.0.22, React Native 0.88.0, React 19.3.0, and TypeScript ~6.0.3
* @react-native-async-storage/async-storage 2.2.0 (installed with `npx expo install`)
* Visual Studio Code as the editor; tested in a web browser through `npx expo start --web`

## Useful Websites to Learn More

* ["Create an App with React Native"](https://www.youtube.com/watch?v=1ETOJloLK3Y)
* [Getting Started with React Native](https://reactnative.dev/docs/getting-started)
* [Expo Router introduction](https://docs.expo.dev/router/introduction/)
* [React Native core components and APIs](https://reactnative.dev/docs/components-and-apis)
* [React `useState` reference](https://react.dev/reference/react/useState)
* [AsyncStorage usage docs](https://react-native-async-storage.github.io/async-storage/docs/usage)
* [Expo: splash screen and app icon](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

* [x] Edit and delete languages and words
* [ ] Shuffle the flashcards and track which words I got right or wrong
* [ ] Make a real build with EAS so the custom app icon shows on a phone's home screen
