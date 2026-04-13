import { analyzeModeReadiness } from './modeReadiness';
import { analyzeWardrobe } from './wardrobeInsights';
import {
  deriveOutfitLearningInsights,
  getOutfitFeedbackState,
} from './outfitFeedbackStorage';
import { getWeeklyPlan } from './plannerStorage';
import { getUserSettings } from './settingsStorage';
import { buildDailyHomeRecommendation, DailyHomeRecommendation, getTodayLabel } from './homeRecommendation';
import { buildGuidedAddSuggestion } from './guidedAdd';
import { OnboardingData } from '../types/onboarding';
import { WardrobeItem } from '../types/wardrobe';
import { SavedLook } from './savedLooksStorage';

export type ConciergeRoute = {
  pathname: string;
  params?: Record<string, string>;
};

export type ConciergePriority = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  route: ConciergeRoute;
};

export type ConciergeBriefing = {
  headline: string;
  subheadline: string;
  weatherLine: string;
  plannerLine: string;
  focusSummary: string;
  todayLabel: string;
  dailyRecommendation: DailyHomeRecommendation | null;
  priorities: ConciergePriority[];
};

export async function buildConciergeBriefing(
  profile: OnboardingData | null,
  wardrobeItems: WardrobeItem[],
  savedLooks: SavedLook[]
): Promise<ConciergeBriefing | null> {
  if (!profile) return null;

  const [settings, weeklyPlan, feedbackState] = await Promise.all([
    getUserSettings(),
    getWeeklyPlan(),
    getOutfitFeedbackState(),
  ]);

  const todayLabel = getTodayLabel();
  const dailyRecommendation = await buildDailyHomeRecommendation(
    profile,
    wardrobeItems,
    savedLooks
  );

  const wardrobeInsights = analyzeWardrobe(wardrobeItems);
  const modeReadiness = analyzeModeReadiness(wardrobeItems);
  const learning = deriveOutfitLearningInsights(feedbackState, wardrobeItems);

  const plannedLookId = weeklyPlan[todayLabel as keyof typeof weeklyPlan] || null;
  const hasPlannedLook = !!plannedLookId;
  const weakestMode = [...modeReadiness].sort((a, b) => a.completion - b.completion)[0];
  const bestMode = [...modeReadiness].sort((a, b) => b.completion - a.completion)[0];

  const headline = hasPlannedLook
    ? `${todayLabel} için planın hazır`
    : 'Bugün için kişisel stil brifingin hazır';

  const subheadline = hasPlannedLook
    ? 'Planner içine atanmış görünüm öncelikli olarak öne çıkarıldı.'
    : 'Hava, stil profilin, geri bildirimlerin ve gardırobun birlikte değerlendirildi.';

  const weatherLine = dailyRecommendation
    ? `${dailyRecommendation.city} • ${dailyRecommendation.weatherBand}°C • ${dailyRecommendation.precipitation}`
    : `${settings.weatherCity} • hava bağlamı alınamadı`;

  const plannerLine = hasPlannedLook
    ? 'Bugün planner içinde bir görünüm atanmış.'
    : 'Bugün için planner boş. Otomatik yönlendirme yapılabilir.';

  const focusSummary = bestMode
    ? `Şu an en güçlü modun ${bestMode.occasion}. En çok zorlanan modun ${weakestMode?.occasion || '—'}.`
    : 'Henüz yeterli sinyal yok.';

  const priorities: ConciergePriority[] = [];

  if (dailyRecommendation?.look) {
    if (dailyRecommendation.source === 'planner') {
      priorities.push({
        id: 'planner-open',
        title: 'Bugünün planlı görünümünü aç',
        description: 'Planner içine atanmış görünümünü hızlıca kontrol et.',
        ctaLabel: 'Planner’ı Aç',
        route: {
          pathname: '/shell/planner',
          params: {
            lookId: (dailyRecommendation.look as any).id,
          },
        },
      });
    } else if (dailyRecommendation.source === 'saved-fallback') {
      priorities.push({
        id: 'saved-open',
        title: 'Kaydedilmiş görünümden devam et',
        description: 'Bugün için en yakın kayıtlı görünüm öne çıkarıldı.',
        ctaLabel: 'Kaydedilenleri Aç',
        route: {
          pathname: '/saved',
        },
      });
    } else if (dailyRecommendation.source === 'generated') {
      priorities.push({
        id: 'generated-open',
        title: 'Bugünün önerisini aç',
        description: 'Profilin ve hava bağlamına göre önerilen görünümü aç.',
        ctaLabel: 'Öneriyi Aç',
        route: {
          pathname: '/outfit',
          params: {
            occasion: dailyRecommendation.occasion,
            weatherBand: dailyRecommendation.weatherBand,
            precipitation: dailyRecommendation.precipitation,
          },
        },
      });
    }
  }

  if (weakestMode?.missingSlotKeys?.length) {
    const suggestion = buildGuidedAddSuggestion(
      weakestMode.occasion,
      weakestMode.missingSlotKeys[0]
    );

    priorities.push({
      id: 'guided-add',
      title: `${weakestMode.occasion} modunu güçlendir`,
      description: `Eksik ana parçalardan biri ${suggestion.title.toLocaleLowerCase('tr-TR')} olabilir.`,
      ctaLabel: `Eksik ${suggestion.title} Ekle`,
      route: {
        pathname: '/wardrobe/add',
        params: {
          category: suggestion.category,
          subcategory: suggestion.subcategory,
          occasion: suggestion.occasion,
        },
      },
    });
  }

  const unrenderedLook = savedLooks.find((look) => !look.tryOnPreviewUri);

  if (unrenderedLook) {
    priorities.push({
      id: 'tryon-open',
      title: 'Bir görünümü try-on ile zenginleştir',
      description: 'Henüz try-on preview olmayan kayıtlı bir görünümün var.',
      ctaLabel: 'Try-On’da Aç',
      route: {
        pathname: '/tryon',
        params: {
          lookId: unrenderedLook.id,
        },
      },
    });
  }

  if (!unrenderedLook && learning.likedSubcategories.length) {
    priorities.push({
      id: 'style-refresh',
      title: 'Sevdiğin stile göre yeni öneri üret',
      description: `Motor şu an özellikle ${learning.likedSubcategories.slice(0, 2).join(' ve ')} tarafını daha güçlü görüyor.`,
      ctaLabel: 'Yeni Kombin Üret',
      route: {
        pathname: '/outfit/occasion',
      },
    });
  }

  if (!priorities.length) {
    priorities.push({
      id: 'wardrobe-open',
      title: 'Gardırobunu büyüt',
      description: 'Daha güçlü öneriler için dolabına birkaç parça daha eklemek faydalı olabilir.',
      ctaLabel: 'Gardırobu Aç',
      route: {
        pathname: '/wardrobe',
      },
    });
  }

  return {
    headline,
    subheadline,
    weatherLine,
    plannerLine,
    focusSummary,
    todayLabel,
    dailyRecommendation,
    priorities: priorities.slice(0, 3),
  };
}
