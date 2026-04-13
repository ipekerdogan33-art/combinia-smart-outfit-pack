import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { CleanupStatusRecord } from '../lib/backgroundStatusStorage';

export default function CleanupStatusBadge({
  record,
  cleaned,
}: {
  record?: CleanupStatusRecord | null;
  cleaned: boolean;
}) {
  let label = 'İşlenmedi';
  let bg = '#F3EFE9';
  let tone = colors.text;

  if (record?.source === 'manual-upload') {
    label = 'Manuel PNG';
    bg = '#EAF6ED';
    tone = '#1D7A35';
  } else if (cleaned) {
    label = 'Temiz Görsel';
    bg = '#EAF6ED';
    tone = '#1D7A35';
  } else if (record && !record.cleaned) {
    label = 'Tekrar Dene';
    bg = '#FBEAEA';
    tone = '#B00020';
  }

  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: tone }}>
        {label}
      </Text>
    </View>
  );
}
