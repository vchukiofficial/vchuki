import { router, useLocalSearchParams } from 'expo-router';
import { History, ScanBarcode } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { fmtDateTime, HeaderAction, inr, SearchBar, Segments, StatTile, StudioHeader } from '@/components/admin';
import { Scanner } from '@/components/Scanner';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, ErrorState, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface StockItem { _id: string; productId: string; product: string; productSlug: string; color: string; size: string; stock: number; sku: string; barcode: string; price: number; mrp: number }
interface Movement { _id: string; product: string; size: string; color: string; change: number; balanceAfter: number; reason: string; note: string; by: string; createdAt: string }
type Filter = 'all' | 'low' | 'out' | 'healthy';

const REASON: Record<string, string> = { restock: 'Restock', damaged: 'Removed', correction: 'Correction', online_order: 'Online order', store_sale: 'Shop sale', order_restored: 'Returned to stock' };

export default function Stock() {
  const params = useLocalSearchParams<{ filter?: Filter; scan?: string }>();
  const [items, setItems] = useState<StockItem[]>([]);
  const [stats, setStats] = useState<{ totalStock: number; soldOut: number; lowStock: number; missingBarcodes: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(params.filter || 'all');
  const [q, setQ] = useState('');
  const [scan, setScan] = useState(params.scan === '1');
  const [edit, setEdit] = useState<StockItem | null>(null);
  const [ledger, setLedger] = useState<{ title: string; rows: Movement[] } | null>(null);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const r = await api<{ items: StockItem[]; stats: any }>('/api/admin/stock');
      setItems(r.items);
      setStats(r.stats);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => {
      if (t && !`${i.product} ${i.color} ${i.size} ${i.sku} ${i.barcode}`.toLowerCase().includes(t)) return false;
      if (filter === 'out') return i.stock === 0;
      if (filter === 'low') return i.stock > 0 && i.stock <= 5;
      if (filter === 'healthy') return i.stock > 5;
      return true;
    });
  }, [items, q, filter]);

  async function onScan(code: string) {
    setScan(false);
    try {
      const r = await api<{ item: StockItem }>(`/api/admin/stock?code=${encodeURIComponent(code)}`);
      setEdit(r.item);
    } catch (e: any) {
      Alert.alert('Not found', e.message);
    }
  }

  async function openLedger(variantId?: string, title = 'Stock ledger') {
    try {
      const r = await api<{ movements: Movement[] }>(`/api/admin/stock/movements${variantId ? `?variantId=${variantId}` : ''}`);
      setLedger({ title, rows: r.movements });
    } catch (e: any) {
      Alert.alert('Couldn’t load ledger', e.message);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader
        title="Stock"
        subtitle={stats ? `${stats.totalStock} pieces across ${items.length} sizes` : 'Loading…'}
        right={
          <>
            <HeaderAction label="Ledger" icon={<History size={19} color={colors.onAccent} />} onPress={() => openLedger()} />
            <HeaderAction label="Scan" icon={<ScanBarcode size={19} color={colors.onAccent} />} onPress={() => setScan(true)} />
          </>
        }
      />
      {error && !items.length ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />}
          ListHeaderComponent={
            <>
              {stats && (
                <View style={st.stats}>
                  <StatTile label="Sold out" value={String(stats.soldOut)} tone={stats.soldOut ? 'bad' : 'good'} hint="sizes" onPress={() => setFilter('out')} />
                  <StatTile label="Running low" value={String(stats.lowStock)} tone={stats.lowStock ? 'warn' : 'good'} hint="5 or fewer" onPress={() => setFilter('low')} />
                </View>
              )}
              {!!stats?.missingBarcodes && (
                <Tap
                  onPress={async () => {
                    const r = await api<{ assigned: number }>('/api/admin/stock', { method: 'POST' }).catch((e) => Alert.alert('Failed', e.message));
                    if (r) {
                      Alert.alert('Barcodes assigned', `${r.assigned} sizes now have a barcode. Print labels from the website admin.`);
                      load(true);
                    }
                  }}
                  style={st.banner}>
                  <T v="small" style={{ color: colors.warning, fontFamily: fonts.semibold }}>
                    {stats.missingBarcodes} sizes have no barcode — tap to assign
                  </T>
                </Tap>
              )}
              <SearchBar value={q} onChange={setQ} placeholder="Product, colour, size or barcode" />
              <Segments
                items={[
                  { key: 'all', label: 'All' },
                  { key: 'low', label: 'Low' },
                  { key: 'out', label: 'Sold out' },
                  { key: 'healthy', label: 'Healthy' },
                ]}
                value={filter}
                onChange={setFilter}
              />
              {loading && (
                <View style={{ paddingHorizontal: GUTTER, gap: 8 }}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <Skeleton key={k} style={{ height: 60 }} />
                  ))}
                </View>
              )}
            </>
          }
          renderItem={({ item: i }) => (
            <Tap onPress={() => setEdit(i)} style={st.row}>
              <View style={{ flex: 1 }}>
                <T v="title" numberOfLines={1} style={{ fontSize: 14 }}>
                  {i.product}
                </T>
                <T v="caption">
                  {i.color} · {i.size} · {inr(i.price)} {i.barcode ? `· ${i.barcode}` : ''}
                </T>
              </View>
              <View style={[st.qty, i.stock === 0 ? { backgroundColor: colors.dangerWash } : i.stock <= 5 ? { backgroundColor: colors.warningWash } : null]}>
                <T style={{ fontFamily: fonts.bold, fontSize: 16, color: i.stock === 0 ? colors.danger : i.stock <= 5 ? colors.warning : colors.ink }}>{i.stock}</T>
              </View>
            </Tap>
          )}
        />
      )}

      <Scanner open={scan} onClose={() => setScan(false)} onCode={onScan} title="Find stock" />

      <AdjustSheet
        item={edit}
        onClose={() => setEdit(null)}
        onHistory={(i) => openLedger(i._id, `${i.product} · ${i.size}`)}
        onDone={(id, stock) => {
          setItems((x) => x.map((y) => (y._id === id ? { ...y, stock } : y)));
          load(true);
        }}
      />

      <Sheet open={!!ledger} onClose={() => setLedger(null)} title={ledger?.title || ''}>
        {ledger?.rows.length === 0 && <T v="small">No movements yet.</T>}
        {ledger?.rows.map((m) => (
          <View key={m._id} style={st.mov}>
            <View style={{ flex: 1 }}>
              <T v="small" style={{ color: colors.ink }} numberOfLines={1}>
                {REASON[m.reason] || m.reason} · {m.product} {m.size}
              </T>
              <T v="caption" numberOfLines={1}>
                {fmtDateTime(m.createdAt)} {m.by ? `· ${m.by}` : ''} {m.note ? `· ${m.note}` : ''}
              </T>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <T style={{ fontFamily: fonts.bold, color: m.change > 0 ? colors.success : colors.danger }}>{m.change > 0 ? `+${m.change}` : m.change}</T>
              <T v="caption">→ {m.balanceAfter}</T>
            </View>
          </View>
        ))}
        <View style={{ height: 16 }} />
      </Sheet>
    </View>
  );
}

function AdjustSheet({ item, onClose, onDone, onHistory }: { item: StockItem | null; onClose: () => void; onDone: (id: string, stock: number) => void; onHistory: (i: StockItem) => void }) {
  const [mode, setMode] = useState<'add' | 'remove' | 'set'>('add');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setMode('add');
    setQty('');
    setNote('');
  }, [item]);
  if (!item) return null;

  const n = Number(qty) || 0;
  const after = mode === 'add' ? item.stock + n : mode === 'remove' ? item.stock - n : n;

  async function save() {
    setBusy(true);
    try {
      const r = await api<{ stock: number }>('/api/admin/stock', { method: 'PATCH', body: { variantId: item!._id, mode, quantity: n, note: note.trim() || undefined } });
      onDone(item!._id, r.stock);
      onClose();
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!item} onClose={onClose} title={item.product}>
      <T v="small">
        {item.color} · Size {item.size} · {item.barcode || item.sku}
      </T>
      <View style={st.now}>
        <View>
          <T v="caption">In stock now</T>
          <T style={{ fontFamily: fonts.display, fontSize: 34, color: colors.ink }}>{item.stock}</T>
        </View>
        {qty !== '' && (
          <View style={{ alignItems: 'flex-end' }}>
            <T v="caption">After</T>
            <T style={{ fontFamily: fonts.display, fontSize: 34, color: after < 0 ? colors.danger : colors.accentDeep }}>{after}</T>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="+ Restock" active={mode === 'add'} onPress={() => setMode('add')} />
        <Chip label="− Remove" active={mode === 'remove'} onPress={() => setMode('remove')} />
        <Chip label="= Set count" active={mode === 'set'} onPress={() => setMode('set')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        {[1, 5, 10, 20].map((k) => (
          <Chip key={k} label={String(k)} active={qty === String(k)} onPress={() => setQty(String(k))} />
        ))}
      </View>
      <TextInput value={qty} onChangeText={(v) => setQty(v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="Quantity" placeholderTextColor={colors.faint} style={st.input} />
      <TextInput value={note} onChangeText={setNote} placeholder={mode === 'remove' ? 'Reason (damaged, sample, gift…)' : 'Note (optional)'} placeholderTextColor={colors.faint} style={st.input} />
      <Button title="Save" onPress={save} loading={busy} disabled={qty === '' || after < 0} style={{ marginTop: 14 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 8 }}>
        <Button title="History" kind="ghost" compact onPress={() => onHistory(item)} />
        {!!item.productId && (
          <Button
            title="Open product"
            kind="ghost"
            compact
            onPress={() => {
              onClose();
              router.push({ pathname: '/admin/products/[id]', params: { id: item.productId } });
            }}
          />
        )}
      </View>
    </Sheet>
  );
}

const st = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: GUTTER, marginTop: 14 },
  banner: { marginHorizontal: GUTTER, marginTop: 12, backgroundColor: colors.warningWash, padding: 12, borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: GUTTER, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  qty: { minWidth: 46, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand, paddingHorizontal: 10 },
  now: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginVertical: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  input: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.ink, marginTop: 10 },
  mov: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
