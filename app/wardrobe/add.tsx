import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import colors from '../../theme/colors';
import OptionCard from '../../components/OptionCard';
import PrimaryButton from '../../components/PrimaryButton';
import ProcessingStatusCard from '../../components/ProcessingStatusCard';
import ProductImageFrame from '../../components/ProductImageFrame';
import ShellScreenHeader from '../../components/ShellScreenHeader';
import { addWardrobeItem } from '../../lib/wardrobeStorage';
import {
  CANONICAL_CATEGORIES,
  CATEGORY_SUBCATEGORY_MAP,
  OCCASIONS,
  SUBCATEGORY_TO_CATEGORY,
} from '../../constants/catalog';
import { inferOccasions } from '../../lib/canonicalWardrobe';
import { CanonicalCategory, CanonicalSubcategory, Occasion } from '../../types/catalog';
import {
  isApprovedProductIsolation,
  processWardrobeImage,
} from '../../lib/backgroundProcessing';
import { getMaterialConfig } from '../../lib/materialOptions';

const PHOTO_ERROR_MESSAGE =
  'Bu fotoğrafı okumakta zorlandık. Daha sade arka planlı başka bir fotoğraf deneyin.';

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
        borderRadius: 8,
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

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: 20,
        marginBottom: 18,
      }}
    >
      {children}
    </View>
  );
}

function SecondaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
        {title}
      </Text>
    </Pressable>
  );
}

function mapDetectedCategory(value?: string): CanonicalCategory | '' {
  const v = (value || '').trim().toLocaleLowerCase('tr-TR');

  if (['üst', 'top', 'shirt', 'blouse', 'tee'].includes(v)) return 'Üst';
  if (['alt', 'bottom', 'pants', 'skirt', 'shorts'].includes(v)) return 'Alt';
  if (['elbise', 'dress'].includes(v)) return 'Elbise';
  if (['takım', 'suit', 'set'].includes(v)) return 'Takım';
  if (['ceket', 'jacket', 'blazer'].includes(v)) return 'Ceket';
  if (['dış giyim', 'outerwear', 'coat', 'trench'].includes(v)) return 'Dış Giyim';
  if (['ayakkabı', 'shoe', 'sneaker', 'heel', 'boot'].includes(v)) return 'Ayakkabı';
  if (['çanta', 'bag'].includes(v)) return 'Çanta';
  if (['aksesuar', 'accessory', 'jewelry'].includes(v)) return 'Aksesuar';

  return '';
}

function mapDetectedSubcategory(value?: string, category?: CanonicalCategory | ''): CanonicalSubcategory | '' {
  if (!value || !category) return '';

  const options = CATEGORY_SUBCATEGORY_MAP[category];
  const raw = value.trim().toLocaleLowerCase('tr-TR');

  const direct = options.find((item) => item.toLocaleLowerCase('tr-TR') === raw);
  if (direct) return direct;

  const partial = options.find((item) => {
    const normalized = item.toLocaleLowerCase('tr-TR');
    return raw.includes(normalized) || normalized.includes(raw);
  });

  if (partial) return partial;

  return '';
}

export default function AddWardrobeItemScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    subcategory?: string;
    occasion?: string;
  }>();

  const [originalImageUri, setOriginalImageUri] = useState('');
  const [processedImageUri, setProcessedImageUri] = useState('');
  const [category, setCategory] = useState<CanonicalCategory | ''>('');
  const [subcategory, setSubcategory] = useState<CanonicalSubcategory | ''>('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [pattern, setPattern] = useState('');
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>([]);
  const [processing, setProcessing] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [readyToEdit, setReadyToEdit] = useState(false);

  useEffect(() => {
    const paramSubcategory = params.subcategory as CanonicalSubcategory | undefined;
    const inferredCategory =
      (params.category as CanonicalCategory | undefined) ||
      (paramSubcategory ? SUBCATEGORY_TO_CATEGORY[paramSubcategory] : undefined);

    if (inferredCategory) setCategory(inferredCategory);
    if (paramSubcategory) setSubcategory(paramSubcategory);

    if (params.occasion) {
      const occasion = params.occasion as Occasion;
      if (OCCASIONS.includes(occasion)) {
        setSelectedOccasions((prev) => (prev.length ? prev : [occasion]));
      }
    }

    if (paramSubcategory && !name.trim()) {
      setName(paramSubcategory);
    }
  }, [params.category, params.subcategory, params.occasion, name]);

  const availableSubcategories = useMemo(
    () => (category ? CATEGORY_SUBCATEGORY_MAP[category] : []),
    [category]
  );

  const materialConfig = useMemo(() => getMaterialConfig(category), [category]);

  useEffect(() => {
    if (fabric && !materialConfig.options.includes(fabric)) {
      setFabric('');
    }
  }, [fabric, materialConfig.options]);

  const baseReady = useMemo(() => {
    return !!processedImageUri && !!category && !!subcategory && !!name.trim() && selectedOccasions.length > 0;
  }, [processedImageUri, category, subcategory, name, selectedOccasions]);

  const canSave = baseReady && readyToEdit;

  const runProcessing = async (sourceUri: string) => {
    setProcessing(true);
    setPhotoError('');
    setReadyToEdit(false);
    setOriginalImageUri(sourceUri);
    setProcessedImageUri('');

    try {
      const response = await processWardrobeImage(sourceUri);
      const cleaned = isApprovedProductIsolation(response);

      if (!cleaned) {
        setPhotoError(PHOTO_ERROR_MESSAGE);
        return;
      }

      const detectedCategory = mapDetectedCategory(response.category);
      const detectedSubcategory = mapDetectedSubcategory(response.subcategory, detectedCategory);
      const inferredOccasions =
        detectedCategory && detectedSubcategory
          ? inferOccasions(detectedCategory, detectedSubcategory)
          : [];

      setProcessedImageUri(response.processedImageUri);
      setReadyToEdit(true);

      if (!category && detectedCategory) setCategory(detectedCategory);
      if (!subcategory && detectedSubcategory) setSubcategory(detectedSubcategory);
      if (!color && response.color) setColor(response.color || '');
      if (!name.trim()) {
        const smartName = `${response.color || ''} ${detectedSubcategory || detectedCategory || ''}`.trim();
        setName(smartName || 'Yeni Parça');
      }
      if (!selectedOccasions.length && inferredOccasions.length) setSelectedOccasions(inferredOccasions);
    } catch {
      setPhotoError(PHOTO_ERROR_MESSAGE);
    } finally {
      setProcessing(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Fotoğraf seçebilmek için galeri izni vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    void runProcessing(result.assets[0].uri);
  };

  const handleCategory = (value: CanonicalCategory) => {
    setCategory(value);
    setSubcategory('');
  };

  const toggleOccasion = (occasion: Occasion) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((item) => item !== occasion)
        : [...prev, occasion]
    );
  };

  const handleSave = async () => {
    if (!canSave || !category || !subcategory) return;

    await addWardrobeItem({
      id: Date.now().toString(),
      imageUri: originalImageUri,
      processedImageUri,
      name: name.trim(),
      category,
      subcategory,
      color: color.trim(),
      fabric: fabric.trim(),
      fit: fit.trim(),
      pattern: pattern.trim(),
      occasions: selectedOccasions,
      status: 'Temiz',
      isFavorite: false,
      wearCount: 0,
      lastWornAt: null,
      createdAt: new Date().toISOString(),
      source: 'canonical',
    } as any);

    router.replace('/wardrobe');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 80, paddingBottom: 32 }}>
        <ShellScreenHeader
          eyebrow="WARDROBE"
          title={readyToEdit ? 'Ürünü Düzenle' : 'Ürün Ekle'}
          description={
            readyToEdit
              ? 'Kombinlerde doğru çalışması için birkaç kısa detayı tamamla.'
              : 'Fotoğrafını seç, Combinia ürünü gardırobuna hazırlasın.'
          }
        />

        {!readyToEdit && !processing && !photoError && (
          <Panel>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              Fotoğraf seç
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary, marginBottom: 18 }}>
              Net ışıkta çekilmiş, ürünün rahat göründüğü bir fotoğraf yeterli.
            </Text>
            <PrimaryButton title="Fotoğraf Seç" onPress={pickImage} />
          </Panel>
        )}

        {processing && (
          <ProcessingStatusCard
            title="Fotoğraf hazırlanıyor"
            detail="Ürünü gardırobuna eklemeye hazırlıyoruz."
          />
        )}

        {!!photoError && !processing && (
          <Panel>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
              Fotoğraf okunamadı
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary, marginBottom: 18 }}>
              {PHOTO_ERROR_MESSAGE}
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <SecondaryButton title="Başka Fotoğraf Seç" onPress={pickImage} />
              </View>
              <Pressable
                onPress={() => originalImageUri && runProcessing(originalImageUri)}
                disabled={!originalImageUri}
                style={{
                  flex: 1,
                  backgroundColor: originalImageUri ? colors.primary : colors.disabled,
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                  Tekrar Dene
                </Text>
              </Pressable>
            </View>
          </Panel>
        )}

        {readyToEdit && (
          <>
            <Panel>
              <ProductImageFrame
                uri={processedImageUri}
                category={category || undefined}
                variant="hero"
              />
            </Panel>

            <Panel>
              <FieldGroup title="Kategori">
                {CANONICAL_CATEGORIES.map((item) => (
                  <OptionCard
                    key={item}
                    label={item}
                    active={category === item}
                    onPress={() => handleCategory(item)}
                  />
                ))}
              </FieldGroup>

              {!!category && (
                <FieldGroup title="Alt kategori">
                  {availableSubcategories.map((item) => (
                    <OptionCard
                      key={item}
                      label={item}
                      active={subcategory === item}
                      onPress={() => setSubcategory(item)}
                    />
                  ))}
                </FieldGroup>
              )}

              <FieldGroup title="Kullanım modları">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {OCCASIONS.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item}
                      active={selectedOccasions.includes(item)}
                      onPress={() => toggleOccasion(item)}
                    />
                  ))}
                </View>
              </FieldGroup>
            </Panel>

            <Panel>
              <FieldGroup title={materialConfig.label}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {materialConfig.options.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item}
                      active={fabric === item}
                      onPress={() => setFabric(item)}
                    />
                  ))}
                </View>
              </FieldGroup>

              <FieldGroup title="Fit">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['Slim', 'Regular', 'Oversize', 'Relaxed', 'Structured'].map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item}
                      active={fit === item}
                      onPress={() => setFit(item)}
                    />
                  ))}
                </View>
              </FieldGroup>

              <FieldGroup title="Desen">
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['Düz', 'Çizgili', 'Ekose', 'Desenli'].map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item}
                      active={pattern === item}
                      onPress={() => setPattern(item)}
                    />
                  ))}
                </View>
              </FieldGroup>

              <FieldGroup title="Ürün adı">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Örn: Beyaz oversize gömlek"
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: '#F7F2EB',
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
              </FieldGroup>

              <FieldGroup title="Renk">
                <TextInput
                  value={color}
                  onChangeText={setColor}
                  placeholder="Örn: Beyaz"
                  placeholderTextColor={colors.muted}
                  style={{
                    backgroundColor: '#F7F2EB',
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
              </FieldGroup>

              <PrimaryButton title="Gardıroba Ekle" disabled={!canSave} onPress={handleSave} />
            </Panel>
          </>
        )}
      </ScrollView>
    </View>
  );
}
