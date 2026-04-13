import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../../theme/colors';
import { attachTryOnPreviewToSavedLook, getSavedLooks, SavedLook } from '../../lib/savedLooksStorage';
import { getPlan } from '../../lib/accessControl';
import { getUserSettings } from '../../lib/settingsStorage';
import { getOnboardingProfile } from '../../lib/storage';
import { AppPlan } from '../../types/access';
import { MannequinStyle, TryOnMode } from '../../types/tryon';
import TryOnCanvas from '../../components/TryOnCanvas';
import TryOnResultCard from '../../components/TryOnResultCard';
import ProcessingStatusCard from '../../components/ProcessingStatusCard';
import {
  aiTryOn,
  compositeTryOn,
  isBackendAvailable,
  resolveTryOnImage,
  simpleTryOn,
} from '../../lib/backendClient';
import TryOnBackendStatusCard from '../../components/TryOnBackendStatusCard';

function getPrimaryGarment(look: SavedLook) {
  return (
    look.pieces.dress ||
    look.pieces.suit ||
    look.pieces.outerwear ||
    look.pieces.jacket ||
    look.pieces.top ||
    look.pieces.bottom ||
    null
  );
}

function getDefaultMannequinStyle(gender?: string): MannequinStyle {
  if (gender === 'Kadın') return 'FEMALE';
  if (gender === 'Erkek') return 'MALE';
  return 'NEUTRAL';
}

export default function TryOnScreen() {
  const { lookId } = useLocalSearchParams<{ lookId?: string }>();

  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [selectedLookId, setSelectedLookId] = useState<string>('');
  const [plan, setPlan] = useState<AppPlan>('free');
  const [mode, setMode] = useState<TryOnMode>('MOCKUP');
  const [mannequinStyle, setMannequinStyle] = useState<MannequinStyle>('NEUTRAL');
  const [personUri, setPersonUri] = useState('');
  const [renderedUri, setRenderedUri] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [backendMessage, setBackendMessage] = useState('Bağlantı durumu kontrol ediliyor...');

  const load = useCallback(async () => {
    const [savedLooks, currentPlan, settings, profile, backendOk] = await Promise.all([
      getSavedLooks(),
      getPlan(),
      getUserSettings(),
      getOnboardingProfile(),
      isBackendAvailable(),
    ]);

    setLooks(savedLooks);
    setPlan(currentPlan);
    setMode(settings.tryOnPreference);
    setMannequinStyle(getDefaultMannequinStyle(profile?.gender));
    setBackendAvailable(backendOk);
    setBackendMessage(
      backendOk
        ? 'Render backend’i erişilebilir. Gerçek kompozit ve AI try-on denenebilir.'
        : 'Backend şu an erişilemiyor. Yerel anchor tabanlı mockup önizleme kullanılacak.'
    );

    if (lookId && savedLooks.some((item) => item.id === lookId)) {
      setSelectedLookId(lookId);
    } else if (!selectedLookId && savedLooks.length) {
      setSelectedLookId(savedLooks[0].id);
    } else if (selectedLookId && savedLooks.some((item) => item.id === selectedLookId)) {
      setSelectedLookId(selectedLookId);
    } else if (savedLooks.length) {
      setSelectedLookId(savedLooks[0].id);
    } else {
      setSelectedLookId('');
    }
  }, [lookId, selectedLookId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const selectedLook = useMemo(
    () => looks.find((item) => item.id === selectedLookId) || null,
    [looks, selectedLookId]
  );

  const selectedGarment = useMemo(
    () => (selectedLook ? getPrimaryGarment(selectedLook) : null),
    [selectedLook]
  );

  const effectiveRenderedUri = renderedUri || selectedLook?.tryOnPreviewUri || '';
  const avatarLocked = mode === 'AVATAR' && plan !== 'pro';

  const runMockupRender = async () => {
    if (!selectedLook) return;

    if (!backendAvailable) {
      Alert.alert(
        'Backend şu an kapalı',
        'Yerel anchor tabanlı mockup önizleme çalışmaya devam ediyor. Gerçek render için backend erişimi gerekli.'
      );
      return;
    }

    setBusy(true);
    setBusyMessage('Çok parçalı mockup render hazırlanıyor...');

    try {
      const result = await compositeTryOn(selectedLook, mannequinStyle);
      const uri = resolveTryOnImage(result);
      if (uri) {
        setRenderedUri(uri);
      } else {
        throw new Error('No composite render result');
      }
    } catch (error) {
      try {
        if (!selectedGarment) throw new Error('No primary garment');
        setBusyMessage('Kompozit render alınamadı, tek parça render deneniyor...');
        const result = await simpleTryOn(
          selectedGarment.processedImageUri || selectedGarment.imageUri,
          selectedGarment.subcategory || selectedGarment.category
        );
        const uri = resolveTryOnImage(result);
        setRenderedUri(uri);
      } catch (innerError) {
        Alert.alert(
          'Render alınamadı',
          'Backend yanıt verdi ama render tamamlanamadı. Yerel mockup görünümünü kullanmaya devam edebilirsin.'
        );
      }
    } finally {
      setBusy(false);
      setBusyMessage('');
    }
  };

  const pickPersonImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin gerekli', 'Avatar denemesi için galeri izni vermelisin.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPersonUri(result.assets[0].uri);
    }
  };

  const runAvatarRender = async () => {
    if (!selectedGarment || !personUri) return;

    if (!backendAvailable) {
      Alert.alert(
        'Backend şu an kapalı',
        'AI avatar try-on için backend erişimi gerekiyor.'
      );
      return;
    }

    setBusy(true);
    setBusyMessage('AI avatar render hazırlanıyor...');

    try {
      const result = await aiTryOn(
        personUri,
        selectedGarment.processedImageUri || selectedGarment.imageUri,
        selectedGarment.subcategory || selectedGarment.category
      );
      const uri = resolveTryOnImage(result);
      setRenderedUri(uri);
    } catch (error: any) {
      Alert.alert(
        'Avatar render alınamadı',
        'AI try-on başarısız oldu. Backend ve model bağlantısını kontrol et.'
      );
    } finally {
      setBusy(false);
      setBusyMessage('');
    }
  };

  const handleWritePreview = async () => {
    if (!selectedLook || !effectiveRenderedUri) return;
    await attachTryOnPreviewToSavedLook(selectedLook.id, effectiveRenderedUri);
    Alert.alert('Kaydedildi', 'Try-on önizlemesi görünümün içine yazıldı.');
    load();
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
          Avatar / Try-On
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 18,
          }}
        >
          Mockup tarafında anchor tabanlı yerleşim ve backend render, avatar tarafında ise selfie tabanlı try-on akışı hazır.
        </Text>

        <TryOnBackendStatusCard available={backendAvailable} message={backendMessage} />

        {looks.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 22,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.borderSoft,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 14 }}>
              Try-on çalıştırmak için önce kaydedilmiş bir görünüm olmalı.
            </Text>

            <Pressable
              onPress={() => router.push('/saved')}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                Kaydedilen Kombinleri Aç
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Görünüm seç
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
              {looks.map((look) => {
                const active = selectedLookId === look.id;
                return (
                  <Pressable
                    key={look.id}
                    onPress={() => {
                      setSelectedLookId(look.id);
                      setRenderedUri('');
                    }}
                    style={{
                      backgroundColor: active ? colors.primary : '#F3EFE9',
                      borderRadius: 18,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      marginRight: 10,
                      minWidth: 180,
                    }}
                  >
                    <Text
                      style={{
                        color: active ? '#fff' : colors.text,
                        fontSize: 14,
                        fontWeight: '700',
                        marginBottom: 4,
                      }}
                    >
                      {look.title}
                    </Text>

                    <Text
                      style={{
                        color: active ? '#F6F2EC' : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {look.occasion}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Mod
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {(['MOCKUP', 'AVATAR'] as TryOnMode[]).map((item) => {
                const active = mode === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setMode(item);
                      setRenderedUri('');
                    }}
                    style={{
                      backgroundColor: active ? colors.primary : '#F3EFE9',
                      borderRadius: 999,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Manken stili
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 18 }}>
              {(['FEMALE', 'MALE', 'NEUTRAL'] as MannequinStyle[]).map((item) => {
                const active = mannequinStyle === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setMannequinStyle(item)}
                    style={{
                      backgroundColor: active ? colors.primary : '#F3EFE9',
                      borderRadius: 999,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700' }}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!!busy && (
              <ProcessingStatusCard
                title="Try-On işleniyor"
                detail={busyMessage || 'Render hazırlanıyor...'}
              />
            )}

            {!!selectedLook && mode === 'MOCKUP' && (
              <>
                <TryOnCanvas look={selectedLook} mannequinStyle={mannequinStyle} />

                <Pressable
                  onPress={runMockupRender}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    Gerçek Kompozit Render Al
                  </Text>
                </Pressable>
              </>
            )}

            {!!selectedLook && mode === 'AVATAR' && avatarLocked && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 22,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: colors.borderSoft,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Avatar modu Pro’da açılır
                </Text>

                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 22,
                    color: colors.textSecondary,
                    marginBottom: 14,
                  }}
                >
                  Free planda mockup render açık. Selfie tabanlı gerçek avatar try-on akışı Pro tarafında aktif.
                </Text>

                <Pressable
                  onPress={() => router.push('/paywall')}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    Pro’yu Gör
                  </Text>
                </Pressable>
              </View>
            )}

            {!!selectedLook && mode === 'AVATAR' && !avatarLocked && (
              <>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 22,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: 8,
                    }}
                  >
                    Selfie seç
                  </Text>

                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      color: colors.textSecondary,
                      marginBottom: 14,
                    }}
                  >
                    AI try-on için bir kişi fotoğrafı seç. Arka planı sade olursa sonuç daha iyi olur.
                  </Text>

                  <Pressable
                    onPress={pickPersonImage}
                    style={{
                      backgroundColor: '#F3EFE9',
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>
                      Selfie / Tam Boy Fotoğraf Seç
                    </Text>
                  </Pressable>

                  {!!personUri && (
                    <View
                      style={{
                        backgroundColor: '#F6F2EC',
                        borderRadius: 18,
                        overflow: 'hidden',
                        marginBottom: 12,
                      }}
                    >
                      <Image
                        source={{ uri: personUri }}
                        style={{ width: '100%', height: 260 }}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <Pressable
                    onPress={runAvatarRender}
                    disabled={!personUri}
                    style={{
                      backgroundColor: personUri ? colors.primary : colors.disabled,
                      paddingVertical: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      AI Avatar Render Al
                    </Text>
                  </Pressable>
                </View>
              </>
            )}

            {!!effectiveRenderedUri && (
              <>
                <TryOnResultCard
                  title={mode === 'AVATAR' ? 'AI Avatar Render' : 'Gerçek Kompozit Render'}
                  uri={effectiveRenderedUri}
                  description={
                    mode === 'AVATAR'
                      ? 'Selfie ve seçili görünümden türetilen try-on sonucu.'
                      : 'Çok parçalı görünüm için backend üzerinden alınan render sonucu.'
                  }
                />

                <Pressable
                  onPress={handleWritePreview}
                  style={{
                    backgroundColor: colors.surface,
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.borderSoft,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    Sonucu Görünüme Kaydet
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => selectedLook && router.push(`/share/look?lookId=${selectedLook.id}`)}
                  style={{
                    backgroundColor: '#F3EFE9',
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    Paylaşım Kartını Aç
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
