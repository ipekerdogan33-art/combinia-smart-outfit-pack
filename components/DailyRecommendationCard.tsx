import { Image, Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { DailyHomeRecommendation } from '../lib/homeRecommendation';

export default function DailyRecommendationCard({
  recommendation,
  onPrimaryPress,
  primaryLabel,
}: {
  recommendation: DailyHomeRecommendation;
  onPrimaryPress: () => void;
  primaryLabel: string;
}) {
  const pieces = recommendation.look
    ? Object.values((recommendation.look as any).pieces || {}).filter(Boolean)
    : [];

  const previewUri =
    (recommendation.look as any)?.tryOnPreviewUri || '';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {recommendation.title}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {[recommendation.todayLabel, recommendation.city, `${recommendation.weatherBand}°C`, recommendation.precipitation, recommendation.occasion].map((chip) => (
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

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {recommendation.reason}
      </Text>

      {!!previewUri ? (
        <View
          style={{
            backgroundColor: '#F6F2EC',
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          <Image
            source={{ uri: previewUri }}
            style={{ width: '100%', height: 360 }}
            resizeMode="contain"
          />
        </View>
      ) : (
        !!pieces.length && (
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            {pieces.slice(0, 3).map((item: any, index) => (
              <View
                key={`${item.id}-${index}`}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: '#F6F2EC',
                  marginRight: 10,
                }}
              >
                <Image
                  source={{ uri: item.processedImageUri || item.imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        )
      )}

      <Pressable
        onPress={onPrimaryPress}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: '700',
          }}
        >
          {primaryLabel}
        </Text>
      </Pressable>
    </View>
  );
}
