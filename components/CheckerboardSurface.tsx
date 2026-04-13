import { View } from 'react-native';

export default function CheckerboardSurface({
  rows = 12,
  cols = 12,
  cell = 20,
}: {
  rows?: number;
  cols?: number;
  cell?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flexDirection: 'column',
      }}
    >
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row', height: cell }}>
          {Array.from({ length: cols }).map((__, col) => {
            const dark = (row + col) % 2 === 0;
            return (
              <View
                key={`${row}-${col}`}
                style={{
                  width: cell,
                  height: cell,
                  backgroundColor: dark ? '#D9D9D9' : '#F1F1F1',
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
