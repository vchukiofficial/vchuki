import { Plus, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { confirm, fmtDateTime, HeaderAction, Segments, StudioHeader } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, Empty, ErrorState, Field, Pill, Skeleton, T } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, GUTTER, radius } from '@/theme';

interface Job { _id: string; recipientType: 'custom' | 'waitlist'; to: string; subject: string; heading: string; content: string; scheduledAt: string; status: 'pending' | 'sent' | 'failed' | 'cancelled'; sentCount: number; error?: string }
interface Log { _id: string; type: string; channel: string; to: string; subject: string; status: 'sent' | 'failed'; error?: string; createdAt: string }

const TONE = { pending: 'warning', sent: 'success', failed: 'danger', cancelled: 'dark' } as const;

export default function Marketing() {
  const [tab, setTab] = useState<'campaigns' | 'log'>('campaigns');
  const [logType, setLogType] = useState('all');
  const jobs = useFetch<{ jobs: Job[] }>('/api/admin/communications/schedule');
  const logs = useFetch<{ logs: Log[]; counts: Record<string, number> }>(tab === 'log' ? `/api/admin/communications?type=${logType}&limit=100` : null);
  const [open, setOpen] = useState(false);

  async function act(j: Job, kind: 'send' | 'cancel') {
    try {
      if (kind === 'send') await api(`/api/admin/communications/schedule/${j._id}/send-now`, { method: 'POST' });
      else await api(`/api/admin/communications/schedule/${j._id}`, { method: 'PATCH' });
      jobs.reload();
    } catch (e: any) {
      Alert.alert('Failed', e.message);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Email" subtitle="Campaigns to customers and the VIP list" right={<HeaderAction label="New campaign" icon={<Plus size={20} color={colors.onAccent} />} onPress={() => setOpen(true)} />} />
      <View>
        <Segments
          items={[
            { key: 'campaigns', label: 'Campaigns' },
            { key: 'log', label: 'Sent log' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'campaigns' ? (
        jobs.error && !jobs.data ? (
          <ErrorState message={jobs.error} onRetry={jobs.reload} />
        ) : jobs.loading ? (
          <View style={{ paddingHorizontal: GUTTER }}>
            <Skeleton style={{ height: 100 }} />
          </View>
        ) : (
          <FlatList
            data={jobs.data?.jobs || []}
            keyExtractor={(j) => j._id}
            contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 10, paddingBottom: 60 }}
            refreshControl={<RefreshControl refreshing={jobs.refreshing} onRefresh={jobs.refresh} tintColor={colors.accent} />}
            ListEmptyComponent={<Empty icon={<Send size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No campaigns yet" action="Write a campaign" onAction={() => setOpen(true)} />}
            renderItem={({ item: j }) => (
              <View style={st.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T v="title" style={{ flex: 1, fontSize: 14 }} numberOfLines={1}>
                    {j.subject}
                  </T>
                  <Pill tone={TONE[j.status]}>{j.status}</Pill>
                </View>
                <T v="caption" style={{ marginTop: 4 }} numberOfLines={1}>
                  To {j.recipientType === 'waitlist' ? 'VIP waitlist' : j.to} · {fmtDateTime(j.scheduledAt)}
                  {j.status === 'sent' ? ` · ${j.sentCount} sent` : ''}
                </T>
                {!!j.error && (
                  <T v="caption" style={{ color: colors.danger, marginTop: 4 }}>
                    {j.error}
                  </T>
                )}
                {j.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <Button title="Send now" compact onPress={() => confirm('Send now?', j.recipientType === 'waitlist' ? 'Goes to everyone on the VIP list.' : `Goes to ${j.to}.`, 'Send', () => act(j, 'send'), false)} style={{ flex: 1 }} />
                    <Button title="Cancel" kind="outline" compact onPress={() => confirm('Cancel campaign?', '', 'Cancel it', () => act(j, 'cancel'))} style={{ flex: 1 }} />
                  </View>
                )}
              </View>
            )}
          />
        )
      ) : (
        <>
          <Segments
            items={[
              { key: 'all', label: 'All', count: logs.data?.counts.total },
              { key: 'order', label: 'Orders', count: logs.data?.counts.order },
              { key: 'shipping', label: 'Shipping', count: logs.data?.counts.shipping },
              { key: 'marketing', label: 'Marketing', count: logs.data?.counts.marketing },
              { key: 'otp', label: 'OTP', count: logs.data?.counts.otp },
            ]}
            value={logType}
            onChange={setLogType}
          />
          {!!logs.data?.counts.failed && (
            <T v="caption" style={{ color: colors.danger, paddingHorizontal: GUTTER, marginBottom: 6 }}>
              {logs.data.counts.failed} emails have failed in total
            </T>
          )}
          <FlatList
            data={logs.data?.logs || []}
            keyExtractor={(l) => l._id}
            contentContainerStyle={{ paddingBottom: 60 }}
            refreshControl={<RefreshControl refreshing={logs.refreshing} onRefresh={logs.refresh} tintColor={colors.accent} />}
            renderItem={({ item: l }) => (
              <View style={st.log}>
                <View style={{ flex: 1 }}>
                  <T v="small" style={{ color: colors.ink }} numberOfLines={1}>
                    {l.subject}
                  </T>
                  <T v="caption" numberOfLines={1}>
                    {l.to} · {fmtDateTime(l.createdAt)}
                  </T>
                  {!!l.error && (
                    <T v="caption" style={{ color: colors.danger }} numberOfLines={2}>
                      {l.error}
                    </T>
                  )}
                </View>
                <Pill tone={l.status === 'sent' ? 'success' : 'danger'}>{l.type}</Pill>
              </View>
            )}
          />
        </>
      )}

      <NewCampaign open={open} onClose={() => setOpen(false)} onDone={() => jobs.reload()} />
    </View>
  );
}

function NewCampaign({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [who, setWho] = useState<'waitlist' | 'custom'>('waitlist');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [cta, setCta] = useState('Shop Now');
  const [link, setLink] = useState('https://vchuki.com/shirts');
  const [when, setWhen] = useState<'now' | '1h' | 'tomorrow9'>('now');
  const [busy, setBusy] = useState(false);

  function scheduledAt() {
    if (when === '1h') return new Date(Date.now() + 3600000).toISOString();
    if (when === 'tomorrow9') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    }
    return undefined;
  }

  async function send() {
    if (!subject.trim() || !heading.trim() || !content.trim()) return Alert.alert('Subject, heading and message are required');
    if (who === 'custom' && !to.trim()) return Alert.alert('Add at least one email address');
    setBusy(true);
    try {
      await api('/api/admin/communications/schedule', {
        method: 'POST',
        body: {
          recipientType: who,
          to: to.trim(),
          subject: subject.trim(),
          heading: heading.trim(),
          content: content
            .trim()
            .split(/\n{2,}/)
            .map((p) => `<p>${p.replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</p>`)
            .join(''),
          ctaText: cta,
          ctaLink: link,
          scheduledAt: scheduledAt(),
        },
      });
      onDone();
      onClose();
      setSubject('');
      setHeading('');
      setContent('');
      Alert.alert(when === 'now' ? 'Sent' : 'Scheduled');
    } catch (e: any) {
      Alert.alert('Not sent', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New email campaign">
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Chip label="VIP waitlist" active={who === 'waitlist'} onPress={() => setWho('waitlist')} />
        <Chip label="Specific emails" active={who === 'custom'} onPress={() => setWho('custom')} />
      </View>
      {who === 'custom' && <Field label="To (comma separated)" value={to} onChangeText={setTo} autoCapitalize="none" keyboardType="email-address" />}
      <Field label="Subject line" value={subject} onChangeText={setSubject} placeholder="New Diwali colours are here" />
      <Field label="Heading in the email" value={heading} onChangeText={setHeading} />
      <Field label="Message" value={content} onChangeText={setContent} multiline style={{ height: 130, paddingTop: 14, textAlignVertical: 'top' }} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Button text" value={cta} onChangeText={setCta} />
        </View>
        <View style={{ flex: 1.4 }}>
          <Field label="Button link" value={link} onChangeText={setLink} autoCapitalize="none" />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <Chip label="Send now" active={when === 'now'} onPress={() => setWhen('now')} />
        <Chip label="In 1 hour" active={when === '1h'} onPress={() => setWhen('1h')} />
        <Chip label="Tomorrow 9 AM" active={when === 'tomorrow9'} onPress={() => setWhen('tomorrow9')} />
      </View>
      <Button title={when === 'now' ? 'Send campaign' : 'Schedule campaign'} onPress={send} loading={busy} />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  log: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: GUTTER, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
