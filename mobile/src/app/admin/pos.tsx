import { Minus, Plus, ScanBarcode, Search, Share2, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { inr, SectionLabel, StudioHeader } from '@/components/admin';
import { Scanner } from '@/components/Scanner';
import { Sheet } from '@/components/Sheet';
import { Button, Card, Chip, Divider, Row, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface StockItem { _id: string; product: string; color: string; size: string; stock: number; barcode: string; sku: string; price: number }
interface Line extends StockItem { qty: number }
interface Receipt { billNo: string; date: string; items: { name: string; size: string; color: string; quantity: number; price: number }[]; totalAmount: number; discountAmount: number; finalAmount: number; paymentMethod: string; customerName: string }

/** Shop counter billing — same /api/admin/pos as the website. Prices always come from the database. */
export default function Pos() {
  const insets = useSafeAreaInsets();
  const [lines, setLines] = useState<Line[]>([]);
  const [scan, setScan] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const [all, setAll] = useState<StockItem[]>([]);
  const [q, setQ] = useState('');
  const [discount, setDiscount] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (pickOpen && !all.length) api<{ items: StockItem[] }>('/api/admin/stock').then((r) => setAll(r.items)).catch(() => {});
  }, [pickOpen, all.length]);

  function add(item: StockItem) {
    setLines((ls) => {
      const ex = ls.find((l) => l._id === item._id);
      if (ex) {
        if (ex.qty >= item.stock) {
          Alert.alert('No more stock', `Only ${item.stock} of ${item.product} ${item.size} in stock.`);
          return ls;
        }
        return ls.map((l) => (l._id === item._id ? { ...l, qty: l.qty + 1 } : l));
      }
      if (item.stock <= 0) {
        Alert.alert('Sold out', `${item.product} ${item.size} shows 0 in stock.`);
        return ls;
      }
      return [...ls, { ...item, qty: 1 }];
    });
  }

  async function onScan(code: string) {
    try {
      const r = await api<{ item: StockItem }>(`/api/admin/stock?code=${encodeURIComponent(code)}`);
      add(r.item);
    } catch (e: any) {
      Alert.alert('Not found', e.message);
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const disc = Math.min(subtotal, Number(discount) || 0);
  const total = subtotal - disc;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter((i) => i.stock > 0 && (!t || `${i.product} ${i.color} ${i.size} ${i.barcode}`.toLowerCase().includes(t))).slice(0, 60);
  }, [all, q]);

  async function charge() {
    setBusy(true);
    try {
      const r = await api<{ receipt: Receipt }>('/api/admin/pos', {
        method: 'POST',
        body: { items: lines.map((l) => ({ variantId: l._id, quantity: l.qty })), discount: disc, paymentMethod: method, customerName: name.trim() || undefined, customerPhone: phone.replace(/\D/g, '').slice(-10) || undefined },
      });
      setReceipt(r.receipt);
      setLines([]);
      setDiscount('');
      setName('');
      setPhone('');
    } catch (e: any) {
      Alert.alert('Sale not recorded', e.message);
    } finally {
      setBusy(false);
    }
  }

  function shareReceipt(r: Receipt) {
    const body = [
      'VCHUKI — Jodhpur',
      `Bill #${r.billNo} · ${new Date(r.date).toLocaleString('en-IN')}`,
      '',
      ...r.items.map((i) => `${i.name} (${i.size}, ${i.color}) × ${i.quantity}  ${inr(i.price * i.quantity)}`),
      '',
      `Subtotal ${inr(r.totalAmount)}`,
      r.discountAmount ? `Discount −${inr(r.discountAmount)}` : '',
      `Total ${inr(r.finalAmount)} · ${r.paymentMethod.toUpperCase()}`,
      '',
      'Thank you for shopping with VCHUKI · vchuki.com',
    ]
      .filter((l) => l !== '')
      .join('\n');
    Share.share({ message: body });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StudioHeader title="Shop counter" subtitle="Scan tags, take payment, stock updates instantly" />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Scan tag" kind="accent" icon={<ScanBarcode size={18} color={colors.onAccent} />} onPress={() => setScan(true)} style={{ flex: 1 }} />
          <Button title="Search" kind="outline" icon={<Search size={17} color={colors.ink} />} onPress={() => setPickOpen(true)} style={{ flex: 1 }} />
        </View>

        <SectionLabel>Bill</SectionLabel>
        <Card>
          {lines.length === 0 ? (
            <T v="small" style={{ textAlign: 'center', paddingVertical: 20 }}>
              Scan a tag to start a bill.
            </T>
          ) : (
            lines.map((l) => (
              <View key={l._id} style={st.line}>
                <View style={{ flex: 1 }}>
                  <T v="small" style={{ color: colors.ink, fontFamily: fonts.medium }} numberOfLines={1}>
                    {l.product}
                  </T>
                  <T v="caption">
                    {l.color} · {l.size} · {inr(l.price)}
                  </T>
                </View>
                <View style={st.stepper}>
                  <Tap onPress={() => setLines((ls) => (l.qty <= 1 ? ls.filter((x) => x._id !== l._id) : ls.map((x) => (x._id === l._id ? { ...x, qty: x.qty - 1 } : x))))} style={st.step}>
                    {l.qty <= 1 ? <Trash2 size={14} color={colors.danger} /> : <Minus size={14} color={colors.ink} />}
                  </Tap>
                  <T v="title" style={{ minWidth: 20, textAlign: 'center', fontSize: 14 }}>
                    {l.qty}
                  </T>
                  <Tap onPress={() => add(l)} style={st.step}>
                    <Plus size={14} color={colors.ink} />
                  </Tap>
                </View>
              </View>
            ))
          )}
          {lines.length > 0 && (
            <>
              <Divider style={{ marginVertical: 10 }} />
              <Row label="Subtotal" value={inr(subtotal)} />
              {disc > 0 && <Row label="Discount" value={`−${inr(disc)}`} tone="success" />}
              <Row label="Total" value={inr(total)} strong />
            </>
          )}
        </Card>

        <SectionLabel>Discount & customer (optional)</SectionLabel>
        <TextInput value={discount} onChangeText={(v) => setDiscount(v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="Discount ₹" placeholderTextColor={colors.faint} style={st.input} />
        <TextInput value={name} onChangeText={setName} placeholder="Customer name" placeholderTextColor={colors.faint} style={st.input} />
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Mobile (for repeat-customer tracking)" placeholderTextColor={colors.faint} style={st.input} />

        <SectionLabel>Payment</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['upi', 'cash', 'card'] as const).map((m) => (
            <Chip key={m} label={m.toUpperCase()} active={method === m} onPress={() => setMethod(m)} />
          ))}
        </View>
      </ScrollView>

      <View style={[st.bar, { paddingBottom: insets.bottom + 10 }]}>
        <Button title={lines.length ? `Charge ${inr(total)}` : 'Charge'} onPress={charge} loading={busy} disabled={!lines.length} />
      </View>

      <Scanner open={scan} onClose={() => setScan(false)} onCode={onScan} title={`Bill · ${lines.reduce((n, l) => n + l.qty, 0)} items`} />

      <Sheet open={pickOpen} onClose={() => setPickOpen(false)} title="Add item">
        <TextInput value={q} onChangeText={setQ} placeholder="Search product, colour, size" placeholderTextColor={colors.faint} style={[st.input, { marginTop: 0 }]} autoFocus />
        <FlatList
          scrollEnabled={false}
          data={filtered}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <Tap
              onPress={() => {
                add(item);
                setPickOpen(false);
                setQ('');
              }}
              style={st.pick}>
              <View style={{ flex: 1 }}>
                <T v="small" style={{ color: colors.ink }} numberOfLines={1}>
                  {item.product}
                </T>
                <T v="caption">
                  {item.color} · {item.size} · {item.stock} left
                </T>
              </View>
              <T v="price" style={{ fontSize: 14 }}>
                {inr(item.price)}
              </T>
            </Tap>
          )}
        />
        <View style={{ height: 16 }} />
      </Sheet>

      <Sheet open={!!receipt} onClose={() => setReceipt(null)} title="Sale recorded">
        {receipt && (
          <>
            <T v="h1" style={{ textAlign: 'center' }}>
              {inr(receipt.finalAmount)}
            </T>
            <T v="caption" style={{ textAlign: 'center', marginTop: 4 }}>
              Bill #{receipt.billNo} · {receipt.paymentMethod.toUpperCase()}
            </T>
            <Card style={{ marginTop: 16 }}>
              {receipt.items.map((i, k) => (
                <Row key={k} label={`${i.name} ${i.size} ×${i.quantity}`} value={inr(i.price * i.quantity)} />
              ))}
            </Card>
            <Button title="Share bill (WhatsApp, SMS…)" kind="outline" icon={<Share2 size={16} color={colors.ink} />} onPress={() => shareReceipt(receipt)} style={{ marginTop: 16 }} />
            <Button title="New bill" onPress={() => setReceipt(null)} style={{ marginTop: 10 }} />
            <View style={{ height: 12 }} />
          </>
        )}
      </Sheet>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill },
  step: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  input: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.ink, marginTop: 10 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 12, backgroundColor: colors.bar, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
