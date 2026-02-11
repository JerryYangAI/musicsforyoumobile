import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/auth-context';
import { AudioPlayerProvider } from '../src/lib/audio-player';
import { colors } from '../src/lib/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        />
      </AudioPlayerProvider>
    </AuthProvider>
  );
}
