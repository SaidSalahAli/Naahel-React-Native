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

interface ItemInfo {
  id: string | number;
  name: string;
}

interface Course {
  id: string | number;
  name: string;
  logo?: string;
  description?: string;
  rating?: {
    average: number;
    total_users: number;
  };
  finalprice?: string | number;
  language?: string;
  category?: ItemInfo | ItemInfo[];
  level?: ItemInfo | ItemInfo[];
  tenant?: { name: string };
  itemtype?: string;
}

interface Category {
  id: string | number;
  name: string;
}

export default function CoursesSection() {
  const { currentTenant } = useTenant();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadCourses = async () => {
      if (!currentTenant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response: any = await getCourses(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 10 },
        );

        setCourses(Array.isArray(response?.courses) ? response.courses : []);
        setCategories(
          Array.isArray(response?.categories) ? response.categories : [],
        );
      } catch (error) {
        console.log("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [currentTenant?.id, currentTenant?.language]);

  const filteredCourses = useMemo(() => {
    if (activeTab === 0) return courses;

    const selectedCategory = categories[activeTab - 1];
    if (!selectedCategory) return courses;

    return courses.filter((course) => {
      if (!course.category) return false;

      if (Array.isArray(course.category)) {
        return course.category.some(
          (cat) => String(cat.id) === String(selectedCategory.id),
        );
      }

      return String(course.category.id) === String(selectedCategory.id);
    });
  }, [courses, categories, activeTab]);

  const handleCoursePress = useCallback((course: Course) => {
    router.push({
      pathname: "/courses/[id]",
      params: {
        id: String(course.id),
        course: JSON.stringify(course),
      },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#123CFF" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title="Recommended for you"
        onPress={() => router.push("/courses" as any)}
      />

      {filteredCourses.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredCourses}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => handleCoursePress(item)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}


    </View>
  );
}

function SectionHeader({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.viewAll}>View all</Text>
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

  const price =
    course.finalprice && Number(course.finalprice) > 0
      ? `${course.finalprice}`
      : "Free";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: course.logo || "https://via.placeholder.com/300" }}
          style={styles.image}
          resizeMode="cover"
        />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favorite}
          onPress={() => setIsFavorite((prev) => !prev)}
        >
          <Text style={styles.favoriteText}>{isFavorite ? "♥" : "♡"}</Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>COURSE</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {course.name}
        </Text>

        <Text style={styles.provider} numberOfLines={1}>
          💼 {course.tenant?.name || "AlRajhi Bank"}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.rating}>
            ⭐ {course.rating?.average || 0}
            <Text style={styles.ratingUsers}>
              {" "}
              ({course.rating?.total_users || 0})
            </Text>
          </Text>

          <Text style={styles.price}>{price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function CategoryChip({
  title,
  icon,
  active,
  onPress,
}: {
  title: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.categoryChip, active && styles.categoryChipActive]}
    >
      <Text style={[styles.categoryIcon, active && styles.categoryIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    alignItems: "center",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 23,
    fontWeight: "900",
  },
  viewAll: {
    color: "#123CFF",
    fontSize: 14,
    fontWeight: "900",
  },
  list: {
    paddingLeft: 20,
    paddingRight: 12,
    gap: 16,
  },
  card: {
    width: 210,
    borderRadius: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 6,
    marginBottom: 26,
  },
  imageBox: {
    height: 128,
    backgroundColor: "#EEF1FF",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favorite: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  badge: {
    position: "absolute",
    left: 12,
    bottom: -14,
    backgroundColor: "#FFE66D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "900",
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 14,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    minHeight: 42,
    marginBottom: 10,
  },
  provider: {
    color: "#777",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },
  ratingUsers: {
    color: "#777",
    fontWeight: "600",
  },
  price: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  browseTitle: {
    paddingHorizontal: 20,
    color: "#111827",
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 14,
  },
  categories: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 12,
  },
  categoryChip: {
    minWidth: 98,
    height: 76,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  categoryChipActive: {
    backgroundColor: "#123CFF",
  },
  categoryIcon: {
    color: "#123CFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  categoryIconActive: {
    color: "#fff",
  },
  categoryText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },
  categoryTextActive: {
    color: "#fff",
  },
});
