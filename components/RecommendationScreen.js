import React, { useMemo } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { recommendItems } from "../items/recommendItems";

export default function RecommendationScreen() {
  const route = useRoute();
  const { preferences = [], gender = "Male" } = route.params || {};

  // Filter items strictly based on preferences
  const filteredItems = useMemo(() => {
    if (!preferences || preferences.length === 0) return [];

    return preferences.flatMap((pref) => {
      const [prefItem, prefType] = String(pref).split("_");
      return recommendItems.filter(
        (d) =>
          d.gender?.toLowerCase() === gender?.toLowerCase() &&
          d.item?.toLowerCase() === prefItem?.toLowerCase() &&
          d.type?.toLowerCase() === prefType?.toLowerCase()
      );
    });
  }, [preferences, gender]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended For You</Text>
      <FlatList
        style={styles.flatlistView}
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.caption}>
              {item.item} ({item.type})
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flatlistView: { marginTop: 20 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 6,
    textAlign: "center",
  },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  image: { width: "100%", height: 170 },
  caption: { textAlign: "center", padding: 8, fontWeight: "600" },
});