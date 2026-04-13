import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';

export default function ShellSectionCard({
  title,
  description,
  cta,
  onPress,
}: {
  title: string;
  description: string;
  cta?: string;
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
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
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
        {title}
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: cta && onPress ? 14 : 0,
        }}
      >
        {description}
      </Text>

      {!!cta && !!onPress && (
        <Pressable
          onPress={onPress}
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
            {cta}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
