import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { ActionCenterTask } from '../lib/actionCenterEngine';

export default function ActionTaskCard({
  task,
  onPrimary,
  onSecondary,
}: {
  task: ActionCenterTask;
  onPrimary: () => void;
  onSecondary?: () => void;
}) {
  const tone =
    task.severity === 'Yüksek'
      ? { bg: '#FBEAEA', text: '#B00020' }
      : { bg: '#F7F2EB', text: '#8B6A00' };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: tone.bg,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: tone.text, fontWeight: '700', fontSize: 12 }}>
          {task.severity}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {task.title}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        {task.description}
      </Text>

      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={onPrimary}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 13,
            borderRadius: 8,
            alignItems: 'center',
            marginRight: onSecondary ? 8 : 0,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
            {task.primaryLabel}
          </Text>
        </Pressable>

        {!!task.secondaryLabel && !!onSecondary && (
          <Pressable
            onPress={onSecondary}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              paddingVertical: 13,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
              {task.secondaryLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
