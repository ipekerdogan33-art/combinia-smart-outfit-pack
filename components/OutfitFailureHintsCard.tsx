import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { OutfitFailureDiagnosis } from '../lib/outfitDiagnostics';

export default function OutfitFailureHintsCard({
  diagnosis,
}: {
  diagnosis: OutfitFailureDiagnosis;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 24,
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
        Neden kombin çıkmadı?
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {diagnosis.message}
      </Text>

      {!!diagnosis.missingSlots.length && (
        <View
          style={{
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 14,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 6,
            }}
          >
            En yakın eksik liste
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            {diagnosis.missingSlots.join(' • ')}
          </Text>
        </View>
      )}
    </View>
  );
}
