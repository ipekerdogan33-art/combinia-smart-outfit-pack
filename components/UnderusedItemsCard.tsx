import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';
import { UnderusedInsight } from '../lib/closetIntelligence';

export default function UnderusedItemsCard({
  items,
}: {
  items: UnderusedInsight[];
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
        Az Kullanılan Parçalar
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Bunlar gardırobunda duruyor ama yeterince sahne alamıyor.
      </Text>

      {items.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            backgroundColor: '#F7F2EB',
            borderRadius: 16,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              marginRight: 12,
            }}
          >
            <Image
              source={{ uri: item.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>

          <View style={{ flex: 1 }}>
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
                fontSize: 13,
                color: colors.muted,
                marginBottom: 6,
              }}
            >
              {item.category}
            </Text>

            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: colors.textSecondary,
              }}
            >
              {item.reason}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
