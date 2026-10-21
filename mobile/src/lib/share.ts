import * as Clipboard from 'expo-clipboard';
import { Directory, File, Paths } from 'expo-file-system';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import { toast } from '@/components/Toast';
import { img, webUrl } from './api';
import { rupee } from './pricing';
import type { Product } from './types';

export const productLink = (p: Pick<Product, 'slug'>) => webUrl(`/product/${p.slug}`);

export function caption(p: Pick<Product, 'name' | 'slug' | 'basePrice' | 'comparePrice'>) {
  const off = p.comparePrice && p.comparePrice > p.basePrice ? ` (MRP ${rupee(p.comparePrice)})` : '';
  return `${p.name} — ${rupee(p.basePrice)}${off}\nPremium cotton-linen, crafted in Jodhpur.\n${productLink(p)}`;
}

/** Download a product photo into the cache so it can be shared or saved as a real image. */
async function download(url: string): Promise<File> {
  const dir = new Directory(Paths.cache, 'share');
  if (!dir.exists) dir.create({ intermediates: true });
  const name = `vchuki-${Math.abs(hash(url))}.${/\.png(\?|$)/i.test(url) ? 'png' : 'jpg'}`;
  const target = new File(dir, name);
  if (target.exists) return target;
  return File.downloadFileAsync(url, target, { idempotent: true });
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Share link + caption only (WhatsApp, Instagram DM, SMS…). */
export async function shareLink(p: Pick<Product, 'name' | 'slug' | 'basePrice' | 'comparePrice'>) {
  await Share.share({ message: caption(p), url: Platform.OS === 'ios' ? productLink(p) : undefined, title: p.name });
}

/**
 * Share the actual product photo with its caption.
 * iOS sends photo + text together. Android's share sheet only carries the file, so the
 * caption & link are copied first — paste them into WhatsApp / Instagram.
 */
export async function sharePhoto(p: Pick<Product, 'name' | 'slug' | 'basePrice' | 'comparePrice'>, imageUrl?: string) {
  const src = img(imageUrl);
  if (!src) return shareLink(p);
  try {
    const file = await download(src);
    if (Platform.OS === 'ios') {
      await Share.share({ url: file.uri, message: caption(p) });
    } else {
      await Clipboard.setStringAsync(caption(p));
      toast('Caption & link copied — paste it with the photo');
      await Sharing.shareAsync(file.uri, { mimeType: file.uri.endsWith('.png') ? 'image/png' : 'image/jpeg', dialogTitle: `Share ${p.name}` });
    }
  } catch {
    await shareLink(p);
  }
}

/** Save every photo of a product to the gallery (album "VCHUKI") — ready to post as an Instagram carousel. */
export async function savePhotos(p: Pick<Product, 'name'>, urls: string[]) {
  const perm = await requestPermissionsAsync(true);
  if (!perm.granted) {
    toast('Allow photo access to save images');
    return 0;
  }
  let saved = 0;
  const assets: Asset[] = [];
  for (const u of urls) {
    const src = img(u);
    if (!src) continue;
    try {
      const f = await download(src);
      assets.push(await Asset.create(f.uri));
      saved++;
    } catch {
      /* skip this one */
    }
  }
  if (assets.length) {
    try {
      await Album.create('VCHUKI', assets);
    } catch {
      /* album exists or not supported — photos are still in the gallery */
    }
  }
  toast(saved ? `${saved} photo${saved > 1 ? 's' : ''} saved to your gallery` : 'Couldn’t save photos');
  return saved;
}

export async function copyLink(p: Pick<Product, 'slug'>) {
  await Clipboard.setStringAsync(productLink(p));
  toast('Link copied');
}
