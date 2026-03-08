import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

export default function WeatherScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const params = useLocalSearchParams<{ city?: string }>();

  function round1(n: number) {
    return Math.round(n * 10) / 10;
  }

  function cap(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  useEffect(() => {
    async function loadFavorites() {
      try {
        const stored = await AsyncStorage.getItem("@favorites");
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch {
        setFavorites([]);
      }
    }
    loadFavorites();
  }, []);

  useEffect(() => {
    if (params.city && typeof params.city === "string") {
      setCity(params.city);
      setTimeout(() => {
        fetchWeather(params.city);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.city]);

  async function fetchWeather(cityOverride?: string) {
    const query = (cityOverride ?? city).trim();
    if (!query) return;

    try {
      setLoading(true);
      setError(null);
      setWeather(null);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          query
        )}&appid=b098248694191b3a1b67bd59a41a7bc6&units=imperial`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "City not found");
        return;
      }

      setWeather(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function saveFavorite() {
    if (!weather?.name) return;

    const updated = Array.from(new Set([...favorites, weather.name]));
    setFavorites(updated);

    await AsyncStorage.setItem("@favorites", JSON.stringify(updated));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather + Favorites</Text>

      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Enter a city (e.g. Chicago)"
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={() => fetchWeather()}>
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>

      {loading && <Text style={styles.status}>Loading...</Text>}
      {error && <Text style={[styles.status, { color: "red" }]}>{error}</Text>}

      {weather?.main?.temp != null && (
        <View style={styles.card}>
          <Text style={styles.cityName}>
            {weather.name}
            {weather?.sys?.country ? `, ${weather.sys.country}` : ""}
          </Text>

          <Text style={styles.temp}>{round1(weather.main.temp)}°F</Text>
          <Text style={styles.desc}>
            {cap(weather.weather?.[0]?.description ?? "")}
          </Text>

          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Feels like</Text>
              <Text style={styles.metricValue}>
                {round1(weather.main.feels_like)}°
              </Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricValue}>{weather.main.humidity}%</Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricValue}>
                {round1(weather.wind?.speed ?? 0)} mph
              </Text>
            </View>
          </View>

          <Pressable onPress={saveFavorite} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>⭐ Save to Favorites</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    color: "#000",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: "800",
    color: "#000",
  },
  status: {
    marginTop: 10,
    textAlign: "center",
    color: "#000",
  },

  card: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  cityName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    color: "#000",
    textAlign: "center",
  },
  temp: {
    fontSize: 44,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
  },
  desc: {
    marginTop: 4,
    marginBottom: 14,
    color: "#333",
    textAlign: "center",
  },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  metric: { flex: 1, alignItems: "center" },
  metricLabel: { fontSize: 12, color: "#555" },
  metricValue: { fontSize: 16, fontWeight: "700", color: "#000", marginTop: 2 },

  saveBtn: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  saveBtnText: { fontWeight: "800" },
});