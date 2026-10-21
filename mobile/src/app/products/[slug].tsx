import { Redirect, useLocalSearchParams } from 'expo-router';

/** vchuki.com/products/<slug> links open the product in the app. */
export default function ProductsAlias() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={{ pathname: '/product/[slug]', params: { slug } }} />;
}
