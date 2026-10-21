import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { LockScreen } from '@/components/LockScreen';
import { ProductActionsHost } from '@/components/ProductActions';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/store/auth';
import { useSecurity } from '@/store/security';
import { useWishlist } from '@/store/wishlist';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg, text: colors.ink, primary: colors.accent, border: colors.line },
};

/** Lock again after the app has been in the background this long. */
const RELOCK_AFTER_MS = 60_000;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });
  const authReady = useAuth((s) => s.ready);
  const token = useAuth((s) => s.token);
  const secReady = useSecurity((s) => s.ready);
  const locked = useSecurity((s) => s.locked);
  const [splashGone, setSplashGone] = useState(false);
  const backgroundAt = useRef<number | null>(null);

  useEffect(() => {
    useAuth.getState().hydrate();
    useSecurity.getState().load();
  }, []);

  useEffect(() => {
    if (token) useWishlist.getState().syncFromServer();
  }, [token]);

  // App lock when returning from the background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundAt.current = Date.now();
      if (state === 'active' && backgroundAt.current && Date.now() - backgroundAt.current > RELOCK_AFTER_MS) {
        if (useAuth.getState().token) useSecurity.getState().lock();
      }
      if (state === 'active') backgroundAt.current = null;
    });
    return () => sub.remove();
  }, []);

  const onSplashDone = useCallback(() => setSplashGone(true), []);

  // Native splash stays up until fonts exist, so the animated splash renders with the brand type
  if (!fontsLoaded) return null;
  const ready = authReady && secReady;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          <StatusBar style="light" />
          {ready ? (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="review/[productId]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="order-success/[id]" options={{ gestureEnabled: false, animation: 'fade' }} />
            </Stack>
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.bg }} />
          )}
          <LockScreen visible={splashGone && !!token && locked} onUnlocked={() => useSecurity.getState().unlock()} />
          {ready && <ProductActionsHost />}
          <Toast />
          {!splashGone && <AnimatedSplash ready={ready} onDone={onSplashDone} />}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
