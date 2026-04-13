import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { CleanupPriorityGroup } from '../lib/cleanupPriorityEngine';

export default function CleanupPriorityGroupCard({
  group,
  onProcess,
}: {
  group: CleanupPriorityGroup;
  onProcess: () => void;
}) {
  const tone =
    group.severity === 'Yüksek'
      ? { bg: '#FBEAEA', text: '#B00020' }
      : { bg: '#F7F2EB', text: '#8B6A00' };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
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
          borderRadius: 999,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: tone.text, fontWeight: '700', fontSize: 12 }}>
          {group.severity}
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
        {group.title}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 8,
        }}
      >
        {group.description}
      </Text>

      {!!group.sampleNames.length && (
        <Text
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.muted,
            marginBottom: 12,
          }}
        >
          Örnekler: {group.sampleNames.join(', ')}
        </Text>
      )}

      <Pressable
        onPress={onProcess}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
          Bu Grubu Temizle ({group.count})
        </Text>
      </Pressable>
    </View>
  );
}
