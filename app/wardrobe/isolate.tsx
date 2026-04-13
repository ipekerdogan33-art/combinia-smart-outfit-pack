import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import colors from '../../theme/colors';
import { ProductSelectionPoint } from '../../lib/backgroundProcessing';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FRAME_WIDTH = SCREEN_WIDTH - 48;
const FRAME_HEIGHT = Math.round(FRAME_WIDTH * 1.25);
const MIN_SELECTION_POINTS = 4;
const MAX_SELECTION_POINTS = 16;

type DisplayPoint = ProductSelectionPoint & {
  displayX: number;
  displayY: number;
};

export default function WardrobeIsolateScreen() {
  const params = useLocalSearchParams<{
    imageUri?: string;
    category?: string;
    subcategory?: string;
    occasion?: string;
  }>();

  const imageUri = params.imageUri || '';
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState<ProductSelectionPoint[]>([]);

  useEffect(() => {
    if (!imageUri) return;

    Image.getSize(
      imageUri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize({ width: 0, height: 0 })
    );
  }, [imageUri]);

  const imageFrame = useMemo(() => {
    if (!imageSize.width || !imageSize.height) {
      return {
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        left: 0,
        top: 0,
      };
    }

    const scale = Math.min(FRAME_WIDTH / imageSize.width, FRAME_HEIGHT / imageSize.height);
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;

    return {
      width,
      height,
      left: (FRAME_WIDTH - width) / 2,
      top: (FRAME_HEIGHT - height) / 2,
    };
  }, [imageSize]);

  const displayPoints = useMemo<DisplayPoint[]>(
    () =>
      points.map((point) => ({
        ...point,
        displayX: imageFrame.left + point.x * imageFrame.width,
        displayY: imageFrame.top + point.y * imageFrame.height,
      })),
    [imageFrame, points]
  );

  const addPoint = (event: GestureResponderEvent) => {
    if (points.length >= MAX_SELECTION_POINTS) return;

    const { locationX, locationY } = event.nativeEvent;
    const xInImage = locationX - imageFrame.left;
    const yInImage = locationY - imageFrame.top;

    if (
      xInImage < 0 ||
      yInImage < 0 ||
      xInImage > imageFrame.width ||
      yInImage > imageFrame.height
    ) {
      return;
    }

    setPoints((current) => [
      ...current,
      {
        x: Number((xInImage / imageFrame.width).toFixed(4)),
        y: Number((yInImage / imageFrame.height).toFixed(4)),
      },
    ]);
  };

  const undoPoint = () => {
    setPoints((current) => current.slice(0, -1));
  };

  const clearPoints = () => {
    setPoints([]);
  };

  const handleDone = () => {
    if (!imageUri || points.length < MIN_SELECTION_POINTS) return;

    router.replace({
      pathname: '/wardrobe/add',
      params: {
        originalUri: imageUri,
        selectionPoints: JSON.stringify(points),
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

  const isReady = points.length >= MIN_SELECTION_POINTS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: 80, paddingHorizontal: 24, paddingBottom: 32 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 10,
          }}
        >
          Ürünü Ayır
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            color: colors.textSecondary,
            marginBottom: 18,
          }}
        >
          Yalnızca ürünün dış hattına dokun. Kapı, sandalye, duvar, askı ve zemin seçim dışında kalmalı.
        </Text>

        <Pressable
          onPress={addPoint}
          style={{
            width: FRAME_WIDTH,
            height: FRAME_HEIGHT,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#F6F2EC',
            alignSelf: 'center',
            marginBottom: 16,
          }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{
              position: 'absolute',
              width: imageFrame.width,
              height: imageFrame.height,
              left: imageFrame.left,
              top: imageFrame.top,
            }}
            resizeMode="contain"
          />

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: imageFrame.left,
              top: imageFrame.top,
              width: imageFrame.width,
              height: imageFrame.height,
              borderWidth: points.length ? 1 : 0,
              borderColor: 'rgba(17, 17, 17, 0.16)',
            }}
          />

          {displayPoints.map((point, index) => (
            <View
              key={`${point.x}-${point.y}-${index}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: point.displayX - 13,
                top: point.displayY - 13,
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: colors.primary,
                borderWidth: 2,
                borderColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                {index + 1}
              </Text>
            </View>
          ))}
        </Pressable>

        <Text style={{ color: colors.textSecondary, lineHeight: 20, marginBottom: 16 }}>
          {isReady
            ? 'Seçim hazır. Şimdi sistem yalnızca ürün kalıp kalmadığını doğrulayacak.'
            : `En az ${MIN_SELECTION_POINTS} nokta seç. Seçilen nokta: ${points.length}`}
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Pressable
            onPress={undoPoint}
            disabled={!points.length}
            style={{
              flex: 1,
              backgroundColor: points.length ? '#F3EFE9' : colors.disabled,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Son Noktayı Sil</Text>
          </Pressable>

          <Pressable
            onPress={clearPoints}
            disabled={!points.length}
            style={{
              flex: 1,
              backgroundColor: points.length ? '#F3EFE9' : colors.disabled,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Seçimi Temizle</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleDone}
          disabled={!isReady}
          style={{
            backgroundColor: isReady ? colors.primary : colors.disabled,
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            Ürünü Ayrıştır
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
      </ScrollView>
    </View>
  );
}
