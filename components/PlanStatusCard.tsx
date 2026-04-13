import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { AppPlan } from '../types/access';

export default function PlanStatusCard({
  plan,
  remaining,
  limit,
  onPressManage,
}: {
  plan: AppPlan;
  remaining: number;
  limit: number;
  onPressManage?: () => void;
}) {
  const isPro = plan === 'pro';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: 16,
        marginBottom: 18,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {isPro ? 'Pro plan aktif' : 'Free plan aktif'}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: onPressManage ? 14 : 0,
        }}
      >
        {isPro
          ? 'Sınırsız kombin üretimi ve reklamsız akış açık.'
          : `Bugün kalan ücretsiz kombin hakkın: ${remaining} / ${limit}`}
      </Text>

      {!!onPressManage && (
        <Pressable
          onPress={onPressManage}
          style={{
            backgroundColor: '#F3EFE9',
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            Planı Yönet
          </Text>
        </Pressable>
      )}
    </View>
  );
}
