import { Text, View } from 'react-native';
import colors from '../theme/colors';
import { ConciergeBriefing } from '../lib/conciergeEngine';

export default function ConciergeHeroCard({
  briefing,
}: {
  briefing: ConciergeBriefing;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {briefing.headline}
      </Text>

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 14,
        }}
      >
        {briefing.subheadline}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {[briefing.todayLabel, briefing.weatherLine].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: '#F3EFE9',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              marginRight: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
          marginBottom: 8,
        }}
      >
        {briefing.plannerLine}
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: 21,
          color: colors.textSecondary,
        }}
      >
        {briefing.focusSummary}
      </Text>
    </View>
  );
}
