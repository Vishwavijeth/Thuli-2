import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { displayItems } from "../items/displayItems";
import { Card } from "./Cards";

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const MAX_SWIPES = 15;
  const BASE_WEIGHT = 1;
  const ITEM_WEIGHT = 1.0;
  const TYPE_WEIGHT = 0.7;
  const NEGATIVE_WEIGHT = 0.5;

  const [genderFilter, setGenderFilter] = useState("Male");
  const [currentItems, setCurrentItems] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);

  const [genderState, setGenderState] = useState({
    Male: { swipes: [], scores: {}, currentIndex: 0 },
    Female: { swipes: [], scores: {}, currentIndex: 0 },
  });

  const shuffleArray = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Filter and shuffle items whenever gender changes
  useEffect(() => {
    const filtered = displayItems.filter(
      (item) => item.gender.toLowerCase() === genderFilter.toLowerCase()
    );
    const shuffled = shuffleArray(filtered);
    setCurrentItems(shuffled);
    setCurrentCard(shuffled[0] || null);

    setGenderState((prev) => ({
      ...prev,
      [genderFilter]: { swipes: [], scores: {}, currentIndex: 0 },
    }));
  }, [genderFilter]);

  const requiredSwipes = useMemo(
    () => Math.min(MAX_SWIPES, currentItems.length || 0),
    [currentItems.length]
  );

  const canNavigate =
    genderState[genderFilter].swipes.length >= requiredSwipes &&
    requiredSwipes > 0;

  const handleSwipe = (direction) => {
    const idx = genderState[genderFilter].currentIndex;
    const item = currentItems[idx];
    if (!item) return;

    setGenderState((prev) => {
      const gState = { ...prev[genderFilter] };
      const key = `${item.item}_${item.type}`;

      gState.scores[key] =
        (gState.scores[key] || 0) +
        (direction === "right"
          ? BASE_WEIGHT * (ITEM_WEIGHT + TYPE_WEIGHT)
          : -BASE_WEIGHT * NEGATIVE_WEIGHT);

      gState.swipes.push(direction === "right" ? 1 : 0);
      gState.currentIndex = Math.min(idx + 1, currentItems.length);

      return { ...prev, [genderFilter]: gState };
    });
  };

  const getTopPreferencesForCurrentGender = () => {
    const scores = genderState[genderFilter].scores || {};
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key);
  };

  useEffect(() => {
    const gState = genderState[genderFilter];
    if (gState.swipes.length === requiredSwipes && requiredSwipes > 0) {
      const top = Object.entries(gState.scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      if (top.length) {
        console.log(`===== Top 5 Preferences (${genderFilter}) =====`);
        top.forEach(([key, score], i) =>
          console.log(`${i + 1}. ${key}: ${score.toFixed(2)} points`)
        );
        console.log("==================================");
      }
    }
  }, [genderState, genderFilter, requiredSwipes]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jewels</Text>

      {/* Gender selector */}
      <View style={styles.genderSelector}>
        {["Male", "Female"].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[
              styles.genderButton,
              genderFilter === gender && styles.activeGender,
            ]}
            onPress={() => setGenderFilter(gender)}
          >
            <Text
              style={[
                styles.genderText,
                genderFilter === gender && styles.activeGenderText,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swiper */}
      <View style={styles.centerWrapper}>
        {currentItems.length > 0 && (
          <Swiper
            key={genderFilter} // remount on gender change
            cards={currentItems}
            renderCard={(card) => <Card item={card} />}
            cardIndex={genderState[genderFilter].currentIndex}
            onSwipedLeft={(cardIndex) => {
              handleSwipe("left");
              setCurrentCard(currentItems[cardIndex + 1] || null);
            }}
            onSwipedRight={(cardIndex) => {
              handleSwipe("right");
              setCurrentCard(currentItems[cardIndex + 1] || null);
            }}
            stackSize={3}
            verticalSwipe={false}
            backgroundColor="transparent"
          />
        )}
      </View>

      {/* Item details */}
      {currentCard && (
        <View style={styles.detailsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{currentCard.item}</Text>
          </View>
          <View style={styles.tagSecondary}>
            <Text style={styles.tagTextSecondary}>{currentCard.type}</Text>
          </View>
        </View>
      )}

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[
            styles.navButton,
            canNavigate
              ? { backgroundColor: "#FFD700" }
              : styles.navButtonDisabled,
          ]}
          disabled={!canNavigate}
          onPress={() =>
            navigation.navigate("Recommendation", {
              preferences: getTopPreferencesForCurrentGender(),
              gender: genderFilter,
            })
          }
        >
          <Text style={styles.navText}>For You</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 8, color: "#666" }}>
          {genderState[genderFilter].swipes.length}/{requiredSwipes || 0} swipes
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    padding: 30,
  },
  genderSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 15,
  },
  genderButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  activeGender: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  genderText: { fontSize: 16, fontWeight: "600", color: "#444" },
  activeGenderText: { color: "#000" },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  tag: {
    backgroundColor: "#f4870bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  tagText: { fontSize: 15, fontWeight: "bold", color: "#000" },
  tagSecondary: {
    backgroundColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  tagTextSecondary: { fontSize: 15, fontWeight: "600", color: "#444" },
  bottomNav: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderColor: "#ccc",
    padding: 20,
  },
  navButton: {
    width: 160,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: { backgroundColor: "#ccc" },
  navText: { fontWeight: "bold", fontSize: 15, color: "#000" },
});
