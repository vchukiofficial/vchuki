import { Crown, Mail, Rocket } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { confirm, fmtDateTime, SearchBar, StatTile, StudioHeader, ToggleRow } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Empty, ErrorState, Field, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, GUTTER } from '@/theme';

interface Entry { _id: string; email: string; phone?: string; source: string; position?: number; earlyAccess: boolean; createdAt: string; launchEmailSentAt?: string }

export default function Vip() {
  const { data, loading, error, reload, refresh, refreshing, setData } = useFetch<{ entries: Entry[] }>('/api/admin/vip');
  const [q, setQ] = useState('');
  const [compose, setCompose] = useState<{ email?: string } | null>(null);
  const [launching, setLaunching] = useState(false);
  const list = data?.entries || [];
  const shown = useMemo(() => list.filter((e) => !q || e.email.includes(q.toLowerCase()) || (e.phone || '').includes(q)), [list, q]);
  const early = list.filter((e) => e.earlyAccess);
  const pendingLaunch = early.filter((e) => !e.launchEmailSentAt).length;

  async function launch() {
    setLaunching(true);
    try {
      const r = await api<{ sent: number; total?: number; alreadySent: number }>('/api/admin/vip/send-launch-alert', { method: 'POST' });
      Alert.alert('Launch alert', r.sent ? `Sent to ${r.sent} VIPs with code VIPACCESS10.` : `Nothing to send — ${r.alreadySent} already received it.`);
      reload();
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    } finally {
      setLaunching(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="VIP list" subtitle="People waiting for drops" />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(e) => e._id}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListHeaderComponent={
            <View>
              <View style={st.stats}>
                <StatTile label="On the list" value={String(list.length)} />
                <StatTile label="Early access" value={String(early.length)} hint={`${pendingLaunch} not yet alerted`} />
              </View>
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: GUTTER, marginTop: 12 }}>
                <Button title="Email everyone" kind="outline" compact icon={<Mail size={15} color={colors.ink} />} onPress={() => setCompose({})} style={{ flex: 1 }} />
                <Button
                  title="Launch alert"
                  compact
                  icon={<Rocket size={15} color={colors.nightText} />}
                  loading={launching}
                  disabled={!pendingLaunch}
                  onPress={() => confirm('Send launch alert?', `Emails ${pendingLaunch} early-access VIPs with a 10% code (VIPACCESS10). Each person only ever gets it once.`, 'Send', launch, false)}
                  style={{ flex: 1 }}
                />
              </View>
              <SearchBar value={q} onChange={setQ} placeholder="Search email or phone" />
              {loading && (
                <View style={{ padding: GUTTER }}>
                  <Skeleton style={{ height: 120 }} />
                </View>
              )}
            </View>
          }
          ListEmptyComponent={loading ? undefined : <Empty icon={<Crown size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No one yet" />}
          renderItem={({ item: e }) => (
            <Tap
              onPress={() => setCompose({ email: e.email })}
              onLongPress={() =>
                confirm('Remove from list?', e.email, 'Remove', async () => {
                  await api(`/api/admin/vip?id=${e._id}`, { method: 'DELETE' }).catch((er) => Alert.alert('Failed', er.message));
                  setData({ entries: list.filter((x) => x._id !== e._id) });
                })
              }
              style={st.row}>
              <T v="title" style={{ width: 34, fontSize: 13, color: colors.muted }}>
                {e.position ? `#${e.position}` : ''}
              </T>
              <View style={{ flex: 1 }}>
                <T v="small" style={{ color: colors.ink }} numberOfLines={1}>
                  {e.email}
                </T>
                <T v="caption">
                  {e.phone ? `${e.phone} · ` : ''}
                  {e.source} · {fmtDateTime(e.createdAt)}
                </T>
              </View>
              {e.earlyAccess && <Pill tone={e.launchEmailSentAt ? 'success' : 'accent'}>{e.launchEmailSentAt ? 'Alerted' : 'Early'}</Pill>}
            </Tap>
          )}
        />
      )}
      <Compose target={compose} onClose={() => setCompose(null)} />
    </View>
  );
}

function Compose({ target, onClose }: { target: { email?: string } | null; onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [carousel, setCarousel] = useState(true);
  const [busy, setBusy] = useState(false);
  const bulk = !!target && !target.email;

  async function send() {
    if (!subject.trim() || !message.trim()) return Alert.alert('Add a subject and message');
    setBusy(true);
    try {
      const r = await api<{ sent?: number }>('/api/admin/vip/send-email', { method: 'POST', body: { email: target?.email, bulk, subject: subject.trim(), message: message.trim(), includeCarousel: carousel } });
      Alert.alert('Sent', bulk ? `Delivered to ${r.sent ?? 0} people.` : `Sent to ${target?.email}.`);
      onClose();
      setSubject('');
      setMessage('');
    } catch (e: any) {
      Alert.alert('Not sent', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!target} onClose={onClose} title={bulk ? 'Email the whole VIP list' : `Email ${target?.email || ''}`}>
      <Field label="Subject" value={subject} onChangeText={setSubject} />
      <Field label="Message" value={message} onChangeText={setMessage} multiline style={{ height: 120, paddingTop: 14, textAlignVertical: 'top' }} />
      <ToggleRow label="Include product carousel" hint="4 random products with photos" value={carousel} onChange={setCarousel} />
      <Button title={bulk ? 'Send to everyone' : 'Send'} onPress={send} loading={busy} style={{ marginTop: 14 }} />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: GUTTER, marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: GUTTER, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
