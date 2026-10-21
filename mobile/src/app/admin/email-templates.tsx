import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { fmtDateTime, StudioHeader, ToggleRow } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Empty, ErrorState, Field, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { useAuth } from '@/store/auth';
import { colors, GUTTER, radius } from '@/theme';

interface Template { _id: string; slug: string; name: string; subject: string; body: string; variables: string[]; isActive: boolean; updatedAt: string }

/** Edit subjects, switch templates on/off and send yourself a test. Full HTML editing stays on desktop. */
export default function EmailTemplates() {
  const me = useAuth((s) => s.user);
  const { data, loading, error, reload, setData } = useFetch<{ templates: Template[] }>('/api/admin/email-templates');
  const [edit, setEdit] = useState<Template | null>(null);
  const [subject, setSubject] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const list = data?.templates || [];

  function open(t: Template) {
    setEdit(t);
    setSubject(t.subject);
    setTo(me?.email || '');
  }

  async function save(patch: Partial<Template>) {
    if (!edit) return;
    setBusy('save');
    try {
      const t = await api<Template>(`/api/admin/email-templates/${edit._id}`, { method: 'PUT', body: patch });
      setData({ templates: list.map((x) => (x._id === t._id ? t : x)) });
      setEdit(t);
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    if (!edit) return;
    setBusy('test');
    try {
      await api('/api/admin/email-templates/test-send', { method: 'POST', body: { to, subject: subject, html: edit.body } });
      Alert.alert('Test sent', `Check ${to}.`);
    } catch (e: any) {
      Alert.alert('Not sent', e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Email templates" subtitle="Order, shipping and welcome emails" />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER }}>
          <Skeleton style={{ height: 100 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(t) => t._id}
          contentContainerStyle={{ padding: GUTTER, gap: 10, paddingBottom: 60 }}
          ListEmptyComponent={<Empty icon={<Mail size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No templates saved" body="Create them from the website admin first." />}
          renderItem={({ item: t }) => (
            <Tap onPress={() => open(t)} style={[st.card, !t.isActive && { opacity: 0.6 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T v="title" style={{ flex: 1, fontSize: 14 }}>
                  {t.name}
                </T>
                <Pill tone={t.isActive ? 'success' : 'dark'}>{t.isActive ? 'On' : 'Off'}</Pill>
              </View>
              <T v="caption" numberOfLines={1} style={{ marginTop: 4 }}>
                {t.subject}
              </T>
              <T v="caption" style={{ marginTop: 2 }}>
                Updated {fmtDateTime(t.updatedAt)}
              </T>
            </Tap>
          )}
        />
      )}
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name || ''}>
        {edit && (
          <>
            <Field label="Subject line" value={subject} onChangeText={setSubject} />
            {!!edit.variables?.length && (
              <T v="caption" style={{ marginTop: -4, marginBottom: 12 }}>
                Variables: {edit.variables.map((v) => `{{${v}}}`).join('  ')}
              </T>
            )}
            <Button title="Save subject" onPress={() => save({ subject })} loading={busy === 'save'} disabled={subject === edit.subject || !subject.trim()} />
            <View style={{ marginTop: 6 }}>
              <ToggleRow label="Template active" value={edit.isActive} onChange={(v) => save({ isActive: v })} />
            </View>
            <Field label="Send a test to" value={to} onChangeText={setTo} autoCapitalize="none" keyboardType="email-address" style={{}} />
            <Button title="Send test email" kind="outline" onPress={test} loading={busy === 'test'} disabled={!to} />
            <View style={{ height: 12 }} />
          </>
        )}
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
