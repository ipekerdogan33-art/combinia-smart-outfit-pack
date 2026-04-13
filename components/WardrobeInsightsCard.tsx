import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { WardrobeInsights } from '../lib/wardrobeInsights';

export default function WardrobeInsightsCard({
  insights,
}: {
  insights: WardrobeInsights;
}) {
  if (!insights.missingEssentials.length) {
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
          Gardırop İçgörüsü
        </Text>

        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: colors.textSecondary,
          }}
        >
          Şu an temel kategorilerde iyi görünüyorsun. Sıradaki adım daha fazla çeşitlilik eklemek olabilir.
        </Text>
      </View>
    );
  }

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
        Gardıropta Eksik Olabilir
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Temel gardırop yapını güçlendirecek birkaç öneri:
      </Text>

      {insights.missingEssentials.map((item) => (
        <View
          key={item.id}
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
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            {item.reason}
          </Text>
        </View>
      ))}

      <Text
        style={{
          fontSize: 13,
          color: colors.muted,
          marginTop: 4,
        }}
      >
        Favori parça sayısı: {insights.favoriteCount} • Kirli parça sayısı: {insights.dirtyCount}
      </Text>
    </View>
  );
}
