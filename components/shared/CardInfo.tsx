import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CardInfo({ data }: { data: any }) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!data) return null;

  const language =
    data.language === "en"
      ? "English"
      : data.language === "ar"
        ? "Arabic"
        : "Both";

  const trainingType =
    data.trainingtype?.name === "offline"
      ? "Offline"
      : data.trainingtype?.name === "virtual"
        ? "Virtual"
        : "Blended";

  const info = [
    ["Training Type", trainingType],
    ["Language", language],
    ["Certificate", data.certificate ? "Yes" : "No"],
    ["Reward", `${data.points || 0} points`],
    ["Level", data.level?.name || "N/A"],
    ["Skill", data.skill?.name || "N/A"],
  ];

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: data.logo || "https://via.placeholder.com/400x250",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.title}>CLASS INFORMATION</Text>

      <View style={styles.dividerDark} />

      {info.map(([label, value], index) => (
        <View key={label}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>

          {index < info.length - 1 && <View style={styles.divider} />}
        </View>
      ))}

      <View style={styles.dividerDark} />

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.85} style={styles.mainButton}>
          <Text style={styles.mainButtonText}>
            {data.approval_required ? "REQUEST ENROLLMENT" : "ADD TO CART"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.favoriteButton}
          onPress={() => setIsFavorite((prev) => !prev)}
        >
          <Text
            style={[styles.favoriteText, isFavorite && styles.favoriteActive]}
          >
            {isFavorite ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    backgroundColor: "#EEF1FF",
    marginBottom: 16,
  },

  title: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 12,
  },

  dividerDark: {
    height: 1,
    backgroundColor: "#111827",
    opacity: 0.15,
    marginBottom: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8EAFF",
  },

  infoRow: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  label: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  value: {
    flex: 1,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },

  actions: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  mainButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  mainButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  favoriteButton: {
    width: 52,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#111827",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteText: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 32,
  },

  favoriteActive: {
    color: "#EF4444",
  },
});
