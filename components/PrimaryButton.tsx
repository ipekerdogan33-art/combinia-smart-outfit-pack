import { Pressable, Text } from 'react-native';
import colors from '../theme/colors';

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? colors.disabled : colors.primary,
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}
