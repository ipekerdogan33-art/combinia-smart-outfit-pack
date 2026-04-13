import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
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
import TransparentPngPreviewCard from '../../components/TransparentPngPreviewCard';
import CleanupRequirementCard from '../../components/CleanupRequirementCard';
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
  processWardrobeImage,
  hasRealProcessedOutput,
} from '../../lib/backgroundProcessing';
import { getMaterialConfig } from '../../lib/materialOptions';

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

  const partial = options.find((item) => raw.includes(item.toLocaleLowerCase('tr-TR')) || item.toLocaleLowerCase('tr-TR').includes(raw));
  if (partial) return partial;

  return '';
}

export default function AddWardrobeItemScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    subcategory?: string;
    occasion?: string;
    originalUri?: string;
    isolatedUri?: string;
    imageToken?: string;
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
  const [processingMessage, setProcessingMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [cleanupReady, setCleanupReady] = useState(false);
  const [lastImageToken, setLastImageToken] = useState('');

  useEffect(() => {
    const paramSubcategory = params.subcategory as CanonicalSubcategory | undefined;
    const inferredCategory =
      (params.category as CanonicalCategory | undefined) ||
      (paramSubcategory ? SUBCATEGORY_TO_CATEGORY[paramSubcategory] : undefined);

    if (inferredCategory) {
      setCategory(inferredCategory);
    }

    if (paramSubcategory) {
      setSubcategory(paramSubcategory);
    }

    if (params.occasion) {
      const occasion = params.occasion as Occasion;
      if (OCCASIONS.includes(occasion)) {
        setSelectedOccasions((prev) => (prev.length ? prev : [occasion]));
      }
    }

    if (paramSubcategory && !name.trim()) {
      setName(paramSubcategory);
    }
  }, [params.category, params.subcategory, params.occasion]);

  useEffect(() => {
    if (!params.imageToken || params.imageToken === lastImageToken) return;
    if (!params.originalUri || !params.isolatedUri) return;

    setLastImageToken(params.imageToken);
    setOriginalImageUri(params.originalUri);
    setProcessedImageUri('');
    setCleanupReady(false);

    void runProcessing(params.isolatedUri, params.originalUri);
  }, [params.imageToken, params.originalUri, params.isolatedUri, lastImageToken]);

  const availableSubcategories = useMemo(
    () => (category ? CATEGORY_SUBCATEGORY_MAP[category] : []),
    [category]
  );

  const materialConfig = useMemo(() => getMaterialConfig(category), [category]);

  useEffect(() => {
    if (fabric && !materialConfig.options.includes(fabric)) {
      setFabric('');
    }
  }, [category]);

  const baseReady = useMemo(() => {
    return !!originalImageUri && !!category && !!subcategory && !!name.trim() && selectedOccasions.length > 0;
  }, [originalImageUri, category, subcategory, name, selectedOccasions]);

  const canSave = baseReady && cleanupReady;

  const runProcessing = async (sourceUri: string, displayOriginalUri?: string) => {
    setProcessing(true);
    setProcessingMessage('Güvenli alan içindeki ürün işleniyor ve arka plan kaldırılıyor...');
    setStatusMessage('');
    setCleanupReady(false);

    try {
      const response = await processWardrobeImage(sourceUri);

      const detectedCategory = mapDetectedCategory(response.category);
      const detectedSubcategory = mapDetectedSubcategory(response.subcategory, detectedCategory);
      const inferredOccasions =
        detectedCategory && detectedSubcategory
          ? inferOccasions(detectedCategory, detectedSubcategory)
          : [];

      const cleaned = hasRealProcessedOutput(response);

      setOriginalImageUri(displayOriginalUri || sourceUri);
      setProcessedImageUri(response.processedImageUri || sourceUri);
      setCleanupReady(cleaned);

      if (!category && detectedCategory) setCategory(detectedCategory);
      if (!subcategory && detectedSubcategory) setSubcategory(detectedSubcategory);
      if (!color && response.color) setColor(response.color || '');
      if (!name.trim()) {
        const smartName = `${response.color || ''} ${detectedSubcategory || detectedCategory || ''}`.trim();
        setName(smartName || 'Yeni Parça');
      }
      if (!selectedOccasions.length && inferredOccasions.length) setSelectedOccasions(inferredOccasions);

      if (cleaned) {
        setStatusMessage('Sadece ürün kaldıysa bu temiz PNG kaydedilecek.');
      } else {
        setStatusMessage('Kapı, sandalye veya duvar hâlâ görünüyorsa sonuç kabul edilmiyor.');
      }
    } catch {
      setProcessedImageUri(displayOriginalUri || sourceUri);
      setCleanupReady(false);
      setStatusMessage('Arka plan kaldırılamadı. Güvenli alanı yeniden belirlemeyi dene.');
    } finally {
      setProcessing(false);
      setProcessingMessage('');
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
      allowsEditing: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    router.push({
      pathname: '/wardrobe/isolate',
      params: {
        imageUri: asset.uri,
        category: category || '',
        subcategory: subcategory || '',
        occasion: params.occasion || '',
      },
    });
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
      processedImageUri: processedImageUri,
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
        <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 10 }}>
          Ürün Ekle
        </Text>

        <Text style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary, marginBottom: 24 }}>
          Kullanıcı fotoğrafı yüklediğinde önce ürün alanını seçiyoruz, sonra yalnızca bu alanı işleyip arka planı kaldırıyoruz.
        </Text>

        {!!processing && (
          <ProcessingStatusCard
            title="Görsel işleniyor"
            detail={processingMessage || 'Arka plan kaldırılıyor...'}
          />
        )}

        <Pressable
          onPress={pickImage}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.borderSoft,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 240,
            marginBottom: 20,
          }}
        >
          {originalImageUri ? (
            <Image
              source={{ uri: processedImageUri || originalImageUri }}
              style={{ width: '100%', height: 240, borderRadius: 20 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '700' }}>
              Fotoğraf Seç
            </Text>
          )}
        </Pressable>

        {!!originalImageUri && (
          <TransparentPngPreviewCard
            originalUri={originalImageUri}
            processedUri={processedImageUri || originalImageUri}
            cleaned={cleanupReady}
          />
        )}

        <CleanupRequirementCard
          visible={!!originalImageUri && !cleanupReady && !processing}
          message={statusMessage || 'Sadece ürün kalmadığı için kayıt kapalı.'}
          onRetry={() => params.isolatedUri && runProcessing(params.isolatedUri, originalImageUri)}
          onPickNew={pickImage}
          onOpenSafeArea={() => {
            if (!originalImageUri) return;
            router.push({
              pathname: '/wardrobe/isolate',
              params: {
                imageUri: originalImageUri,
                category: category || '',
                subcategory: subcategory || '',
                occasion: params.occasion || '',
              },
            });
          }}
        />

        {!!statusMessage && !processing && cleanupReady && (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: '#1D7A35',
              marginBottom: 16,
            }}
          >
            {statusMessage}
          </Text>
        )}

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Kategori
        </Text>

        {CANONICAL_CATEGORIES.map((item) => (
          <OptionCard
            key={item}
            label={item}
            active={category === item}
            onPress={() => handleCategory(item)}
          />
        ))}

        {!!category && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 6, marginBottom: 12 }}>
              Alt kategori
            </Text>

            {availableSubcategories.map((item) => (
              <OptionCard
                key={item}
                label={item}
                active={subcategory === item}
                onPress={() => setSubcategory(item)}
              />
            ))}
          </>
        )}

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 10, marginBottom: 12 }}>
          Kullanım modları
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {OCCASIONS.map((item) => {
            const active = selectedOccasions.includes(item);
            return (
              <ChoiceChip
                key={item}
                label={item}
                active={active}
                onPress={() => toggleOccasion(item)}
              />
            );
          })}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          {materialConfig.label}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {materialConfig.options.map((item) => (
            <ChoiceChip
              key={item}
              label={item}
              active={fabric === item}
              onPress={() => setFabric(item)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Fit
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {['Slim', 'Regular', 'Oversize', 'Relaxed', 'Structured'].map((item) => (
            <ChoiceChip
              key={item}
              label={item}
              active={fit === item}
              onPress={() => setFit(item)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Desen
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {['Düz', 'Çizgili', 'Ekose', 'Desenli'].map((item) => (
            <ChoiceChip
              key={item}
              label={item}
              active={pattern === item}
              onPress={() => setPattern(item)}
            />
          ))}
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Ürün adı
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Örn: Beyaz oversize gömlek"
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
          placeholder="Örn: Beyaz"
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

        <PrimaryButton title="Temiz PNG ile Kaydet" disabled={!canSave} onPress={handleSave} />
      </ScrollView>
    </View>
  );
}
