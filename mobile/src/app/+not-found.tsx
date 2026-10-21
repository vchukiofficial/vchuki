import { router } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { View } from 'react-native';
import { Empty } from '@/components/ui';
import { colors } from '@/theme';

/** Any vchuki.com link the app doesn't have a screen for. */
export default function NotFound() {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Empty
        icon={<Compass size={30} color={colors.accentDeep} strokeWidth={1.4} />}
        title="This page isn’t in the app"
        body="It may have moved, or it only exists on the website."
        action="Go to the shop"
        onAction={() => router.replace('/(tabs)')}
      />
    </View>
  );
}
