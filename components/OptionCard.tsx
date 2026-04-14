import { Pressable, Text } from 'react-native';
import colors from '../theme/colors';

export default function OptionCard({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 8,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        marginBottom: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', color: active ? '#fff' : colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
