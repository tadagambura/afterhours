import { DMSerifDisplay_400Regular, useFonts } from '@expo-google-fonts/dm-serif-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Intro } from '@/kit/Intro';
import { prefsStore } from '@/kit/prefs';
import { KitRoot } from '@/kit/Root';
import { useTheme } from '@/kit/theme';
import { brand } from '@/brand';

SplashScreen.preventAutoHideAsync().catch(() => {});
const usePrefs = prefsStore('afterhours', 19);
const Art = ({ children }: { children: string }) => <Text style={{ fontSize: 96 }}>{children}</Text>;

function Shell() {
  const { c } = useTheme();
  const onboarded = usePrefs((s) => s.onboarded);
  const header = { headerShown: true, headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false } as const;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="deck/[id]" options={{ ...header, title: '' }} />
        <Stack.Screen name="deck/new" options={{ ...header, title: 'Your own deck', presentation: 'modal' }} />
        <Stack.Screen name="quiz/[id]" options={{ ...header, title: '' }} />
        <Stack.Screen name="game/ttt" options={{ ...header, title: 'Tic-tac-toe' }} />
        <Stack.Screen name="game/c4" options={{ ...header, title: 'Four in a row' }} />
      </Stack>
      {!onboarded ? (
        <View style={StyleSheet.absoluteFill}>
          <Intro
            cta="Pick a deck"
            onDone={() => usePrefs.getState().setOnboarded()}
            steps={[
              { title: 'Better questions', body: 'Swipe through decks for first dates, couples, friends and parties. No small talk.', art: <Art>🃏</Art> },
              { title: 'The wheel has spoken', body: "Can't decide who goes first? Spin the wheel and let it settle the argument.", art: <Art>🎡</Art> },
              { title: 'How in sync are you?', body: 'Answer a quiz privately, pass the phone, then reveal how many answers match.', art: <Art>💞</Art> },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ DMSerifDisplay_400Regular });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <KitRoot brand={brand}>
      <Shell />
    </KitRoot>
  );
}
