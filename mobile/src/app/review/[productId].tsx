import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Star, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconBtn, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { colors, fonts, GUTTER, radius } from '@/theme';

const LABELS = ['', 'Not for me', 'Could be better', 'Good', 'Really like it', 'Love it'];

/** Photo reviews — the API requires at least one photo, same rule as the website. */
export default function WriteReview() {
  const { productId, name } = useLocalSearchParams<{ productId: string; name?: string }>();
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 4 - photos.length, quality: 0.7 });
    if (!res.canceled) setPhotos((p) => [...p, ...res.assets].slice(0, 4));
  }

  async function shoot() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Camera access needed', 'Allow camera access in Settings to take a photo.');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setPhotos((p) => [...p, ...res.assets].slice(0, 4));
  }

  async function submit() {
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const a of photos) {
        const form = new FormData();
        const type = a.mimeType && a.mimeType !== 'image/heic' ? a.mimeType : 'image/jpeg';
        form.append('file', { uri: a.uri, name: a.fileName || `review-${Date.now()}.jpg`, type } as any);
        const r = await api<{ url: string }>('/api/mobile/upload', { method: 'POST', body: form });
        urls.push(r.url);
      }
      await api('/api/reviews', { method: 'POST', body: { product: productId, rating, comment: comment.trim(), images: urls } });
      Alert.alert('Thank you!', 'Your review is live on the product page.');
      router.back();
    } catch (e: any) {
      const dup = /duplicate|E11000/i.test(e.message);
      Alert.alert('Review not posted', dup ? 'You’ve already reviewed this piece.' : e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <IconBtn label="Close" onPress={() => router.back()} style={{ backgroundColor: colors.sand }}>
            <X size={19} color={colors.ink} />
          </IconBtn>
        </View>
        <T v="eyebrow" style={{ marginTop: 12 }}>
          Write a review
        </T>
        <T v="h1" style={{ marginTop: 6 }} numberOfLines={2}>
          {name || 'How was it?'}
        </T>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 28 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Tap key={i} onPress={() => setRating(i)} accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`} hitSlop={4}>
              <Star size={38} strokeWidth={1.3} color={colors.accent} fill={i <= rating ? colors.accent : 'transparent'} />
            </Tap>
          ))}
        </View>
        <T v="small" style={{ marginTop: 8, color: colors.ink, fontFamily: fonts.medium, minHeight: 20 }}>
          {LABELS[rating]}
        </T>

        <T v="title" style={{ marginTop: 26 }}>
          Add photos <T v="caption">(required, up to 4)</T>
        </T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
          {photos.map((p, i) => (
            <View key={p.uri}>
              <Image source={{ uri: p.uri }} style={st.photo} contentFit="cover" />
              <Tap onPress={() => setPhotos((x) => x.filter((_, k) => k !== i))} style={st.remove} accessibilityLabel="Remove photo">
                <X size={12} color={colors.white} />
              </Tap>
            </View>
          ))}
          {photos.length < 4 && (
            <>
              <Tap onPress={pick} style={st.add}>
                <T style={{ fontSize: 26, color: colors.accentDeep }}>+</T>
                <T v="caption">Gallery</T>
              </Tap>
              <Tap onPress={shoot} style={st.add}>
                <Camera size={22} color={colors.accentDeep} strokeWidth={1.5} />
                <T v="caption" style={{ marginTop: 4 }}>
                  Camera
                </T>
              </Tap>
            </>
          )}
        </ScrollView>

        <T v="title" style={{ marginTop: 14 }}>
          Your review
        </T>
        <TextInput
          value={comment}
          onChangeText={setComment}
          multiline
          placeholder="How’s the fit, the fabric, the colour? Size you bought?"
          placeholderTextColor={colors.faint}
          style={st.text}
          maxLength={1000}
        />

        <Button title="Post review" onPress={submit} loading={busy} disabled={!rating || !photos.length} style={{ marginTop: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  photo: { width: 88, height: 110, borderRadius: radius.md, backgroundColor: colors.sand },
  remove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  add: { width: 88, height: 110, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentWash },
  text: {
    marginTop: 10,
    minHeight: 130,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
