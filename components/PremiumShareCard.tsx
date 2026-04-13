import { Text, View } from 'react-native';
import ProductImageFrame from './ProductImageFrame';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';
import { LookScoreBreakdown } from '../lib/lookScoring';

export default function PremiumShareCard({
  look,
  narrative,
  score,
}: {
  look: SavedLook;
  narrative: string;
  score: LookScoreBreakdown;
}) {
  const pieces = Object.values(look.pieces || {}).filter(Boolean) as any[];
  const previewUri = look.tryOnPreviewUri || '';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 28,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 18,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: colors.muted,
          marginBottom: 8,
          letterSpacing: 1,
        }}
      >
        COMBINIA EDIT
      </Text>

      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {look.title}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {[look.occasion, `${look.weatherBand}°C`, look.precipitation, `Skor ${score.total}`].map((chip) => (
          <View
            key={chip}
            style={{
              backgroundColor: '#F3EFE9',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
              {chip}
            </Text>
          </View>
        ))}
      </View>

      {!!previewUri ? (
        <ProductImageFrame
          uri={previewUri}
          category="try-on"
          variant="hero"
          style={{ marginBottom: 14 }}
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
          {pieces.slice(0, 6).map((item, index) => (
            <ProductImageFrame
              key={`${item.id}-${index}`}
              uri={item.processedImageUri || item.imageUri}
              category={item.category}
              style={{
                width: '31%',
                marginRight: '3%',
                marginBottom: 10,
              }}
            />
          ))}
        </View>
      )}

      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {narrative}
      </Text>

      <View
        style={{
          backgroundColor: '#F7F2EB',
          borderRadius: 18,
          padding: 14,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
          Neden güçlü?
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
          Uyum {score.alignment}/25 • Tamamlılık {score.completion}/25 • Kişisel Sinyal {score.personal}/25 • Finish {score.finish}/25
        </Text>
      </View>
    </View>
  );
}
