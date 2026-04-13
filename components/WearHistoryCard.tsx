import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { WearHistoryEntry } from '../lib/wearHistoryStorage';

export default function WearHistoryCard({
  entry,
  itemNames,
}: {
  entry: WearHistoryEntry;
  itemNames: string[];
}) {
  const date = new Date(entry.wornAt);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
        {entry.lookTitle || 'Giyilen Görünüm'}
      </Text>

      <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 6 }}>
        {date.toLocaleDateString('tr-TR')} • {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
      </Text>

      {!!entry.occasion && (
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }}>
          {entry.occasion} • {entry.weatherBand || '-'}°C • {entry.precipitation || '-'}
        </Text>
      )}

      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
        {itemNames.join(' • ')}
      </Text>
    </View>
  );
}
