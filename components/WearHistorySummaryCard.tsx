import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { WearHistoryEntry } from '../lib/wearHistoryStorage';

export default function WearHistorySummaryCard({
  entry,
  itemNames,
}: {
  entry: WearHistoryEntry | null;
  itemNames: string[];
}) {
  if (!entry) return null;

  const date = new Date(entry.wornAt);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        Son Giyim Kaydı
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 6,
        }}
      >
        {entry.lookTitle || 'Giyilen görünüm'} • {date.toLocaleDateString('tr-TR')} {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.muted,
        }}
      >
        {itemNames.join(' • ')}
      </Text>
    </View>
  );
}
