import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/auth-context';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/lib/theme';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth" />;
}
