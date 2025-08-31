import React, { useState, useRef, useEffect } from "react";
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
  const [userSwipes, setUserSwipes] = useState([]);
  const [genderFilter, setGenderFilter] = useState("Male");
  const [currentItems, setCurrentItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScores, setUserScores] = useState({});

  const swiperRef = useRef(null);
  const MAX_SWIPES = 10;

  // Weights
  const BASE_WEIGHT = 1;
  const ITEM_WEIGHT = 1.0;
  const TYPE_WEIGHT = 0.7;
  const NEGATIVE_WEIGHT = 0.5;

  // Shuffle array
  const shuffleArray = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Filter and shuffle items by gender
  useEffect(() => {
    const filtered = displayItems.filter(
      (item) => item.gender.toLowerCase() === genderFilter.toLowerCase()
    );
    const shuffled = shuffleArray(filtered);
    setCurrentItems(shuffled);
    setCurrentIndex(0);
    setUserScores({});
    setUserSwipes([]);
  }, [genderFilter]);

  // Compute if the button should be active
  const canNavigate = userSwipes.length >= MAX_SWIPES;

  // Log top preferences after MAX_SWIPES
  useEffect(() => {
    if (userSwipes.length === MAX_SWIPES) {
      const entries = Object.entries(userScores);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        console.log("===== Top 5 Preferences =====");
        entries.slice(0, 5).forEach(([key, score], index) =>
          console.log(`${index + 1}. ${key}: ${score.toFixed(2)} points`)
        );
        console.log("==================================");
      }
    }
  }, [userSwipes]);

  // Handle swipe
  const handleSwipe = (cardIndex, direction) => {
    const item = currentItems[cardIndex];
    if (!item) return;

    // Update user scores
    setUserScores((prev) => {
      const newScores = { ...prev };
      const key = `${item.item}_${item.type}`;
      if (direction === "right") {
        newScores[key] =
          (newScores[key] || 0) + BASE_WEIGHT * (ITEM_WEIGHT + TYPE_WEIGHT);
      } else {
        newScores[key] = (newScores[key] || 0) - BASE_WEIGHT * NEGATIVE_WEIGHT;
      }
      return newScores;
    });

    // Track swipes
    setUserSwipes((prev) => [...prev, { itemId: item.id, swipe: direction === "right" ? 1 : 0 }]);

    setCurrentIndex(cardIndex + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jewels</Text>

      {/* Gender Buttons */}
      <View style={styles.genderSelector}>
        <TouchableOpacity
          style={[styles.genderButton, genderFilter === "Male" && styles.activeGender]}
          onPress={() => setGenderFilter("Male")}
        >
          <Text
            style={[styles.genderText, genderFilter === "Male" && styles.activeGenderText]}
          >
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, genderFilter === "Female" && styles.activeGender]}
          onPress={() => setGenderFilter("Female")}
        >
          <Text
            style={[styles.genderText, genderFilter === "Female" && styles.activeGenderText]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swiper */}
      <View style={styles.centerWrapper}>
        <Swiper
          ref={swiperRef}
          cards={currentItems}
          renderCard={(card) => <Card item={card} />}
          onSwipedLeft={(i) => handleSwipe(i, "left")}
          onSwipedRight={(i) => handleSwipe(i, "right")}
          cardIndex={currentIndex}
          backgroundColor="transparent"
          stackSize={3}
          verticalSwipe={false}
        />
      </View>

      {/* Item details */}
      {currentItems[currentIndex] && (
        <View style={styles.detailsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{currentItems[currentIndex].item}</Text>
          </View>
          <View style={styles.tagSecondary}>
            <Text style={styles.tagTextSecondary}>{currentItems[currentIndex].type}</Text>
          </View>
        </View>
      )}

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[
            styles.navButton,
            canNavigate ? { backgroundColor: "#FFD700" } : styles.navButtonDisabled,
          ]}
          disabled={!canNavigate}
          onPress={() => navigation.navigate("Recommendation")}
        >
          <Text style={styles.navText}>For You</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 20, textAlign: "center", padding: 30 },
  genderSelector: { flexDirection: "row", justifyContent: "center", marginVertical: 10, gap: 15 },
  genderButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#f9f9f9" },
  activeGender: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  genderText: { fontSize: 16, fontWeight: "600", color: "#444" },
  activeGenderText: { color: "#000" },
  centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: -50 },
  detailsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 12, gap: 10 },
  tag: { backgroundColor: "#f4870bff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15 },
  tagText: { fontSize: 15, fontWeight: "bold", color: "#000" },
  tagSecondary: { backgroundColor: "#eee", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15 },
  tagTextSecondary: { fontSize: 15, fontWeight: "600", color: "#444" },
  bottomNav: { height: 70, justifyContent: "center", alignItems: "center", borderTopWidth: 0.5, borderColor: "#ccc", backgroundColor: "#fff", padding: 50 },
  navButton: { width: 140, height: 45, backgroundColor: "#FFD700", borderRadius: 25, justifyContent: "center", alignItems: "center" },
  navButtonDisabled: { backgroundColor: "#ccc" },
  navText: { fontWeight: "bold", fontSize: 15, color: "#000" },
});
