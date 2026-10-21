import { AtSign, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { VipForm } from '@/components/VipSignup';
import { Card, Header, T, Tap } from '@/components/ui';
import { useBackToHome } from '@/lib/useSystemBack';
import { useConfig } from '@/store/config';
import { colors, fonts, GUTTER, radius } from '@/theme';

/** Mirrors vchuki.com/contact — plus the VIP list sign-up. */
export default function Contact() {
  useBackToHome();
  const cfg = useConfig((s) => s.config);
  const digits = cfg.supportPhone.replace(/\D/g, '');
  return (
    <View style={{ flex: 1 }}>
      <Header title="Contact us" />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: 60 }}>
        <T v="h1">We’re here to help</T>
        <T v="body" style={{ marginTop: 6 }}>
          Sizing, orders, returns or bulk enquiries — WhatsApp is the fastest.
        </T>
        <View style={{ gap: 10, marginTop: 20 }}>
          <Item icon={<MessageCircle size={20} color={colors.success} />} title="WhatsApp us" body="Usually replies within an hour" onPress={() => Linking.openURL(`https://wa.me/${digits}`)} />
          <Item icon={<Phone size={20} color={colors.ink} />} title={cfg.supportPhone} body="Call us" onPress={() => Linking.openURL(`tel:+${digits}`)} />
          <Item icon={<Mail size={20} color={colors.ink} />} title={cfg.supportEmail} body="Orders & returns" onPress={() => Linking.openURL(`mailto:${cfg.supportEmail}`)} />
          <Item icon={<Mail size={20} color={colors.ink} />} title="hello@vchuki.com" body="Collaborations & bulk orders" onPress={() => Linking.openURL('mailto:hello@vchuki.com')} />
          <Item icon={<AtSign size={20} color={colors.ink} />} title="@vchukiofficial" body="Instagram" onPress={() => Linking.openURL(cfg.instagram)} />
        </View>
        <Card style={{ marginTop: 16, gap: 10 }}>
          <View style={st.line}>
            <Clock size={16} color={colors.accentDeep} />
            <T v="small" style={{ color: colors.ink }}>
              Monday to Saturday, 10 AM – 7 PM IST
            </T>
          </View>
          <View style={st.line}>
            <MapPin size={16} color={colors.accentDeep} />
            <T v="small" style={{ color: colors.ink }}>
              Jodhpur, Rajasthan, India
            </T>
          </View>
        </Card>

        <View style={st.vip}>
          <T v="eyebrow" style={{ color: colors.accent }}>
            VIP list
          </T>
          <T style={{ fontFamily: fonts.display, fontSize: 22, color: colors.nightText, marginTop: 4 }}>Early access to new drops</T>
          <VipForm source="app-contact" dark />
        </View>
      </ScrollView>
    </View>
  );
}

function Item({ icon, title, body, onPress }: { icon: ReactNode; title: string; body: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} style={st.item}>
      <View style={st.icon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <T v="title" style={{ fontSize: 14.5 }}>
          {title}
        </T>
        <T v="caption">{body}</T>
      </View>
    </Tap>
  );
}

const st = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vip: { backgroundColor: colors.night, borderRadius: radius.xl, padding: 22, marginTop: 24 },
});
