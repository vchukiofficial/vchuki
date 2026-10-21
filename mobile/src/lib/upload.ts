import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

/** Pick photos/videos from the phone and upload them to Vercel Blob through the admin /api/upload route. */
export async function pickAndUpload(opts: { video?: boolean; multiple?: boolean } = {}): Promise<string[]> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: opts.video ? ['videos'] : ['images'],
    allowsMultipleSelection: !!opts.multiple,
    selectionLimit: opts.multiple ? 10 : 1,
    quality: 0.85,
  });
  if (res.canceled) return [];
  const urls: string[] = [];
  for (const a of res.assets) {
    const fallback = opts.video ? 'video/mp4' : 'image/jpeg';
    const type = a.mimeType && a.mimeType !== 'image/heic' ? a.mimeType : fallback;
    const ext = type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const form = new FormData();
    form.append('file', { uri: a.uri, name: a.fileName || `vchuki-${Date.now()}.${ext}`, type } as any);
    const r = await api<{ url: string }>('/api/upload', { method: 'POST', body: form });
    urls.push(r.url);
  }
  return urls;
}
