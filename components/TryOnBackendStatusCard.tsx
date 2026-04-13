import { Text, View } from 'react-native';
import colors from '../theme/colors';

export default function TryOnBackendStatusCard({
  available,
  message,
}: {
  available: boolean | null;
  message: string;
}) {
  const bg = available === null ? '#F3EFE9' : available ? '#EAF6ED' : '#FBEAEA';
  const tone = available === null ? colors.text : available ? '#1D7A35' : '#B00020';

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 18,
        padding: 16,
        marginBottom: 18,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '700',
          color: tone,
          marginBottom: 6,
        }}
      >
        {available === null ? 'Backend durumu kontrol ediliyor' : available ? 'Try-On backend hazır' : 'Try-On backend erişilemiyor'}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
