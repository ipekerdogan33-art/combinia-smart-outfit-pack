import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { ModeReadiness } from '../lib/modeReadiness';

export default function ModeReadinessCard({
  modes,
}: {
  modes: ModeReadiness[];
}) {
  if (!modes.length) return null;

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
        Mod Hazırlık Durumu
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Eksik parçaları eklerken hangi modların daha hazır olduğunu buradan görebilirsin.
      </Text>

      {modes.map((mode) => (
        <View
          key={mode.occasion}
          style={{
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 14,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              {mode.occasion}
            </Text>

            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: mode.ready ? '#1D7A35' : '#8B6A00',
              }}
            >
              {mode.ready ? 'Hazır' : `%${mode.completion}`}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
              marginBottom: mode.missingSlots.length ? 6 : 0,
            }}
          >
            {mode.bestTemplateLabel}
          </Text>

          {!!mode.missingSlots.length && (
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: colors.muted,
              }}
            >
              Eksik olabilir: {mode.missingSlots.join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
