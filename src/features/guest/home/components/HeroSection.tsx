import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HeroSection() {
  return (
    <View style={styles.heroWrapper}>
      <View style={styles.hero}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <View style={styles.leftContent}>
          <Text style={styles.welcome}>Welcome back!</Text>

          <Text style={styles.title}>
            Learn. Grow.{"\n"}
            <Text style={styles.titleAccent}>Succeed.</Text>
          </Text>

          <Text style={styles.description}>
            Discover courses and programs designed to advance your career.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.button}
            onPress={() => router.push("/programs" as any)}
          >
            <Text style={styles.buttonText}>Explore Programs</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageBox}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3976/3976631.png",
            }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

   
      </View>


    </View>
  );
}

function QuickAction({ icon, title }: { icon: string; title: string }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.actionCard}>
      <View style={styles.actionIcon}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <Text style={styles.actionTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    marginHorizontal: 16,
  },

  hero: {
    minHeight: 250,
    borderRadius: 28,
    backgroundColor: "#123CFF",
    overflow: "hidden",
    padding: 22,
  },

  glowOne: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -70,
    top: -35,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  glowTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: 45,
    bottom: -80,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  leftContent: {
    width: "58%",
    zIndex: 2,
  },

  welcome: {
    color: "#FFE36A",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    marginBottom: 12,
  },

  titleAccent: {
    color: "#FFE36A",
  },

  description: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    marginBottom: 18,
  },

  button: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
  },

  buttonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },

  arrow: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },

  imageBox: {
    position: "absolute",
    right: 8,
    bottom: 30,
    width: 160,
    height: 160,
    zIndex: 2,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  dots: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  dotActive: {
    backgroundColor: "#fff",
    width: 18,
  },

  quickActions: {
    marginTop: -6,
    paddingTop: 26,
    paddingHorizontal: 2,
    flexDirection: "row",
    gap: 10,
  },

  actionCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#EEF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  actionIconText: {
    color: "#123CFF",
    fontSize: 22,
    fontWeight: "900",
  },

  actionTitle: {
    color: "#111827",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
