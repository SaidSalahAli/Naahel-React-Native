import { useTenant } from "@/contexts/TenantContext";
import { getCourses } from "@/services";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// API service - we'll create this

interface Course {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  rating?: {
    average: number;
    total_users: number;
  };
  finalprice?: string | number;
  language?: string;
  category?: Array<{ id: string; name: string }>;
  level?: Array<{ name: string }>;
  tenant?: { name: string };
  itemtype?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CoursesSection() {
  const { currentTenant } = useTenant();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load courses from API
  useEffect(() => {
    const loadCourses = async () => {
      if (!currentTenant?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getCourses(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 10 },
        );

        setCourses(response?.courses || []);
        setCategories(response?.categories || []);
      } catch (err: any) {
        console.error("Error loading courses:", err);
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [currentTenant?.id]);

  // Filter courses based on active tab
  const filteredCourses = useMemo(() => {
    if (activeTab === 0) {
      return courses;
    } else {
      const categoryIndex = activeTab - 1;
      const selectedCategory = categories[categoryIndex];

      if (!selectedCategory) return courses;

      return courses.filter((course) => {
        if (!course.category) return false;

        if (Array.isArray(course.category)) {
          return course.category.some(
            (cat) => cat && cat.id === selectedCategory.id,
          );
        }

        // Handle single category object
        const singleCat = course.category as any;
        return singleCat && singleCat.id === selectedCategory.id;
      });
    }
  }, [courses, categories, activeTab]);

  const handleCoursePress = useCallback((course: Course) => {
    router.push({
      pathname: "/courses/[id]",
      params: { id: course.id, course: JSON.stringify(course) },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#032E9B" />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <Text style={styles.sectionSubtitle}>Your Learning Journey</Text>
        <Text style={styles.sectionDescription}>
          Explore our diverse courses and find the perfect fit for your goals!
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {/* All Courses Tab */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => setActiveTab(0)}
        >
          <Text
            style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}
          >
            ALL COURSES
          </Text>
        </TouchableOpacity>

        {/* Category Tabs */}
        {categories.slice(0, 4).map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.tab, activeTab === index + 1 && styles.tabActive]}
            onPress={() => setActiveTab(index + 1)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index + 1 && styles.tabTextActive,
              ]}
            >
              {category.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Courses List */}
      {filteredCourses.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => handleCoursePress(item)} />
          )}
          contentContainerStyle={styles.coursesListContainer}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No courses found for this category.
          </Text>
        </View>
      )}

      {/* Show All Button */}
      <TouchableOpacity
        style={styles.showAllButton}
        onPress={() => router.push("/courses")}
      >
        <Text style={styles.showAllButtonText}>Show All Courses →</Text>
      </TouchableOpacity>
    </View>
  );
}

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const tags: string[] = [
    course.language,
    ...(Array.isArray(course.category)
      ? course.category.map((cat) => cat.name)
      : []),
    ...(Array.isArray(course.level)
      ? course.level.map((level) =>
          typeof level === "string" ? level : level.name || "",
        )
      : []),
  ].filter(
    (tag): tag is string => Boolean(tag) && tag !== "unknown" && tag !== "",
  );

  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress}>
      {/* Course Image */}
      <View style={styles.courseImageContainer}>
        <Image
          source={{ uri: course.logo || "https://via.placeholder.com/180x120" }}
          style={styles.courseImage}
          resizeMode="cover"
        />

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      {/* Course Info */}
      <View style={styles.courseContent}>
        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Course Name */}
        <Text style={styles.courseName} numberOfLines={2}>
          {course.name}
        </Text>

        {/* Provider */}
        <Text style={styles.provider}>
          💼 {course.tenant?.name || "Provider"}
        </Text>

        {/* Price and Rating */}
        <View style={styles.priceRatingContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {course.finalprice && course.finalprice !== "Free"
                ? `${course.finalprice} SAR`
                : "Free"}
            </Text>
          </View>

          {course.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>⭐ {course.rating.average}</Text>
              <Text style={styles.ratingCount}>
                ({course.rating.total_users})
              </Text>
            </View>
          )}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartButtonText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginVertical: 12,
    borderRadius: 12,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  errorContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    marginVertical: 12,
  },

  errorText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "500",
  },

  titleContainer: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#032E9B",
    marginBottom: 8,
  },

  sectionDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  // Tabs
  tabsScrollView: {
    marginBottom: 20,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },

  tabsContainer: {
    gap: 8,
  },

  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F7F5D7",
    justifyContent: "center",
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#000",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },

  tabTextActive: {
    color: "#fff",
  },

  // Courses List
  coursesListContainer: {
    paddingRight: 16,
    gap: 12,
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },

  // Course Card
  courseCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 12,
  },

  courseImageContainer: {
    position: "relative",
    height: 120,
    backgroundColor: "#f0f0f0",
  },

  courseImage: {
    width: "100%",
    height: "100%",
  },

  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteIcon: {
    fontSize: 16,
  },

  courseContent: {
    padding: 12,
  },

  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },

  tag: {
    backgroundColor: "#F5F1DF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },

  tagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
  },

  courseName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
    height: 32,
  },

  provider: {
    fontSize: 11,
    color: "#666",
    marginBottom: 8,
  },

  priceRatingContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 8,
    marginBottom: 10,
  },

  priceContainer: {
    marginBottom: 6,
  },

  price: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingStars: {
    fontSize: 11,
    fontWeight: "600",
  },

  ratingCount: {
    fontSize: 10,
    color: "#666",
  },

  addToCartButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },

  addToCartButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  showAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  showAllButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
});
