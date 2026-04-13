import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { ImageQualityPriority } from '../lib/imageQualityAudit';

export default function ImageCleanupPriorityCard({
  item,
  onPress,
}: {
  item: ImageQualityPriority;
  onPress: () => void;
}) {
  const tone =
    item.severity === 'Yüksek'
      ? { bg: '#FBEAEA', text: '#B00020' }
      : { bg: '#F7F2EB', text: '#8B6A00' };

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
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: tone.bg,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: tone.text, fontWeight: '700', fontSize: 12 }}>
          {item.severity}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {item.name}
      </Text>

      <Text
        style={{
          fontSize: 13,
          color: colors.muted,
          marginBottom: 6,
        }}
      >
        {item.category} • {item.subcategory}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {item.reason}
      </Text>

      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
          Bu Parçayı Temizle
        </Text>
      </Pressable>
    </View>
  );
}
