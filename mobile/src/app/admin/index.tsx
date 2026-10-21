import { router } from 'expo-router';
import {
  BarChart3,
  BookOpen,
  Boxes,
  Clapperboard,
  Crown,
  Mail,
  MessageCircle,
  MessageSquareQuote,
  Package,
  ScanBarcode,
  Shirt,
  Sparkles,
  Store,
  Tag,
  Truck,
  Users,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { inr, StatTile, StudioHeader } from '@/components/admin';
import { ErrorState, Pill, Skeleton, T, Tap } from '@/components/ui';
import { orderRef, STATUS_LABEL, STATUS_TONE } from '@/lib/orderStatus';
import type { Order } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useAuth } from '@/store/auth';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface Stats {
  stats: {
    revenue: number;
    onlineRevenue30: number;
    storeRevenue30: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    revenueChangePct: number | null;
    customersChangePct: number | null;
    conversionRatePct: number | null;
    returnRatePct: number | null;
    repeatRatePct: number | null;
    avgOrderValue: number;
    staleOrderCount: number;
    oldestStaleHours: number;
  };
  today: { onlineOrders: number; onlineRevenue: number; storeOrders: number; storeRevenue: number; toShip: number; outOfStock: number; lowStock: number };
  recentOrders: Order[];
}

type Mod = { title: string; body: string; Icon: ComponentType<any>; href: string };

const GROUPS: { label: string; items: Mod[] }[] = [
  {
    label: 'Run the shop',
    items: [
      { title: 'Orders', body: 'Confirm, pack, ship', Icon: Package, href: '/admin/orders' },
      { title: 'Shipping', body: 'Courier & AWB', Icon: Truck, href: '/admin/orders?tab=to_ship' },
      { title: 'Stock', body: 'Scan, restock, ledger', Icon: Boxes, href: '/admin/stock' },
      { title: 'Shop counter', body: 'Bill walk-ins', Icon: Store, href: '/admin/pos' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { title: 'Products', body: 'Prices, photos, sizes', Icon: Shirt, href: '/admin/products' },
      { title: 'Reviews', body: 'Approve & feature', Icon: MessageSquareQuote, href: '/admin/reviews' },
      { title: 'Hero videos', body: 'Home page film', Icon: Clapperboard, href: '/admin/hero-videos' },
      { title: 'Journal', body: 'Blog posts', Icon: BookOpen, href: '/admin/journal' },
    ],
  },
  {
    label: 'Sell more',
    items: [
      { title: 'Coupons', body: 'Codes & limits', Icon: Tag, href: '/admin/coupons' },
      { title: 'Bundles', body: 'Combo offers', Icon: Sparkles, href: '/admin/combos' },
      { title: 'Email', body: 'Campaigns & logs', Icon: Mail, href: '/admin/marketing' },
      { title: 'VIP list', body: 'Waitlist & launch', Icon: Crown, href: '/admin/vip' },
    ],
  },
  {
    label: 'Know your customers',
    items: [
      { title: 'Customers', body: 'Accounts & roles', Icon: Users, href: '/admin/customers' },
      { title: 'Analytics', body: 'Traffic & pages', Icon: BarChart3, href: '/admin/analytics' },
      { title: 'WhatsApp', body: 'Business API setup', Icon: MessageCircle, href: '/admin/whatsapp' },
      { title: 'Email templates', body: 'Test & edit', Icon: Mail, href: '/admin/email-templates' },
    ],
  },
];

const pct = (n: number | null) => (n === null ? '—' : `${n > 0 ? '+' : ''}${n}%`);

export default function Studio() {
  const user = useAuth((s) => s.user);
  const { data, error, loading, refreshing, refresh, reload } = useFetch<Stats>('/api/admin/stats');
  const s = data?.stats;
  const t = data?.today;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title={`${greet}, ${user?.name?.split(' ')[0] || 'team'}`} subtitle="Everything on vchuki.com, from your phone" right={
        <Tap onPress={() => router.push('/admin/stock?scan=1')} style={st.scanBtn} accessibilityLabel="Scan barcode">
          <ScanBarcode size={20} color={colors.onAccent} />
        </Tap>
      } />
      <ScrollView
        contentContainerStyle={{ padding: GUTTER, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading || !s || !t ? (
          <View style={{ gap: 12 }}>
            <Skeleton style={{ height: 140 }} />
            <Skeleton style={{ height: 90 }} />
          </View>
        ) : (
          <>
            {/* Today */}
            <View style={st.today}>
              <T v="eyebrow" style={{ color: colors.accent }}>
                Today
              </T>
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <T style={st.todayNum}>{inr(t.onlineRevenue + t.storeRevenue)}</T>
                  <T v="caption" style={st.todayLbl}>
                    {t.onlineOrders} online · {t.storeOrders} in store
                  </T>
                </View>
                <View style={st.vr} />
                <Tap onPress={() => router.push('/admin/orders?tab=to_ship')} style={{ flex: 0.8, paddingLeft: 16 }}>
                  <T style={[st.todayNum, t.toShip > 0 && { color: colors.accent }]}>{t.toShip}</T>
                  <T v="caption" style={st.todayLbl}>
                    to ship →
                  </T>
                </Tap>
              </View>
              {(s.staleOrderCount > 0 || t.outOfStock > 0 || t.lowStock > 0) && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                  {s.staleOrderCount > 0 && (
                    <Tap onPress={() => router.push('/admin/orders?tab=new')} style={st.alert}>
                      <T v="caption" style={{ color: '#FFD9A8', fontFamily: fonts.semibold }}>
                        ⚠ {s.staleOrderCount} waiting {s.oldestStaleHours}h+
                      </T>
                    </Tap>
                  )}
                  {t.outOfStock > 0 && (
                    <Tap onPress={() => router.push('/admin/stock?filter=out')} style={st.alert}>
                      <T v="caption" style={{ color: '#FFB4A8', fontFamily: fonts.semibold }}>
                        {t.outOfStock} sold out
                      </T>
                    </Tap>
                  )}
                  {t.lowStock > 0 && (
                    <Tap onPress={() => router.push('/admin/stock?filter=low')} style={st.alert}>
                      <T v="caption" style={{ color: '#FFD9A8', fontFamily: fonts.semibold }}>
                        {t.lowStock} running low
                      </T>
                    </Tap>
                  )}
                </View>
              )}
            </View>

            {/* Last 30 days */}
            <T v="caption" style={st.label}>
              Last 30 days
            </T>
            <View style={st.grid}>
              <StatTile label="Online revenue" value={inr(s.onlineRevenue30)} hint={`${pct(s.revenueChangePct)} vs prior 30d`} tone={(s.revenueChangePct || 0) >= 0 ? 'good' : 'bad'} />
              <StatTile label="Store revenue" value={inr(s.storeRevenue30)} hint="Shop counter" />
              <StatTile label="Avg order" value={inr(s.avgOrderValue)} />
              <StatTile label="Conversion" value={pct(s.conversionRatePct).replace('+', '')} hint="orders / visits" />
              <StatTile label="Return rate" value={pct(s.returnRatePct).replace('+', '')} tone={(s.returnRatePct || 0) > 10 ? 'bad' : 'good'} hint="online orders" />
              <StatTile label="Repeat buyers" value={pct(s.repeatRatePct).replace('+', '')} hint={`${s.totalUsers} customers`} onPress={() => router.push('/admin/customers')} />
            </View>
          </>
        )}

        {/* Modules */}
        {GROUPS.map((g) => (
          <View key={g.label}>
            <T v="caption" style={st.label}>
              {g.label}
            </T>
            <View style={st.grid}>
              {g.items.map(({ title, body, Icon, href }) => (
                <Tap key={title} onPress={() => router.push(href as any)} style={st.mod}>
                  <View style={st.modIcon}>
                    <Icon size={19} color={colors.accentDeep} strokeWidth={1.6} />
                  </View>
                  <T v="title" style={{ marginTop: 12, fontSize: 14.5 }}>
                    {title}
                  </T>
                  <T v="caption">{body}</T>
                </Tap>
              ))}
            </View>
          </View>
        ))}

        {/* Recent orders */}
        {!!data?.recentOrders?.length && (
          <>
            <T v="caption" style={st.label}>
              Latest orders
            </T>
            {data.recentOrders.map((o) => (
              <Tap key={o._id} onPress={() => router.push({ pathname: '/admin/orders/[id]', params: { id: o._id } })} style={st.order}>
                <View style={{ flex: 1 }}>
                  <T v="title" style={{ fontSize: 14 }}>
                    #{orderRef(o)} · {o.shippingAddress?.name || 'Customer'}
                  </T>
                  <T v="caption">
                    {inr(o.finalAmount)} · {o.paymentMethod.toUpperCase()} · {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </T>
                </View>
                <Pill tone={STATUS_TONE[o.shippingStatus]}>{STATUS_LABEL[o.shippingStatus]}</Pill>
              </Tap>
            ))}
          </>
        )}

        <T v="caption" style={{ textAlign: 'center', marginTop: 30 }}>
          Razorpay, shipping and email settings stay on the website admin — those screens aren’t connected to a backend yet.
        </T>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  scanBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: colors.night, borderRadius: radius.xl, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
  todayNum: { fontFamily: fonts.display, fontSize: 32, lineHeight: 42, color: colors.nightText },
  todayLbl: { color: 'rgba(245,230,211,0.6)', marginTop: 2 },
  vr: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(245,230,211,0.2)' },
  alert: { backgroundColor: 'rgba(245,230,211,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  label: { letterSpacing: 1, textTransform: 'uppercase', marginTop: 26, marginBottom: 10, marginLeft: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  mod: { width: '48.5%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  modIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accentWash, alignItems: 'center', justifyContent: 'center' },
  order: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
