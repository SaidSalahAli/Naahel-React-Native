import { ScrollView, StyleSheet, View } from "react-native";
import ClassRoomsSection from "./components/ClassRoomsSection";
import CoursesSection from "./components/CoursesSection";
import ProgramsSection from "./components/ProgramsSection";
import LearningPathsSection from "./components/LearningPathsSection";
import ExamsSection from "./components/ExamsSection";
import HeroSection from "./components/HeroSection";
import TenantHeader from "./components/TenantHeader";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <TenantHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HeroSection />
        <CoursesSection />
        <ClassRoomsSection />
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
    backgroundColor: "#101316",
  },
  content: {
    paddingBottom: 120,
  },
});
