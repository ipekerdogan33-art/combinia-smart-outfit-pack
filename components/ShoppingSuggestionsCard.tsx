import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { ShoppingSuggestion } from '../lib/closetIntelligence';

export default function ShoppingSuggestionsCard({
  items,
}: {
  items: ShoppingSuggestion[];
}) {
  if (!items.length) return null;

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
        Alışveriş Önerileri
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Gardırop dengesini güçlendirecek stratejik parçalar:
      </Text>

      {items.map((item) => (
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
              fontSize: 12,
              fontWeight: '700',
              color: item.priority === 'Yüksek' ? '#B00020' : '#8B6A00',
              marginBottom: 6,
            }}
          >
            Öncelik: {item.priority}
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
    </View>
  );
}
