import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { VisualPriorityAudit } from '../lib/visualPriorityEngine';

export default function VisualPriorityCard({
  audit,
  onOptimize,
}: {
  audit: VisualPriorityAudit;
  onOptimize: () => void;
}) {
  if (!audit.topItems.length) return null;

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
        Yüzey Optimizasyonu
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Ana ekran, planner ve kaydedilen görünümlerde en görünür ham parçaları önce temizleyebilirsin.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          `Görünür ham parça: ${audit.rawVisibleCount}`,
          `Kritik: ${audit.criticalCount}`,
          `Öncelik: ${audit.topItems[0]?.name || '-'}`,
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

      <Pressable
        onPress={onOptimize}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>
          Uygulamayı Görsel Olarak Optimize Et
        </Text>
      </Pressable>
    </View>
  );
}
