import { useTenant } from "@/contexts/TenantContext";
import { getClassrooms } from "@/services/homeApi";
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
  Alert,
} from "react-native";

interface Trainer {
  id: string;
  name: string;
}

interface ClassRoom {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  startdate?: string;
  enddate?: string;
  trainingtype?: {
    name: string;
  };
  rating?: {
    average: number;
    total_users: number;
  };
  finalprice?: string | number;
  language?: string;
  category?: Array<{ id: string; name: string }>;
  level?: Array<{ name: string }>;
  tenant?: { name: string };
  trainers?: Trainer[];
  itemtype?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ClassRoomsSection() {
  const { currentTenant } = useTenant();
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load classrooms from API
  useEffect(() => {
    const loadClassrooms = async () => {
      if (!currentTenant?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getClassrooms(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 5 }
        );

        setClassrooms(response?.classrooms || []);
        setCategories(response?.categories || []);
      } catch (err: any) {
        console.error("Error loading classrooms:", err);
        setError(err.message || "Failed to load classrooms");
      } finally {
        setLoading(false);
      }
    };

    loadClassrooms();
  }, [currentTenant?.id]);

  // Filter classrooms based on active tab
  const filteredClassrooms = useMemo(() => {
    if (activeTab === 0) {
      return classrooms;
    } else {
      const categoryIndex = activeTab - 1;
      const selectedCategory = categories[categoryIndex];

      if (!selectedCategory) return classrooms;

      return classrooms.filter((classroom) => {
        if (!classroom.category) return false;

        if (Array.isArray(classroom.category)) {
          return classroom.category.some(
            (cat) => cat && cat.id === selectedCategory.id
          );
        }

        // Handle single category object
        const singleCat = classroom.category as any;
        return singleCat && singleCat.id === selectedCategory.id;
      });
    }
  }, [classrooms, categories, activeTab]);

  const handleClassroomPress = useCallback((classroom: ClassRoom) => {
    router.push({
      pathname: "/classrooms/[id]",
      params: { id: classroom.id, classroom: JSON.stringify(classroom) },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#032E9B" />
        <Text style={styles.loadingText}>Loading classrooms...</Text>
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
        <Text style={styles.sectionTitle}>ClassRooms</Text>
        <Text style={styles.sectionSubtitle}>Your Learning Journey</Text>
        <Text style={styles.sectionDescription}>
          Explore our diverse classrooms and find the perfect fit for your
          goals! Embark on a learning journey that empowers you with knowledge,
          skills, and endless opportunities!
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {/* All ClassRooms Tab */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => setActiveTab(0)}
        >
          <Text
            style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}
          >
            ALL CLASSROOMS
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

      {/* ClassRooms List */}
      {filteredClassrooms.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredClassrooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClassRoomCard
              classroom={item}
              onPress={() => handleClassroomPress(item)}
            />
          )}
          contentContainerStyle={styles.classroomsListContainer}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No classrooms found for this category.
          </Text>
        </View>
      )}

      {/* Show All Button */}
      <TouchableOpacity
        style={styles.showAllButton}
        onPress={() => router.push("/classrooms")}
      >
        <Text style={styles.showAllButtonText}>Show All ClassRooms →</Text>
      </TouchableOpacity>
    </View>
  );
}

interface ClassRoomCardProps {
  classroom: ClassRoom;
  onPress: () => void;
}

const ClassRoomCard: React.FC<ClassRoomCardProps> = ({ classroom, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Get language names
  const getLanguageName = (langCode?: string) => {
    if (!langCode) return "";
    const languageMap: { [key: string]: string } = {
      ar: "Arabic",
      en: "English",
    };

    const codes = langCode.split(",").map((code) => code.trim());
    const names = codes.map((code) => languageMap[code] || code);
    return names.join(", ");
  };

  const tags: string[] = [
    getLanguageName(classroom.language),
    ...(Array.isArray(classroom.category)
      ? classroom.category.map((cat) => cat.name)
      : []),
    ...(Array.isArray(classroom.level)
      ? classroom.level.map((level) =>
          typeof level === "string" ? level : level.name || ""
        )
      : []),
  ].filter(
    (tag): tag is string => Boolean(tag) && tag !== "unknown" && tag !== ""
  );

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Get trainer names
  const trainerNames =
    classroom.trainers && classroom.trainers.length > 0
      ? classroom.trainers
          .map((trainer) => trainer.name)
          .slice(0, 2)
          .join(", ")
      : "Dr. Ahmad Salem";

  const additionalTrainers =
    classroom.trainers && classroom.trainers.length > 2
      ? classroom.trainers.length - 2
      : null;

  return (
    <TouchableOpacity style={styles.classroomCard} onPress={onPress}>
      {/* Training Type Badge */}
      <View style={styles.trainingTypeBadge}>
        <Text style={styles.trainingTypeText}>
          {classroom.trainingtype?.name === "online" ? "ONLINE" : "BLENDED"}
        </Text>
      </View>

      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => setIsFavorite(!isFavorite)}
      >
        <Text style={styles.favoriteIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      {/* ClassRoom Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              classroom.logo || "https://via.placeholder.com/200x200?text=Class",
          }}
          style={styles.classroomImage}
          resizeMode="cover"
        />
      </View>

      {/* ClassRoom Info */}
      <View style={styles.classroomContent}>
        {/* Date Range */}
        {classroom.startdate && classroom.enddate && (
          <Text style={styles.dateRange}>
            {formatDate(classroom.startdate)} → {formatDate(classroom.enddate)}
          </Text>
        )}

        {/* ClassRoom Name */}
        <Text style={styles.classroomName} numberOfLines={2}>
          {classroom.name}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Trainer Info */}
        <Text style={styles.trainerLabel}>TAUGHT BY</Text>
        <Text style={styles.trainerName} numberOfLines={1}>
          {trainerNames} {additionalTrainers && `+${additionalTrainers}`}
        </Text>

        {/* Rating */}
        {classroom.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>
              ⭐ {classroom.rating.average}
            </Text>
            <Text style={styles.ratingCount}>
              ({classroom.rating.total_users} votes)
            </Text>
          </View>
        )}

        {/* Provider */}
        <Text style={styles.provider}>
          💼 {classroom.tenant?.name || "Provider"}
        </Text>

        {/* Price and Join Button */}
        <View style={styles.priceJoinContainer}>
          <Text style={styles.price}>
            {classroom.finalprice && classroom.finalprice !== "Free"
              ? `₪${classroom.finalprice}`
              : "Free"}
          </Text>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => {
              Alert.alert("Added to cart", "Classroom added successfully!");
            }}
          >
            <Text style={styles.joinButtonText}>+ JOIN</Text>
          </TouchableOpacity>
        </View>
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

  // ClassRooms List
  classroomsListContainer: {
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

  // ClassRoom Card
  classroomCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 12,
    position: "relative",
  },

  trainingTypeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#8c76dd0a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 10,
  },

  trainingTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
  },

  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  favoriteIcon: {
    fontSize: 14,
  },

  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    marginHorizontal: 12,
    marginTop: 12,
  },

  classroomImage: {
    width: "100%",
    height: "100%",
  },

  classroomContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  dateRange: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8C76DD",
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  classroomName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    height: 32,
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

  trainerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: "uppercase",
  },

  trainerName: {
    fontSize: 11,
    fontWeight: "400",
    color: "#000",
    marginBottom: 8,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },

  ratingStars: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000",
  },

  ratingCount: {
    fontSize: 10,
    color: "#666",
  },

  provider: {
    fontSize: 11,
    color: "#000",
    fontWeight: "500",
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  priceJoinContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
  },

  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
  },

  joinButton: {
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  joinButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
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
