import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HeroSection() {
  return (
    <View style={styles.heroWrapper}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.overlay} />

        <View style={styles.shapeCircle} />
        <View style={styles.shapeSquare} />

        <View style={styles.content}>
          <Text style={styles.title}>Empowering Growth Through Learning</Text>

          <Text style={styles.description}>
            Discover Al Rajhi Bank&apos;s eLearning platform — your gateway to
            professional development through interactive classrooms, certified
            courses, and comprehensive training programs.
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    marginTop: 18,
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: "hidden",
    minHeight: 580,
  },
  hero: {
    minHeight: 580,
    justifyContent: "center",
  },
  heroImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  shapeCircle: {
    position: "absolute",
    right: -35,
    top: 90,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(129, 101, 255, 0.42)",
  },
  shapeSquare: {
    position: "absolute",
    right: 28,
    bottom: 70,
    width: 120,
    height: 120,
    backgroundColor: "rgba(129, 101, 255, 0.35)",
  },
  content: {
    paddingHorizontal: 24,
    zIndex: 2,
  },
  title: {
    color: "#fff",
    fontSize: 38,
    lineHeight: 48,
    fontWeight: "900",
    marginBottom: 22,
  },
  description: {
    color: "#F1F1F1",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "600",
    marginBottom: 40,
  },
  button: {
    width: 210,
    height: 58,
    backgroundColor: "#8D73E6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
