import { buildGuidedAddSuggestion } from './guidedAdd';
import { analyzeModeReadiness } from './modeReadiness';
import { PlannerRotationInsights } from './plannerRotation';
import { SavedLook } from './savedLooksStorage';
import { ShoppingListItem } from './shoppingListStorage';
import { SmartShoppingSuggestion } from './shoppingSuggestions';
import { WeeklyPlan } from '../types/planner';
import { WardrobeItem } from '../types/wardrobe';
import { analyzeImageQuality } from './imageQualityAudit';

export type ActionCenterRoute = {
  pathname: string;
  params?: Record<string, string>;
};

export type ActionCenterShoppingPayload = {
  title: string;
  description: string;
  category: ShoppingListItem['category'];
  subcategory: ShoppingListItem['subcategory'];
  occasion?: ShoppingListItem['occasion'];
  priority: ShoppingListItem['priority'];
};

export type ActionCenterTask = {
  id: string;
  area: 'care' | 'shopping' | 'planner' | 'cleanup';
  severity: 'Yüksek' | 'Orta';
  title: string;
  description: string;
  primaryLabel: string;
  route?: ActionCenterRoute;
  shoppingPayload?: ActionCenterShoppingPayload;
  secondaryLabel?: string;
  secondaryRoute?: ActionCenterRoute;
};

export type ActionCenterSummary = {
  highCount: number;
  mediumCount: number;
  careCount: number;
  plannerCount: number;
  shoppingCount: number;
  cleanupCount: number;
};

export type ActionCenterState = {
  summary: ActionCenterSummary;
  tasks: ActionCenterTask[];
};

function todayAndUpcomingDays(plan: WeeklyPlan) {
  return Object.entries(plan)
    .filter(([, lookId]) => !!lookId)
    .map(([day, lookId]) => ({ day, lookId: lookId as string }));
}

export function buildActionCenterState(args: {
  wardrobeItems: WardrobeItem[];
  weeklyPlan: WeeklyPlan;
  savedLooks: SavedLook[];
  shoppingList: ShoppingListItem[];
  smartSuggestions: SmartShoppingSuggestion[];
  rotationInsights: PlannerRotationInsights;
}): ActionCenterState {
  const { wardrobeItems, weeklyPlan, savedLooks, shoppingList, smartSuggestions, rotationInsights } = args;

  const tasks: ActionCenterTask[] = [];
  const lookMap = new Map(savedLooks.map((look) => [look.id, look]));
  const itemMap = new Map(wardrobeItems.map((item) => [item.id, item]));

  const plannedEntries = todayAndUpcomingDays(weeklyPlan);

  plannedEntries.forEach(({ day, lookId }) => {
    const look = lookMap.get(lookId);
    if (!look) return;

    const itemIds = Object.values(look.pieces || {})
      .filter(Boolean)
      .map((item: any) => item.id);

    itemIds.forEach((itemId) => {
      const item = itemMap.get(itemId);
      if (!item) return;

      if (item.status === 'Kirli' || item.status === 'Kuru Temizlemede') {
        tasks.push({
          id: `care-${day}-${item.id}`,
          area: 'care',
          severity: item.status === 'Kuru Temizlemede' ? 'Yüksek' : 'Orta',
          title: `${item.name} plan öncesi hazır değil`,
          description: `${day} günü planlanan görünüm içinde yer alıyor ama şu an ${item.status.toLocaleLowerCase('tr-TR')} durumda.`,
          primaryLabel: 'Bakım Merkezini Aç',
          route: {
            pathname: '/care',
          },
        });
      }
    });
  });

  rotationInsights.warnings.slice(0, 2).forEach((warning, index) => {
    tasks.push({
      id: `planner-warning-${index}`,
      area: 'planner',
      severity: warning.level,
      title: warning.title,
      description: warning.description,
      primaryLabel: 'Planner’ı Aç',
      route: {
        pathname: '/shell/planner',
      },
    });
  });

  const weakestMode = [...analyzeModeReadiness(wardrobeItems)]
    .filter((mode) => !mode.ready && mode.missingSlotKeys.length > 0)
    .sort((a, b) => a.completion - b.completion)[0];

  if (weakestMode) {
    const guided = buildGuidedAddSuggestion(
      weakestMode.occasion,
      weakestMode.missingSlotKeys[0]
    );

    tasks.push({
      id: `shopping-guided-${guided.subcategory}`,
      area: 'shopping',
      severity: weakestMode.completion < 50 ? 'Yüksek' : 'Orta',
      title: `${weakestMode.occasion} modunu güçlendir`,
      description: `${weakestMode.bestTemplateLabel} tarafını güçlendirmek için ${guided.subcategory.toLocaleLowerCase('tr-TR')} eklemek iyi olabilir.`,
      primaryLabel: 'Listeye Ekle',
      shoppingPayload: {
        title: `${weakestMode.occasion} için ${guided.title}`,
        description: `${weakestMode.occasion} tarafını güçlendirmek için önerildi.`,
        category: guided.category,
        subcategory: guided.subcategory,
        occasion: guided.occasion,
        priority: weakestMode.completion < 50 ? 'Yüksek' : 'Orta',
      },
      secondaryLabel: 'Hemen Ekle',
      secondaryRoute: {
        pathname: '/wardrobe/add',
        params: {
          category: guided.category,
          subcategory: guided.subcategory,
          occasion: guided.occasion,
        },
      },
    });
  }

  smartSuggestions.slice(0, 2).forEach((suggestion) => {
    tasks.push({
      id: `shopping-smart-${suggestion.id}`,
      area: 'shopping',
      severity: suggestion.priority,
      title: suggestion.title,
      description: suggestion.description,
      primaryLabel: 'Listeye Ekle',
      shoppingPayload: {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        subcategory: suggestion.subcategory,
        occasion: suggestion.occasion,
        priority: suggestion.priority,
      },
      secondaryLabel: 'Ürün Ekle',
      secondaryRoute: {
        pathname: '/wardrobe/add',
        params: {
          category: suggestion.category,
          subcategory: suggestion.subcategory,
          occasion: suggestion.occasion || '',
        },
      },
    });
  });

  const pendingShoppingCount = shoppingList.filter((item) => !item.purchased).length;
  if (pendingShoppingCount > 0) {
    tasks.push({
      id: 'shopping-list-review',
      area: 'shopping',
      severity: 'Orta',
      title: 'Alışveriş listesini gözden geçir',
      description: `Listede bekleyen ${pendingShoppingCount} öğe var.`,
      primaryLabel: 'Listeyi Aç',
      route: {
        pathname: '/shopping',
      },
    });
  }

  const imageAudit = analyzeImageQuality(wardrobeItems);
  if (imageAudit.rawCount > 0) {
    const topNames = imageAudit.priorityItems.slice(0, 2).map((item) => item.name).join(', ');

    tasks.push({
      id: 'cleanup-images',
      area: 'cleanup',
      severity: imageAudit.highPriorityCount > 0 ? 'Yüksek' : 'Orta',
      title: 'Arka plan temizleme eksikleri var',
      description: topNames
        ? `${imageAudit.rawCount} parça hâlâ ham görselle duruyor. Öncelik örnekleri: ${topNames}.`
        : `${imageAudit.rawCount} parça hâlâ ham görselle duruyor.`,
      primaryLabel: 'Temizleme Merkezini Aç',
      route: {
        pathname: '/background-cleanup',
      },
    });
  }

  const uniqueTasks = tasks.filter(
    (task, index, array) =>
      array.findIndex((entry) => entry.title === task.title && entry.description === task.description) === index
  ).slice(0, 10);

  const summary: ActionCenterSummary = {
    highCount: uniqueTasks.filter((task) => task.severity === 'Yüksek').length,
    mediumCount: uniqueTasks.filter((task) => task.severity === 'Orta').length,
    careCount: uniqueTasks.filter((task) => task.area === 'care').length,
    plannerCount: uniqueTasks.filter((task) => task.area === 'planner').length,
    shoppingCount: uniqueTasks.filter((task) => task.area === 'shopping').length,
    cleanupCount: uniqueTasks.filter((task) => task.area === 'cleanup').length,
  };

  return {
    summary,
    tasks: uniqueTasks,
  };
}
