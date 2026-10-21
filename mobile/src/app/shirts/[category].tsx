import { Redirect, useLocalSearchParams } from 'expo-router';

/** vchuki.com/shirts/<category> links open Shop on that category. */
export default function ShirtsCategory() {
  const { category } = useLocalSearchParams<{ category: string }>();
  return <Redirect href={{ pathname: '/(tabs)/shop', params: { category } }} />;
}
