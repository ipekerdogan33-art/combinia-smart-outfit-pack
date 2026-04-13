import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { VisualPriorityItem } from '../lib/visualPriorityEngine';

export default function VisualPriorityItemCard({
  item,
  onProcess,
}: {
  item: VisualPriorityItem;
  onProcess: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
        {item.name}
      </Text>

      <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 6 }}>
        {item.category} • {item.subcategory} • Görsel Öncelik {item.score}
      </Text>

      {!!item.reasons.length && (
        <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginBottom: 12 }}>
          {item.reasons.join(' ')}
        </Text>
      )}

      <Pressable
        onPress={onProcess}
        style={{
          backgroundColor: '#F3EFE9',
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
          Bu Görünür Parçayı Temizle
        </Text>
      </Pressable>
    </View>
  );
}
