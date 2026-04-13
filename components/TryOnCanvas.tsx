import { Image, Text, View } from 'react-native';
import colors from '../theme/colors';
import { SavedLook } from '../lib/savedLooksStorage';
import { getLookPieceByZone, getTryOnZonesForLook } from '../lib/tryonLayout';
import { MannequinStyle } from '../types/tryon';

function getBodyTone(style: MannequinStyle) {
  if (style === 'FEMALE') return '#E7DED4';
  if (style === 'MALE') return '#E2D8CC';
  return '#ECE3D9';
}

export default function TryOnCanvas({
  look,
  mannequinStyle = 'NEUTRAL',
}: {
  look: SavedLook;
  mannequinStyle?: MannequinStyle;
}) {
  const zones = getTryOnZonesForLook(look, mannequinStyle);
  const bodyTone = getBodyTone(mannequinStyle);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: colors.borderSoft,
        padding: 16,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 12,
        }}
      >
        Anchor Tabanlı Mockup
      </Text>

      <View
        style={{
          height: 720,
          backgroundColor: '#F6F2EC',
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: '20%',
            width: '60%',
            height: 20,
            borderRadius: 999,
            backgroundColor: '#E8DED4',
          }}
        />

        <View
          style={{
            position: 'absolute',
            top: '6%',
            left: '39%',
            width: '22%',
            height: '10%',
            borderRadius: 999,
            backgroundColor: bodyTone,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '15%',
            left: '35%',
            width: '30%',
            height: '50%',
            borderRadius: 999,
            backgroundColor: bodyTone,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '24%',
            left: '20%',
            width: '16%',
            height: '28%',
            borderRadius: 999,
            backgroundColor: bodyTone,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '24%',
            left: '64%',
            width: '16%',
            height: '28%',
            borderRadius: 999,
            backgroundColor: bodyTone,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '58%',
            left: '38%',
            width: '10%',
            height: '28%',
            borderRadius: 999,
            backgroundColor: bodyTone,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: '58%',
            left: '52%',
            width: '10%',
            height: '28%',
            borderRadius: 999,
            backgroundColor: bodyTone,
          }}
        />

        {zones.map((zone) => {
          const piece = getLookPieceByZone(look, zone.key);
          if (!piece) return null;
          const uri = piece.processedImageUri || piece.imageUri;

          return (
            <View
              key={zone.key}
              style={{
                position: 'absolute',
                top: `${zone.top}%`,
                left: `${zone.left}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                borderRadius: 18,
                backgroundColor: zone.background || '#F7F2EB',
                overflow: 'hidden',
                zIndex: zone.zIndex,
                borderWidth: 1,
                borderColor: '#E8DED4',
                transform: [{ rotate: `${zone.rotate || 0}deg` }],
                padding: zone.padding || 0,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
            >
              <Image
                source={{ uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          );
        })}
      </View>

      <Text
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: colors.muted,
          marginTop: 12,
        }}
      >
        Mümkünse arka planı silinmiş görseller kullanılır; böylece mockup daha gerçek görünür.
      </Text>
    </View>
  );
}
