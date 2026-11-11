import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

// Cross-platform confirm dialog (Alert.alert does nothing on web / Snack preview).
export default function ConfirmModal({ visible, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.row}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  message: { fontSize: 15, color: COLORS.muted, marginTop: 8, lineHeight: 21 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  cancel: { backgroundColor: COLORS.border },
  confirm: { backgroundColor: COLORS.danger },
  cancelText: { color: COLORS.text, fontWeight: '600' },
  confirmText: { color: '#fff', fontWeight: '700' },
});
