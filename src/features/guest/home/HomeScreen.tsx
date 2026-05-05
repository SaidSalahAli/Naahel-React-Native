import { ScrollView, StyleSheet, View } from "react-native";
import CoursesSection from "./components/CoursesSection";
import ExamsSection from "./components/ExamsSection";
import HeroSection from "./components/HeroSection";
import LearningPathsSection from "./components/LearningPathsSection";
import ProgramsSection from "./components/ProgramsSection";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeroSection />
        <CoursesSection />
        <ProgramsSection />
        <LearningPathsSection />
        <ExamsSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    paddingTop: 14,
    paddingBottom: 20,
  },
});
