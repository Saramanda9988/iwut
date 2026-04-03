import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from "react-native";

export function ScrollPicker({
  items,
  selectedIndex,
  onSelect,
  itemHeight = 36,
  visibleCount = 5,
}: Readonly<{
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  itemHeight?: number;
  visibleCount?: number;
}>) {
  const padding = Math.floor(visibleCount / 2);
  const listRef = useRef<FlatList>(null);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
    onSelect(Math.max(0, Math.min(index, items.length - 1)));
  };

  return (
    <View style={{ height: itemHeight * visibleCount }}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        snapToInterval={itemHeight}
        decelerationRate="fast"
        initialScrollIndex={selectedIndex}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: itemHeight * padding }}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item, index }) => (
          <View
            style={{ height: itemHeight }}
            className="items-center justify-center"
          >
            <Text
              className={
                index === selectedIndex
                  ? "text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                  : "text-base text-neutral-400 dark:text-neutral-500"
              }
            >
              {item}
            </Text>
          </View>
        )}
      />
      <View
        pointerEvents="none"
        className="absolute left-0 right-0"
        style={{ top: itemHeight * padding, height: itemHeight }}
      >
        <LinearGradient
          colors={["transparent", "rgba(180, 180, 180, 0.4)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 1 }}
        />
        <View style={{ flex: 1 }} />
        <LinearGradient
          colors={["transparent", "rgba(180, 180, 180, 0.4)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 1 }}
        />
      </View>
    </View>
  );
}
