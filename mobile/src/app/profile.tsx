import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Button, Field, Header, T } from '@/components/ui';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { GUTTER } from '@/theme';

export default function Profile() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const [name, setName] = useState(user?.name || '');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const r = await api<{ user: User }>('/api/mobile/me', { method: 'PATCH', body: { name } });
      setUser(r.user);
      router.back();
    } catch (e: any) {
      Alert.alert('Couldn’t save', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ padding: GUTTER }} keyboardShouldPersistTaps="handled">
        <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />
        <Field label="Email" value={user?.email || ''} editable={false} style={{ opacity: 0.6 }} />
        <T v="caption" style={{ marginTop: -4, marginBottom: 20 }}>
          To change your email, write to support@vchuki.com.
        </T>
        <Button title="Save" onPress={save} loading={busy} disabled={name.trim().length < 2 || name.trim() === user?.name} />
        <Button title="Change password" kind="ghost" compact onPress={() => router.push('/auth/forgot')} style={{ marginTop: 10 }} />
      </ScrollView>
    </>
  );
}
