import { ActivityIndicator, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function ProcessingStatusCard({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="small" color={colors.primary} />
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
          {title}
        </Text>
        {!!detail && (
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.textSecondary }}>
            {detail}
          </Text>
        )}
      </View>
    </View>
  );
}
