import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { LookScoreBreakdown } from '../lib/lookScoring';

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{value}/25</Text>
      </View>

      <View
        style={{
          height: 8,
          backgroundColor: '#F3EFE9',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${(value / 25) * 100}%`,
            height: '100%',
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}

export default function LookScorePanel({
  breakdown,
}: {
  breakdown: LookScoreBreakdown;
}) {
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
            Görünüm Skoru
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Stil, tamamlılık ve kişisel sinyaller birleştirildi.
          </Text>
        </View>

        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 999,
            backgroundColor: '#F3EFE9',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
            {breakdown.total}
          </Text>
        </View>
      </View>

      <MetricRow label="Uyum" value={breakdown.alignment} />
      <MetricRow label="Tamamlılık" value={breakdown.completion} />
      <MetricRow label="Kişisel Sinyal" value={breakdown.personal} />
      <MetricRow label="Finish" value={breakdown.finish} />

      {!!breakdown.notes.length && (
        <View style={{ marginTop: 6 }}>
          {breakdown.notes.map((note) => (
            <Text
              key={note}
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: colors.muted,
                marginBottom: 4,
              }}
            >
              • {note}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
