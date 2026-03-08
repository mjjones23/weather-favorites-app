import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, router } from "expo-router";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("@favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  // Reload every time you open this tab
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  function openCity(city: string) {
    // Navigate to Home tab and pass the city
    router.push({ pathname: "/(tabs)", params: { city } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      {favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites yet. Save a city on Home ⭐</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => openCity(item)}>
              <Text style={styles.city}>{item}</Text>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12, color: "#000" },
  empty: { marginTop: 20, color: "#333" },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  city: { fontSize: 16, fontWeight: "600", color: "#000" },
  chev: { fontSize: 22, color: "#555" },
  separator: { height: 10 },
});