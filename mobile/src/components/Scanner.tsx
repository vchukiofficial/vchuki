import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme';
import { Button, IconBtn, T } from './ui';

/** Full-screen barcode scanner for the Code128 labels printed from Studio → Stock → Labels. */
export function Scanner({ open, onClose, onCode, title = 'Scan label' }: { open: boolean; onClose: () => void; onCode: (code: string) => void; title?: string }) {
  const [perm, request] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const last = useRef<{ code: string; at: number }>({ code: '', at: 0 });

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {perm?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['code128', 'code39', 'ean13', 'qr'] }}
            onBarcodeScanned={({ data }) => {
              // Ignore the same label read again within 2 seconds
              const now = Date.now();
              if (data === last.current.code && now - last.current.at < 2000) return;
              last.current = { code: data, at: now };
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              onCode(data);
            }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <T v="h2" style={{ color: colors.nightText, textAlign: 'center' }}>
              Camera access needed
            </T>
            <T v="small" style={{ color: 'rgba(245,230,211,0.7)', textAlign: 'center', marginTop: 8 }}>
              To scan stock labels and bill at the counter.
            </T>
            <Button title="Allow camera" kind="accent" onPress={request} style={{ marginTop: 20, alignSelf: 'stretch' }} />
          </View>
        )}
        {perm?.granted && (
          <View pointerEvents="none" style={st.frameWrap}>
            <View style={st.frame} />
            <T style={{ color: colors.white, fontFamily: fonts.medium, marginTop: 18 }}>Point at the barcode on the tag</T>
          </View>
        )}
        <View style={[st.top, { paddingTop: insets.top + 8 }]}>
          <T style={{ color: colors.white, fontFamily: fonts.display, fontSize: 20, flex: 1 }}>{title}</T>
          <IconBtn label="Close scanner" onPress={onClose} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <X size={20} color={colors.white} />
          </IconBtn>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  frameWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 280, height: 150, borderRadius: 16, borderWidth: 2, borderColor: colors.accent, backgroundColor: 'rgba(196,149,106,0.08)' },
});
