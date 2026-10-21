import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel, StudioHeader, ToggleRow } from '@/components/admin';
import { Button, Card, ErrorState, Field, Skeleton, T } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, GUTTER } from '@/theme';

interface Flow { name: string; trigger: string; templateName: string; isActive: boolean; delay: number }
interface Config { businessName: string; businessId: string; phoneNumberId: string; accessToken: string; webhookVerifyToken: string; webhookUrl: string; isActive: boolean; flows: Flow[]; templates: { _id: string; name: string; status?: string }[] }

export default function WhatsApp() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload, setData } = useFetch<{ config: Config }>('/api/admin/whatsapp');
  const [form, setForm] = useState<Partial<Config>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data?.config) setForm({ businessName: data.config.businessName, businessId: data.config.businessId, phoneNumberId: data.config.phoneNumberId, accessToken: '' });
  }, [data]);
  const c = data?.config;

  async function save(extra: Partial<Config> = {}) {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { businessName: form.businessName, businessId: form.businessId, phoneNumberId: form.phoneNumberId, ...extra };
      if (form.accessToken) body.accessToken = form.accessToken; // blank = keep the stored token
      const r = await api<{ config: Config }>('/api/admin/whatsapp', { method: 'PATCH', body });
      setData({ config: r.config });
      Alert.alert('Saved');
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleFlow(f: Flow) {
    if (!c) return;
    setData({ config: { ...c, flows: c.flows.map((x) => (x.trigger === f.trigger ? { ...x, isActive: !x.isActive } : x)) } });
    await api('/api/admin/whatsapp', { method: 'POST', body: { action: 'toggle_flow', trigger: f.trigger } }).catch((e) => {
      Alert.alert('Not saved', e.message);
      reload();
    });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StudioHeader title="WhatsApp" subtitle="Meta Business API connection" />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading || !c ? (
          <Skeleton style={{ height: 200 }} />
        ) : (
          <>
            <Card style={{ backgroundColor: colors.warningWash, borderColor: colors.warningWash }}>
              <T v="title" style={{ color: colors.warning }}>
                Messages aren’t being sent yet
              </T>
              <T v="small" style={{ marginTop: 4, color: colors.inkSoft }}>
                These settings are saved, but the website has no code that actually sends WhatsApp messages (lib/whatsapp.ts is missing). Turning flows on here won’t message customers until that’s built.
              </T>
            </Card>

            <SectionLabel>Connection</SectionLabel>
            <Card style={{ paddingVertical: 2 }}>
              <ToggleRow
                label="WhatsApp enabled"
                hint={c.isActive ? 'On' : 'Needs WABA ID, phone number ID and token'}
                value={c.isActive}
                onChange={(v) => save({ isActive: v })}
              />
            </Card>
            <View style={{ marginTop: 14 }}>
              <Field label="Business name" value={form.businessName} onChangeText={(v) => setForm((f) => ({ ...f, businessName: v }))} />
              <Field label="WhatsApp Business Account ID" value={form.businessId} onChangeText={(v) => setForm((f) => ({ ...f, businessId: v.trim() }))} keyboardType="number-pad" />
              <Field label="Phone number ID" value={form.phoneNumberId} onChangeText={(v) => setForm((f) => ({ ...f, phoneNumberId: v.trim() }))} keyboardType="number-pad" />
              <Field
                label={`Access token ${c.accessToken ? '(saved — leave blank to keep)' : ''}`}
                value={form.accessToken}
                onChangeText={(v) => setForm((f) => ({ ...f, accessToken: v.trim() }))}
                secureTextEntry
                autoCapitalize="none"
                placeholder={c.accessToken ? '••••••••••••' : 'Paste from Meta Business'}
              />
              <Button title="Save connection" onPress={() => save()} loading={busy} />
            </View>

            <SectionLabel>Automations</SectionLabel>
            <Card style={{ paddingVertical: 2 }}>
              {c.flows.map((f) => (
                <ToggleRow key={f.trigger} label={f.name} hint={`Template “${f.templateName}”${f.delay ? ` · after ${f.delay >= 60 ? `${Math.round(f.delay / 60)}h` : `${f.delay}m`}` : ''}`} value={f.isActive} onChange={() => toggleFlow(f)} />
              ))}
            </Card>

            {c.templates.length > 0 && (
              <>
                <SectionLabel>Templates</SectionLabel>
                <Card>
                  {c.templates.map((t) => (
                    <T key={t._id} v="small" style={{ color: colors.ink, paddingVertical: 4 }}>
                      {t.name} {t.status ? `· ${t.status}` : ''}
                    </T>
                  ))}
                </Card>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
