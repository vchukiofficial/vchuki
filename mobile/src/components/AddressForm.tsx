import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { api } from '@/lib/api';
import type { Address } from '@/lib/types';
import { colors } from '@/theme';
import { Button, Field } from './ui';

const EMPTY: Address = { name: '', phone: '', street: '', city: '', state: '', zip: '' };

/** Address entry with pincode → city/state autofill (same /api/location/pincode lookup as the site). */
export function AddressForm({ initial, onSubmit, submitLabel = 'Save address', busy }: { initial?: Partial<Address>; onSubmit: (a: Address) => void; submitLabel?: string; busy?: boolean }) {
  const [a, setA] = useState<Address>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [looking, setLooking] = useState(false);
  const set = (k: keyof Address, v: string) => {
    setA((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function lookup(zip: string) {
    setLooking(true);
    try {
      const r = await api<{ valid: boolean; city?: string; state?: string }>(`/api/location/pincode/${zip}`);
      if (r.valid) setA((p) => ({ ...p, city: r.city || p.city, state: r.state || p.state }));
      else setErrors((e) => ({ ...e, zip: 'We couldn’t find this pincode' }));
    } catch {
      /* let the person type city/state */
    } finally {
      setLooking(false);
    }
  }

  function submit() {
    const e: typeof errors = {};
    if (a.name.trim().length < 2) e.name = 'Enter the recipient’s name';
    if (!/^[6-9]\d{9}$/.test(a.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Enter a 10-digit mobile number';
    if (a.street.trim().length < 6) e.street = 'Add house number, street and area';
    if (!/^\d{6}$/.test(a.zip)) e.zip = 'Enter a 6-digit pincode';
    if (!a.city.trim()) e.city = 'Required';
    if (!a.state.trim()) e.state = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({ ...a, phone: a.phone.replace(/\D/g, '').slice(-10), name: a.name.trim(), street: a.street.trim() });
  }

  return (
    <View>
      <Field label="Full name" value={a.name} onChangeText={(v) => set('name', v)} autoComplete="name" textContentType="name" error={errors.name} />
      <Field
        label="Mobile number"
        value={a.phone}
        onChangeText={(v) => set('phone', v.replace(/[^\d+ ]/g, ''))}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={14}
        error={errors.phone}
      />
      <Field
        label="Pincode"
        value={a.zip}
        onChangeText={(v) => {
          const z = v.replace(/\D/g, '').slice(0, 6);
          set('zip', z);
          if (z.length === 6) lookup(z);
        }}
        keyboardType="number-pad"
        autoComplete="postal-code"
        textContentType="postalCode"
        maxLength={6}
        error={errors.zip}
        right={looking ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      />
      <Field label="House no., street, area" value={a.street} onChangeText={(v) => set('street', v)} autoComplete="street-address" multiline style={{ height: 72, paddingTop: 14 }} error={errors.street} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="City" value={a.city} onChangeText={(v) => set('city', v)} error={errors.city} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="State" value={a.state} onChangeText={(v) => set('state', v)} error={errors.state} />
        </View>
      </View>
      <Button title={submitLabel} onPress={submit} loading={busy} style={{ marginTop: 6 }} />
    </View>
  );
}
