import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { ConciergePriority } from '../lib/conciergeEngine';

export default function ConciergePriorityCard({
  priority,
  onPress,
}: {
  priority: ConciergePriority;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {priority.title}
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {priority.description}
      </Text>

      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
          {priority.ctaLabel}
        </Text>
      </Pressable>
    </View>
  );
}
