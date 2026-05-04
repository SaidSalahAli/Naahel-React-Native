import { ScrollView, StyleSheet, View } from "react-native";
import GuestHeader from "./components/GuestHeader";
import HeroSection from "./components/HeroSection";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <GuestHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeroSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101316",
  },
  content: {
    paddingBottom: 120,
  },
});
