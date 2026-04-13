import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { ImageQualityAudit } from '../lib/imageQualityAudit';

export default function ImageQualityHealthCard({
  audit,
  onPress,
}: {
  audit: ImageQualityAudit;
  onPress?: () => void;
}) {
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
          }}
        >
          Görsel Kalitesi
        </Text>

        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            backgroundColor: '#F3EFE9',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
            {audit.score}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Temizlenmiş ve ham görsellerin genel durumu.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: onPress ? 12 : 0 }}>
        {[
          `Toplam: ${audit.total}`,
          `Temiz: ${audit.cleanedCount}`,
          `Ham: ${audit.rawCount}`,
          `Öncelikli: ${audit.highPriorityCount}`,
        ].map((item) => (
          <View
            key={item}
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
              {item}
            </Text>
          </View>
        ))}
      </View>

      {!!onPress && (
        <Pressable
          onPress={onPress}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            Temizleme Merkezini Aç
          </Text>
        </Pressable>
      )}
    </View>
  );
}
