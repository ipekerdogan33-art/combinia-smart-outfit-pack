import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { getWardrobeItems } from '../../lib/wardrobeStorage';
import {
  addShoppingListItem,
  getShoppingList,
  removeShoppingListItem,
  ShoppingListItem,
  toggleShoppingListPurchased,
} from '../../lib/shoppingListStorage';
import {
  buildShoppingScreenState,
  SmartShoppingSuggestion,
} from '../../lib/shoppingSuggestions';
import ShoppingSuggestionCard from '../../components/ShoppingSuggestionCard';
import ShoppingListItemCard from '../../components/ShoppingListItemCard';

export default function ShoppingScreen() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartShoppingSuggestion[]>([]);

  const load = useCallback(async () => {
    const wardrobeItems = await getWardrobeItems();
    const state = await buildShoppingScreenState(wardrobeItems);
    setShoppingList(state.shoppingList);
    setSmartSuggestions(state.smartSuggestions);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAddSuggestion = async (suggestion: SmartShoppingSuggestion) => {
    await addShoppingListItem({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      subcategory: suggestion.subcategory,
      occasion: suggestion.occasion,
      priority: suggestion.priority,
      purchased: false,
      source: 'smart',
    });
    load();
  };

  const openAddScreen = (category: string, subcategory: string, occasion?: string) => {
    router.push({
      pathname: '/wardrobe/add',
      params: {
        category,
        subcategory,
        occasion: occasion || '',
      },
    });
  };

  const handleTogglePurchased = async (id: string) => {
    await toggleShoppingListPurchased(id);
    load();
  };

  const handleRemove = async (id: string) => {
    await removeShoppingListItem(id);
    load();
  };

  const pendingItems = shoppingList.filter((item) => !item.purchased);
  const purchasedItems = shoppingList.filter((item) => item.purchased);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 80,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Alışveriş Listesi
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Eksik parçaları burada toplayabilir, satın aldıktan sonra doğrudan gardıroba ekleyebilirsin.
        </Text>

        {!!smartSuggestions.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Akıllı Öneriler
            </Text>

            {smartSuggestions.map((suggestion) => (
              <ShoppingSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAdd={() => handleAddSuggestion(suggestion)}
                onOpenAdd={() =>
                  openAddScreen(
                    suggestion.category,
                    suggestion.subcategory,
                    suggestion.occasion
                  )
                }
              />
            ))}
          </>
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Alınacaklar
        </Text>

        {!pendingItems.length ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Şu an aktif alışveriş öğen yok.
            </Text>
          </View>
        ) : (
          pendingItems.map((item) => (
            <ShoppingListItemCard
              key={item.id}
              item={item}
              onToggle={() => handleTogglePurchased(item.id)}
              onRemove={() => handleRemove(item.id)}
              onOpenAdd={() =>
                openAddScreen(item.category, item.subcategory, item.occasion)
              }
            />
          ))
        )}

        {!!purchasedItems.length && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Alındı Olarak İşaretlenenler
            </Text>

            {purchasedItems.map((item) => (
              <ShoppingListItemCard
                key={item.id}
                item={item}
                onToggle={() => handleTogglePurchased(item.id)}
                onRemove={() => handleRemove(item.id)}
                onOpenAdd={() =>
                  openAddScreen(item.category, item.subcategory, item.occasion)
                }
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
