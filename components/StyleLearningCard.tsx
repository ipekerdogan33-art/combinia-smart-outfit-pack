import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { OutfitLearningInsights } from '../lib/outfitFeedbackStorage';

function Tag({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#F3EFE9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}

export default function StyleLearningCard({
  insights,
}: {
  insights: OutfitLearningInsights;
}) {
  const hasSignals =
    insights.likedLooks > 0 ||
    insights.dislikedLooks > 0 ||
    insights.likedSubcategories.length > 0 ||
    insights.avoidedSubcategories.length > 0;

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
        Stil Öğrenmesi
      </Text>

      {!hasSignals ? (
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: colors.textSecondary,
          }}
        >
          Henüz yeterli geri bildirim yok. Kombin ekranında “Beğendim” veya “Bana Göre Değil” kullanırsan motor öğrenmeye başlar.
        </Text>
      ) : (
        <>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: colors.textSecondary,
              marginBottom: 12,
            }}
          >
            Beğendiğin ve eleştirdiğin görünümlerden öğrenilen sinyaller burada özetlenir.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            <Tag label={`Beğenilen görünüm: ${insights.likedLooks}`} />
            <Tag label={`Olumsuz sinyal: ${insights.dislikedLooks}`} />
          </View>

          {!!insights.likedSubcategories.length && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Daha çok sevdiğin parçalar
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {insights.likedSubcategories.map((item) => (
                  <Tag key={item} label={item} />
                ))}
              </View>
            </>
          )}

          {!!insights.avoidedSubcategories.length && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Daha az önereceğim parçalar
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {insights.avoidedSubcategories.map((item) => (
                  <Tag key={item} label={item} />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}
