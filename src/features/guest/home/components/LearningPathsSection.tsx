import { useTenant } from "@/contexts/TenantContext";
import { getLearningPaths } from "@/services/homeApi";
import { router } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Animated,
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

interface LearningPath {
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
  skill?: ItemInfo | ItemInfo[];
  tenant?: { id?: string | number; name: string };
  coursescount?: number;
  totalcourses?: number;
  itemtype?: string;
}

interface Category {
  id: string | number;
  name: string;
}

export default function LearningPathsSection() {
  const { currentTenant } = useTenant();

  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const loadPaths = async () => {
      if (!currentTenant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response: any = await getLearningPaths(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 10 },
        );

        const apiPaths =
          response?.learning_paths ||
          response?.learningpaths ||
          response?.paths ||
          [];

        setPaths(Array.isArray(apiPaths) ? apiPaths : []);
        setCategories(
          Array.isArray(response?.categories) ? response.categories : [],
        );
      } catch (err: any) {
        console.error("Error loading learning paths:", err);
        setError(err?.message || "Failed to load learning paths");
      } finally {
        setLoading(false);
      }
    };

    loadPaths();
  }, [currentTenant?.id, currentTenant?.language]);

  const filteredPaths = useMemo(() => {
    if (activeTab === 0) return paths;

    const selectedCategory = categories[activeTab - 1];
    if (!selectedCategory) return paths;

    return paths.filter((path) => {
      if (!path.category) return false;

      if (Array.isArray(path.category)) {
        return path.category.some(
          (cat) => String(cat.id) === String(selectedCategory.id),
        );
      }

      return String(path.category.id) === String(selectedCategory.id);
    });
  }, [paths, categories, activeTab]);

  const handlePathPress = useCallback((path: LearningPath) => {
    router.push({
      pathname: "/learning-paths/[id]",
      params: {
        id: String(path.id),
        path: JSON.stringify(path),
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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
          <Text style={styles.sectionSubtitle}>Guided Learning</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/learning-paths" as any)}
        >
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionDescription}>
        Follow structured paths from beginner to expert level.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {categories.slice(0, 4).map((category, index) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={String(category.id)}
            style={[styles.tab, activeTab === index + 1 && styles.tabActive]}
            onPress={() => setActiveTab(index + 1)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index + 1 && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredPaths.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredPaths}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <LearningPathCard
              path={item}
              onPress={() => handlePathPress(item)}
            />
          )}
          contentContainerStyle={styles.pathsListContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No learning paths found.</Text>
        </View>
      )}
    </Animated.View>
  );
}

interface LearningPathCardProps {
  path: LearningPath;
  onPress: () => void;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({
  path,
  onPress,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const coursesCount = path.totalcourses ?? path.coursescount ?? 0;

  const price =
    path.finalprice && Number(path.finalprice) > 0
      ? `₪${path.finalprice}`
      : "Free";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.pathCard}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: path.logo || "https://via.placeholder.com/400x260",
          }}
          style={styles.pathImage}
          resizeMode="cover"
        />

        <View style={styles.imageOverlay} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>PATH</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favoriteButton}
          onPress={() => setIsFavorite((prev) => !prev)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? "♥" : "♡"}</Text>
        </TouchableOpacity>

        <View style={styles.coursesCountBadge}>
          <Text style={styles.coursesCountText}>{coursesCount} Courses</Text>
        </View>
      </View>

      <View style={styles.pathContent}>
        <Text style={styles.pathName} numberOfLines={2}>
          {path.name}
        </Text>

        <Text style={styles.provider} numberOfLines={1}>
          💼 {path.tenant?.name || "Provider"}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.ratingText}>
            ⭐ {path.rating?.average || 0}
            <Text style={styles.ratingCount}>
              {" "}
              ({path.rating?.total_users || 0})
            </Text>
          </Text>

          <Text style={styles.price}>{price}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.startButton}
          onPress={onPress}
        >
          <Text style={styles.startButtonText}>START PATH</Text>
          <Text style={styles.startArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 26,
  },

  loadingContainer: {
    backgroundColor: "#fff",
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  errorContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#FFF3CD",
    borderRadius: 18,
  },

  errorText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "800",
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#123CFF",
    marginTop: 3,
  },

  viewAll: {
    color: "#123CFF",
    fontSize: 14,
    fontWeight: "900",
    paddingTop: 6,
  },

  sectionDescription: {
    paddingHorizontal: 20,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    fontWeight: "600",
    marginBottom: 16,
  },

  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 10,
  },

  tab: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#123CFF",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    maxWidth: 130,
  },

  tabTextActive: {
    color: "#fff",
  },

  pathsListContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },

  emptyContainer: {
    marginHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 22,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "800",
  },

  pathCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginBottom: 8,
  },

  imageContainer: {
    height: 135,
    backgroundColor: "#EEF1FF",
    position: "relative",
  },

  pathImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  badge: {
    position: "absolute",
    left: 12,
    bottom: -13,
    backgroundColor: "#E8EAFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 13,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#123CFF",
  },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteIcon: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 28,
  },

  coursesCountBadge: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
  },

  coursesCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
  },

  pathContent: {
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 14,
  },

  pathName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    color: "#111827",
    minHeight: 42,
    marginBottom: 8,
  },

  provider: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 12,
  },

  infoRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
    paddingTop: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ratingText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "900",
  },

  ratingCount: {
    color: "#6B7280",
    fontWeight: "600",
  },

  price: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "900",
  },

  startButton: {
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  startButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "900",
  },

  startArrow: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "900",
  },
});
