import { Pressable, Text, View } from 'react-native';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';
import { PlannerDay } from '../types/planner';

export default function PlannerDayCard({
  day,
  assignedLook,
  selected,
  onAssign,
  onClear,
}: {
  day: PlannerDay;
  assignedLook?: SavedLook | null;
  selected?: boolean;
  onAssign: () => void;
  onClear: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.borderSoft,
        marginBottom: 12,
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
        {day}
      </Text>

      {assignedLook ? (
        <>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {assignedLook.title}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: 12,
            }}
          >
            {assignedLook.occasion}
          </Text>

          <View style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={onAssign}
              style={{
                flex: 1,
                backgroundColor: '#F3EFE9',
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                Değiştir
              </Text>
            </Pressable>

            <Pressable
              onPress={onClear}
              style={{
                flex: 1,
                backgroundColor: '#F3ECE4',
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#B00020', fontSize: 13, fontWeight: '700' }}>
                Temizle
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Pressable
          onPress={onAssign}
          style={{
            backgroundColor: selected ? colors.primary : '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: selected ? '#fff' : colors.text,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            Görünüm Ata
          </Text>
        </Pressable>
      )}
    </View>
  );
}
