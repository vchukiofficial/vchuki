import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ImagePlus, Plus, Star, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirm, SectionLabel, StudioHeader, ToggleRow } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Card, Chip, Field, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { CATEGORIES, sortSizes } from '@/lib/catalog';
import type { Product, Variant } from '@/lib/types';
import { pickAndUpload } from '@/lib/upload';
import { colors, fonts, GUTTER, radius } from '@/theme';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const EMPTY: Partial<Product> = { name: '', slug: '', description: '', basePrice: 799, comparePrice: 1599, category: 'linen-full-sleeve', images: [], tags: [], isActive: true, isFeatured: false };

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<Partial<Product>>(EMPTY);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editV, setEditV] = useState<Variant | null>(null);

  useEffect(() => {
    if (isNew) return;
    Promise.all([api<{ product: Product }>(`/api/products/${id}`), api<{ variants: Variant[] }>(`/api/products/${id}/variants`)])
      .then(([a, b]) => {
        setP(a.product);
        setVariants(b.variants);
      })
      .catch((e) => Alert.alert('Couldn’t load', e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  async function addPhotos() {
    setUploading(true);
    try {
      const urls = await pickAndUpload({ multiple: true });
      if (urls.length) set('images', [...(p.images || []), ...urls]);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!p.name?.trim() || !p.description?.trim() || !p.basePrice) return Alert.alert('Missing details', 'Name, description and price are required.');
    setSaving(true);
    const body = {
      name: p.name.trim(),
      slug: p.slug?.trim() || slugify(p.name),
      description: p.description.trim(),
      basePrice: Number(p.basePrice),
      comparePrice: Number(p.comparePrice) || 0,
      category: p.category,
      tags: p.tags || [],
      images: p.images || [],
      isActive: !!p.isActive,
      isFeatured: !!p.isFeatured,
    };
    try {
      if (isNew) {
        const created = await api<Product>('/api/products', { method: 'POST', body });
        router.replace({ pathname: '/admin/products/[id]', params: { id: created._id } });
        Alert.alert('Product created', 'Now add colours and sizes so customers can buy it.');
      } else {
        await api(`/api/products/${id}`, { method: 'PATCH', body });
        Alert.alert('Saved', 'Live on vchuki.com and the app.');
      }
    } catch (e: any) {
      Alert.alert('Not saved', /E11000|duplicate/i.test(e.message) ? 'That URL slug is already used by another product.' : e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <StudioHeader title="Product" />
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </View>
    );
  }

  const byColor = variants.reduce<Record<string, Variant[]>>((acc, v) => {
    const k = v.color?.name || 'Default';
    (acc[k] ||= []).push(v);
    return acc;
  }, {});

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StudioHeader title={isNew ? 'New product' : p.name || 'Product'} subtitle={isNew ? 'Fill details, then add sizes' : `/product/${p.slug}`} />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: insets.bottom + 110 }} keyboardShouldPersistTaps="handled">
        {/* Photos */}
        <SectionLabel style={{ marginTop: 4 }}>Photos · first is the cover</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {(p.images || []).map((u, i) => (
            <View key={`${u}-${i}`}>
              <Image source={{ uri: img(u) }} style={st.photo} contentFit="cover" />
              {i === 0 && (
                <View style={st.cover}>
                  <T v="caption" style={{ color: colors.white, fontSize: 9.5, fontFamily: fonts.bold }}>
                    COVER
                  </T>
                </View>
              )}
              <View style={st.photoActions}>
                {i > 0 && (
                  <Tap onPress={() => set('images', [u, ...(p.images || []).filter((_, k) => k !== i)])} style={st.photoBtn} accessibilityLabel="Make cover">
                    <Star size={12} color={colors.white} />
                  </Tap>
                )}
                <Tap onPress={() => set('images', (p.images || []).filter((_, k) => k !== i))} style={st.photoBtn} accessibilityLabel="Remove photo">
                  <X size={12} color={colors.white} />
                </Tap>
              </View>
            </View>
          ))}
          <Tap onPress={addPhotos} style={st.addPhoto} disabled={uploading}>
            {uploading ? <ActivityIndicator color={colors.accent} /> : <ImagePlus size={24} color={colors.accentDeep} strokeWidth={1.5} />}
            <T v="caption" style={{ marginTop: 6 }}>
              {uploading ? 'Uploading…' : 'Add photos'}
            </T>
          </Tap>
        </ScrollView>

        <SectionLabel>Details</SectionLabel>
        <Field label="Product name" value={p.name} onChangeText={(v) => setP((x) => ({ ...x, name: v, slug: isNew ? slugify(v) : x.slug }))} />
        <Field label="URL slug" value={p.slug} onChangeText={(v) => set('slug', slugify(v))} autoCapitalize="none" />
        <Field label="Description" value={p.description} onChangeText={(v) => set('description', v)} multiline style={{ height: 110, paddingTop: 14, textAlignVertical: 'top' }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Selling price ₹" value={String(p.basePrice ?? '')} onChangeText={(v) => set('basePrice', Number(v.replace(/\D/g, '')) as any)} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="MRP ₹ (strike-through)" value={String(p.comparePrice ?? '')} onChangeText={(v) => set('comparePrice', Number(v.replace(/\D/g, '')) as any)} keyboardType="number-pad" />
          </View>
        </View>
        <T v="caption" style={{ marginBottom: 8, color: colors.inkSoft }}>
          Category
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} label={c.name} active={p.category === c.slug} onPress={() => set('category', c.slug)} />
          ))}
        </View>
        <Field label="Tags (comma separated)" value={(p.tags || []).join(', ')} onChangeText={(v) => set('tags', v.split(',').map((t) => t.trim()).filter(Boolean))} style={{}} autoCapitalize="none" />

        <Card style={{ paddingVertical: 2 }}>
          <ToggleRow label="Live on the store" hint="Hidden products can’t be found or bought" value={!!p.isActive} onChange={(v) => set('isActive', v)} />
          <ToggleRow label="Featured" hint="Shows in Bestsellers on the home page" value={!!p.isFeatured} onChange={(v) => set('isFeatured', v)} />
        </Card>

        {/* Variants */}
        {!isNew && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <SectionLabel>Colours & sizes · {variants.reduce((n, v) => n + v.stock, 0)} in stock</SectionLabel>
              <Tap onPress={() => setAddOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <Plus size={15} color={colors.accentDeep} />
                <T v="caption" style={{ color: colors.accentDeep, fontFamily: fonts.semibold }}>
                  Add
                </T>
              </Tap>
            </View>
            {Object.keys(byColor).length === 0 && (
              <Card>
                <T v="small">No sizes yet — this product can’t be bought until you add at least one.</T>
              </Card>
            )}
            {Object.entries(byColor).map(([color, vs]) => (
              <Card key={color} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <View style={[st.swatch, { backgroundColor: vs[0].color?.hex || colors.sand }]} />
                  <T v="title" style={{ fontSize: 14 }}>
                    {color}
                  </T>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sortSizes(vs.map((v) => v.size)).map((sz) => {
                    const v = vs.find((x) => x.size === sz)!;
                    return (
                      <Tap key={v._id} onPress={() => setEditV(v)} style={[st.sizeBox, v.stock === 0 && { borderColor: colors.danger }, v.stock > 0 && v.stock <= 5 && { borderColor: colors.warning }]}>
                        <T v="title" style={{ fontSize: 13 }}>
                          {sz}
                        </T>
                        <T v="caption" style={{ color: v.stock === 0 ? colors.danger : v.stock <= 5 ? colors.warning : colors.muted, fontFamily: fonts.semibold }}>
                          {v.stock} pcs
                        </T>
                      </Tap>
                    );
                  })}
                </View>
              </Card>
            ))}
          </>
        )}

        {!isNew && (
          <Tap
            onPress={() =>
              confirm('Delete product?', 'It disappears from the store immediately. Consider hiding it instead.', 'Delete', async () => {
                try {
                  await api(`/api/products/${id}`, { method: 'DELETE' });
                  router.back();
                } catch (e: any) {
                  Alert.alert('Not deleted', e.message);
                }
              })
            }
            style={st.delete}>
            <Trash2 size={15} color={colors.danger} />
            <T v="caption" style={{ color: colors.danger, fontFamily: fonts.semibold }}>
              Delete product
            </T>
          </Tap>
        )}
      </ScrollView>

      <View style={[st.bar, { paddingBottom: insets.bottom + 10 }]}>
        <Button title={isNew ? 'Create product' : 'Save changes'} onPress={save} loading={saving} />
      </View>

      {!isNew && <AddVariants open={addOpen} onClose={() => setAddOpen(false)} product={p as Product} onAdded={(v) => setVariants((x) => [...x, ...v])} />}
      <VariantSheet
        v={editV}
        productId={id}
        onClose={() => setEditV(null)}
        onSaved={(nv) => setVariants((x) => x.map((y) => (y._id === nv._id ? nv : y)))}
        onDeleted={(vid) => setVariants((x) => x.filter((y) => y._id !== vid))}
      />
    </KeyboardAvoidingView>
  );
}

function AddVariants({ open, onClose, product, onAdded }: { open: boolean; onClose: () => void; product: Product; onAdded: (v: Variant[]) => void }) {
  const [color, setColor] = useState('');
  const [hex, setHex] = useState('#D8C3A5');
  const [sizes, setSizes] = useState<Record<string, string>>({ S: '5', M: '5', L: '5', XL: '5' });
  const [fit, setFit] = useState<'slim' | 'regular' | 'relaxed'>('regular');
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!color.trim()) return Alert.alert('Colour name needed');
    setBusy(true);
    const made: Variant[] = [];
    try {
      for (const [size, stock] of Object.entries(sizes)) {
        const v = await api<Variant>(`/api/products/${product._id}/variants`, {
          method: 'POST',
          body: {
            color: { name: color.trim(), hex },
            size,
            stock: Number(stock) || 0,
            fit,
            fabric: 'Cotton-linen blend',
            priceAdjustment: size === 'XXL' ? 50 : size === '3XL' ? 100 : 0,
            sku: `VC-${product.slug}-${color.trim().toLowerCase().replace(/\s+/g, '-')}-${size}`,
            images: product.images || [],
          },
        });
        made.push(v);
      }
      onAdded(made);
      onClose();
    } catch (e: any) {
      if (made.length) onAdded(made);
      Alert.alert('Some sizes not added', /E11000|duplicate/i.test(e.message) ? 'That colour/size already exists.' : e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add colour & sizes">
      <Field label="Colour name" value={color} onChangeText={setColor} placeholder="e.g. Desert Sand" />
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Field label="Swatch hex" value={hex} onChangeText={(v) => setHex(v.startsWith('#') ? v : `#${v}`)} autoCapitalize="none" />
        </View>
        <View style={[st.swatch, { width: 50, height: 50, borderRadius: 25, marginBottom: 12, backgroundColor: /^#[0-9a-f]{6}$/i.test(hex) ? hex : colors.sand }]} />
      </View>
      <T v="caption" style={{ marginBottom: 8, color: colors.inkSoft }}>
        Sizes & opening stock (tap to include)
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SIZES.map((s) => {
          const on = sizes[s] !== undefined;
          return (
            <View key={s} style={[st.sizeEdit, on && { borderColor: colors.ink }]}>
              <Tap
                onPress={() =>
                  setSizes((x) => {
                    const n = { ...x };
                    if (on) delete n[s];
                    else n[s] = '5';
                    return n;
                  })
                }>
                <T v="title" style={{ fontSize: 13, color: on ? colors.ink : colors.faint }}>
                  {s}
                </T>
              </Tap>
              {on && (
                <TextInput value={sizes[s]} onChangeText={(v) => setSizes((x) => ({ ...x, [s]: v.replace(/\D/g, '') }))} keyboardType="number-pad" style={st.qty} />
              )}
            </View>
          );
        })}
      </View>
      <T v="caption" style={{ marginTop: 14, marginBottom: 8, color: colors.inkSoft }}>
        Fit
      </T>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['slim', 'regular', 'relaxed'] as const).map((f) => (
          <Chip key={f} label={f[0].toUpperCase() + f.slice(1)} active={fit === f} onPress={() => setFit(f)} />
        ))}
      </View>
      <T v="caption" style={{ marginTop: 12 }}>
        XXL is priced +₹50 and 3XL +₹100, same as the website.
      </T>
      <Button title={`Add ${Object.keys(sizes).length} sizes`} onPress={create} loading={busy} disabled={!Object.keys(sizes).length} style={{ marginTop: 16 }} />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

function VariantSheet({ v, productId, onClose, onSaved, onDeleted }: { v: Variant | null; productId: string; onClose: () => void; onSaved: (v: Variant) => void; onDeleted: (id: string) => void }) {
  const [stock, setStock] = useState('');
  const [adj, setAdj] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (v) {
      setStock(String(v.stock));
      setAdj(String(v.priceAdjustment || 0));
    }
  }, [v]);
  if (!v) return null;

  async function save() {
    setBusy(true);
    try {
      const nv = await api<Variant>(`/api/products/${productId}/variants/${v!._id}`, { method: 'PATCH', body: { stock: Number(stock) || 0, priceAdjustment: Number(adj) || 0 } });
      onSaved({ ...nv, stock: Number(stock) || 0 });
      onClose();
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!v} onClose={onClose} title={`${v.color?.name} · ${v.size}`}>
      <T v="caption" style={{ marginBottom: 12 }}>
        {v.sku || 'No SKU'} {v.barcode ? `· ${v.barcode}` : ''}
      </T>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Stock (pieces)" value={stock} onChangeText={(t) => setStock(t.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Price +/− ₹" value={adj} onChangeText={(t) => setAdj(t.replace(/[^\d-]/g, ''))} keyboardType="numbers-and-punctuation" />
        </View>
      </View>
      <T v="caption" style={{ marginBottom: 14 }}>
        Stock changes are logged in the stock ledger as a correction by you.
      </T>
      <Button title="Save" onPress={save} loading={busy} />
      <Button
        title="Delete this size"
        kind="ghost"
        compact
        onPress={() =>
          confirm('Delete size?', `${v.color?.name} ${v.size} will no longer be sold.`, 'Delete', async () => {
            try {
              await api(`/api/products/${productId}/variants/${v._id}`, { method: 'DELETE' });
              onDeleted(v._id);
              onClose();
            } catch (e: any) {
              Alert.alert('Not deleted', e.message);
            }
          })
        }
        style={{ marginTop: 6 }}
      />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  photo: { width: 96, height: 120, borderRadius: radius.md, backgroundColor: colors.sand },
  cover: { position: 'absolute', left: 6, top: 6, backgroundColor: colors.night, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  photoActions: { position: 'absolute', right: 6, top: 6, gap: 6 },
  photoBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: 96, height: 120, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accent, backgroundColor: colors.accentWash, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 18, height: 18, borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.2)' },
  sizeBox: { width: 70, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: colors.bg },
  sizeEdit: { width: 74, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: colors.surface },
  qty: { marginTop: 4, width: 50, height: 30, borderRadius: 6, backgroundColor: colors.bg, textAlign: 'center', fontFamily: fonts.semibold, color: colors.ink },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, paddingVertical: 12 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 12, backgroundColor: colors.bar, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
