import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { CleanupStatusRecord } from '../lib/backgroundStatusStorage';

export default function CleanupRecentActivityCard({
  records,
  nameById,
}: {
  records: CleanupStatusRecord[];
  nameById: Map<string, string>;
}) {
  if (!records.length) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
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
        Son Temizleme Aktivitesi
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        En son işlenen parçalar ve kullanılan temizleme yöntemi.
      </Text>

      {records.slice(0, 6).map((record) => {
        const date = new Date(record.lastProcessedAt);
        const tone = record.cleaned ? '#1D7A35' : '#B00020';

        return (
          <View
            key={`${record.itemId}-${record.lastProcessedAt}`}
            style={{
              backgroundColor: '#F7F2EB',
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {nameById.get(record.itemId) || 'Parça'}
            </Text>

            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: tone,
                marginBottom: 6,
              }}
            >
              {record.cleaned ? 'Temizlendi' : 'Ham Görsel Korundu'} • {record.source || '—'}
            </Text>

            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: colors.textSecondary,
              }}
            >
              {date.toLocaleDateString('tr-TR')} {date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' • '}
              Deneme: {record.attempts}
            </Text>

            {!!record.lastError && !record.cleaned && (
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: colors.muted,
                  marginTop: 6,
                }}
              >
                {record.lastError}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
