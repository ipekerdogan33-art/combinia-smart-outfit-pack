import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import colors from '../../theme/colors';
import OptionCard from '../../components/OptionCard';
import PrimaryButton from '../../components/PrimaryButton';
import { getWardrobeItems, updateWardrobeItem } from '../../lib/wardrobeStorage';
import { CANONICAL_CATEGORIES, CATEGORY_SUBCATEGORY_MAP, OCCASIONS } from '../../constants/catalog';
import { CanonicalCategory, CanonicalSubcategory, Occasion } from '../../types/catalog';
import { WardrobeItem } from '../../types/wardrobe';
import { getMaterialConfig } from '../../lib/materialOptions';

const FIT_OPTIONS = ['Slim', 'Regular', 'Oversize', 'Relaxed', 'Structured'];
const PATTERN_OPTIONS = ['Düz', 'Çizgili', 'Ekose', 'Desenli'];

function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.primary : '#F3EFE9',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 10,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function EditWardrobeItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId?: string }>();

  const [loaded, setLoaded] = useState(false);
  const [item, setItem] = useState<WardrobeItem | null>(null);

  const [category, setCategory] = useState<CanonicalCategory | ''>('');
  const [subcategory, setSubcategory] = useState<CanonicalSubcategory | ''>('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [pattern, setPattern] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);

  useEffect(() => {
    (async () => {
      const items = await getWardrobeItems();
      const current = items.find((it) => it.id === itemId) || null;
      setItem(current);

      if (current) {
        setCategory(current.category);
        setSubcategory(current.subcategory);
        setName(current.name || '');
        setColor(current.color || '');
        setFabric(current.fabric || '');
        setFit(current.fit || '');
        setPattern(current.pattern || '');
        setSelectedOccasions(current.occasions || []);
      }

      setLoaded(true);
    })();
  }, [itemId]);

  const availableSubcategories = useMemo(
    () => (category ? CATEGORY_SUBCATEGORY_MAP[category] : []),
    [category]
  );
  const materialConfig = useMemo(() => getMaterialConfig(category), [category]);

  useEffect(() => {
    if (fabric && !materialConfig.options.includes(fabric)) {
      setFabric('');
    }
  }, [category, fabric, materialConfig.options]);

  const isReady = !!item && !!category && !!subcategory && !!name.trim() && selectedOccasions.length > 0;

  const toggleOccasion = (occasion: Occasion) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((value) => value !== occasion)
        : [...prev, occasion]
    );
  };

  const handleSave = async () => {
    if (!item || !isReady || !category || !subcategory) return;

    await updateWardrobeItem(item.id, {
      category,
      subcategory,
      name: name.trim(),
      color: color.trim(),
      fabric: fabric.trim(),
      fit: fit.trim(),
      pattern: pattern.trim(),
      occasions: selectedOccasions,
    } as any);

    router.replace('/wardrobe');
  };

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Ürün yükleniyor...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
          Düzenlenecek ürün bulunamadı.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
          Ürünü Düzenle
        </Text>

        <Text style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary, marginBottom: 24 }}>
          Kumaş veya malzeme, fit ve desen bilgilerini güncellersen kombin önerileri daha iyi olur.
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Kategori
        </Text>

        {CANONICAL_CATEGORIES.map((entry) => (
          <OptionCard
            key={entry}
            label={entry}
            active={category === entry}
            onPress={() => {
              setCategory(entry);
              setSubcategory('');
            }}
          />
        ))}

        {!!category && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 6, marginBottom: 12 }}>
              Alt kategori
            </Text>

            {availableSubcategories.map((entry) => (
              <OptionCard
                key={entry}
                label={entry}
                active={subcategory === entry}
                onPress={() => setSubcategory(entry)}
              />
            ))}
          </>
        )}

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 10, marginBottom: 12 }}>
          Kullanım modları
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {OCCASIONS.map((entry) => (
            <ChoiceChip
              key={entry}
              label={entry}
              active={selectedOccasions.includes(entry)}
              onPress={() => toggleOccasion(entry)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          {materialConfig.label}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {materialConfig.options.map((entry) => (
            <ChoiceChip
              key={entry}
              label={entry}
              active={fabric === entry}
              onPress={() => setFabric(entry)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Fit
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {FIT_OPTIONS.map((entry) => (
            <ChoiceChip
              key={entry}
              label={entry}
              active={fit === entry}
              onPress={() => setFit(entry)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Desen
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {PATTERN_OPTIONS.map((entry) => (
            <ChoiceChip
              key={entry}
              label={entry}
              active={pattern === entry}
              onPress={() => setPattern(entry)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Ürün adı
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ürün adı"
          placeholderTextColor={colors.muted}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
            fontSize: 16,
            color: colors.text,
            marginBottom: 20,
          }}
        />

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Renk
        </Text>

        <TextInput
          value={color}
          onChangeText={setColor}
          placeholder="Renk"
          placeholderTextColor={colors.muted}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
            fontSize: 16,
            color: colors.text,
            marginBottom: 24,
          }}
        />

        <PrimaryButton title="Değişiklikleri Kaydet" disabled={!isReady} onPress={handleSave} />
      </ScrollView>
    </View>
  );
}
