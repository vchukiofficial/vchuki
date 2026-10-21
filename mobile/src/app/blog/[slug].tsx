import { Redirect, useLocalSearchParams } from 'expo-router';

/** vchuki.com/blog/<slug> links open the article in the app's journal. */
export default function BlogAlias() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={{ pathname: '/journal/[slug]', params: { slug } }} />;
}
