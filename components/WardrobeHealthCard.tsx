import { Text, View } from 'react-native';
import colors from '../theme/colors';

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        backgroundColor: '#F3EFE9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
        {label}: {value}
      </Text>
    </View>
  );
}

export default function WardrobeHealthCard({
  cleanCount,
  dirtyCount,
  dryCleaningCount,
  totalCount,
}: {
  cleanCount: number;
  dirtyCount: number;
  dryCleaningCount: number;
  totalCount: number;
}) {
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
        Gardırop Sağlığı
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Kıyafetlerin bakım durumu ve toplam stok görünümü.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <CountPill label="Toplam" value={totalCount} />
        <CountPill label="Temiz" value={cleanCount} />
        <CountPill label="Kirli" value={dirtyCount} />
        <CountPill label="Kuru Temizleme" value={dryCleaningCount} />
      </View>
    </View>
  );
}
