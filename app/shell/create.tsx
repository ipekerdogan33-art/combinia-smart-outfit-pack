import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import ShellSectionCard from '../../components/ShellSectionCard';
import { getSavedLooks, SavedLook } from '../../lib/savedLooksStorage';
import { publishSavedLook } from '../../lib/communityStorage';
import LookQuickActionCard from '../../components/LookQuickActionCard';

export default function ShellCreateScreen() {
  const [looks, setLooks] = useState<SavedLook[]>([]);

  const load = useCallback(async () => {
    const data = await getSavedLooks();
    setLooks(data.slice(0, 3));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handlePublish = async (look: SavedLook) => {
    await publishSavedLook(look);
    router.push('/shell/community');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Create
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Kombin üretme, kaydetme ve try-on denemeleri için merkezi alan.
        </Text>

        <ShellSectionCard
          title="Bugün ne giymeliyim?"
          description="Mod, hava ve dolap bilgine göre kombin önerileri üret."
          cta="Kombin Üret"
          onPress={() => router.push('/outfit/occasion')}
        />

        <ShellSectionCard
          title="Avatar / Try-On"
          description="Giydiğin görünümü mockup veya avatar akışına taşımak için giriş noktası."
          cta="Try-On Alanını Aç"
          onPress={() => router.push('/tryon')}
        />

        <ShellSectionCard
          title="Kaydedilen görünümler"
          description="Beğendiğin kombinleri tekrar aç, karşılaştır ve planlamaya taşı."
          cta="Kaydedilenleri Aç"
          onPress={() => router.push('/saved')}
        />

        {!!looks.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Son Görünümler
            </Text>

            {looks.map((look) => (
              <LookQuickActionCard
                key={look.id}
                look={look}
                onPlanner={() => router.push(`/shell/planner?lookId=${look.id}`)}
                onTryOn={() => router.push(`/tryon?lookId=${look.id}`)}
                onCommunity={() => handlePublish(look)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
