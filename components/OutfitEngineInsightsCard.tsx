import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { OutfitRecommendation } from '../types/outfit';

function pieceCount(look: OutfitRecommendation) {
  return Object.values(look.pieces).filter(Boolean).length;
}

export default function OutfitEngineInsightsCard({
  recommendation,
}: {
  recommendation: OutfitRecommendation;
}) {
  const count = pieceCount(recommendation);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 18,
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
        Bu öneri neden güçlü?
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {recommendation.explanation}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <View
          style={{
            backgroundColor: '#F3EFE9',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            Skor {Math.round(recommendation.score)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#F3EFE9',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            marginRight: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            {count} parça
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#F3EFE9',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
            {recommendation.occasion}
          </Text>
        </View>
      </View>
    </View>
  );
}
