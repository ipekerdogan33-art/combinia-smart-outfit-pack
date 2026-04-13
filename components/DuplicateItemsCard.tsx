import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { DuplicateGroup } from '../lib/closetIntelligence';

export default function DuplicateItemsCard({
  groups,
}: {
  groups: DuplicateGroup[];
}) {
  if (!groups.length) return null;

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
        Benzer Parça Tespiti
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        Dolabında tekrar eden parça kümeleri var. Bu, yeni alışveriş kararlarında iyi bir sinyal olabilir.
      </Text>

      {groups.map((group) => (
        <View
          key={group.id}
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
            {group.title}
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            {group.suggestion}
          </Text>
        </View>
      ))}
    </View>
  );
}
