import * as ImageManipulator from 'expo-image-manipulator';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  Text,
  View,
} from 'react-native';
import colors from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FRAME_WIDTH = SCREEN_WIDTH - 48;
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * 1.2);

export default function WardrobeIsolateScreen() {
  const params = useLocalSearchParams<{
    imageUri?: string;
    category?: string;
    subcategory?: string;
    occasion?: string;
  }>();

  const imageUri = params.imageUri || '';
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!imageUri) return;

    Image.getSize(
      imageUri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize({ width: 0, height: 0 })
    );
  }, [imageUri]);

  const baseScale = useMemo(() => {
    if (!imageSize.width || !imageSize.height) return 1;
    return Math.max(FRAME_WIDTH / imageSize.width, FRAME_HEIGHT / imageSize.height);
  }, [imageSize]);

  const currentScale = baseScale * zoom;
  const displayWidth = imageSize.width * currentScale;
  const displayHeight = imageSize.height * currentScale;

  const clampOffset = (x: number, y: number, nextZoom = zoom) => {
    const nextScale = baseScale * nextZoom;
    const nextWidth = imageSize.width * nextScale;
    const nextHeight = imageSize.height * nextScale;

    const maxX = Math.max(0, (nextWidth - FRAME_WIDTH) / 2);
    const maxY = Math.max(0, (nextHeight - FRAME_HEIGHT) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startOffset.current = offset;
        },
        onPanResponderMove: (_, gestureState) => {
          const next = clampOffset(
            startOffset.current.x + gestureState.dx,
            startOffset.current.y + gestureState.dy
          );
          setOffset(next);
        },
      }),
    [offset, zoom, baseScale, imageSize]
  );

  const handleZoom = (delta: number) => {
    const nextZoom = Math.max(1, Math.min(3, zoom + delta));
    const nextOffset = clampOffset(offset.x, offset.y, nextZoom);
    setZoom(nextZoom);
    setOffset(nextOffset);
  };

  const handleDone = async () => {
    if (!imageUri || !imageSize.width || !imageSize.height) return;

    const topLeftX = (FRAME_WIDTH - displayWidth) / 2 + offset.x;
    const topLeftY = (FRAME_HEIGHT - displayHeight) / 2 + offset.y;

    const originX = Math.max(0, (0 - topLeftX) / currentScale);
    const originY = Math.max(0, (0 - topLeftY) / currentScale);
    const width = Math.min(imageSize.width - originX, FRAME_WIDTH / currentScale);
    const height = Math.min(imageSize.height - originY, FRAME_HEIGHT / currentScale);

    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: Math.round(originX),
            originY: Math.round(originY),
            width: Math.round(width),
            height: Math.round(height),
          },
        },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
      }
    );

    router.replace({
      pathname: '/wardrobe/add',
      params: {
        originalUri: imageUri,
        isolatedUri: result.uri,
        imageToken: Date.now().toString(),
        category: params.category || '',
        subcategory: params.subcategory || '',
        occasion: params.occasion || '',
      },
    });
  };

  if (!imageUri) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: colors.textSecondary }}>Fotoğraf bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 80, paddingHorizontal: 24 }}>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 10,
        }}
      >
        Güvenli Alan
      </Text>

      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          marginBottom: 18,
        }}
      >
        Yalnızca ürünü kadraj içine al. Kapı, sandalye veya çevre alan mümkün olduğunca dışarıda kalsın.
      </Text>

      <View
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: '#F6F2EC',
          alignSelf: 'center',
          marginBottom: 16,
        }}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            position: 'absolute',
            width: displayWidth,
            height: displayHeight,
            left: (FRAME_WIDTH - displayWidth) / 2 + offset.x,
            top: (FRAME_HEIGHT - displayHeight) / 2 + offset.y,
          }}
          resizeMode="stretch"
        />

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 2,
            borderColor: '#000',
            borderRadius: 24,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Pressable
          onPress={() => handleZoom(-0.15)}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Uzaklaştır</Text>
        </Pressable>

        <Pressable
          onPress={() => handleZoom(0.15)}
          style={{
            flex: 1,
            backgroundColor: '#F3EFE9',
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '700' }}>Yakınlaştır</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleDone}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 16,
          borderRadius: 18,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
          Bu Alanı Kullan
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={{
          backgroundColor: '#F3EFE9',
          paddingVertical: 16,
          borderRadius: 18,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
          Geri Dön
        </Text>
      </Pressable>
    </View>
  );
}
