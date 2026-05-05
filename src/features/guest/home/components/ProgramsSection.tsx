import { useTenant } from "@/contexts/TenantContext";
import { getPrograms } from "@/services/homeApi";
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

interface Program {
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
  duration?: string;
  itemtype?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProgramsSection() {
  const { currentTenant } = useTenant();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load programs from API
  useEffect(() => {
    const loadPrograms = async () => {
      if (!currentTenant?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getPrograms(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 5 }
        );

        setPrograms(response?.programs || []);
        setCategories(response?.categories || []);
      } catch (err: any) {
        console.error("Error loading programs:", err);
        setError(err.message || "Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [currentTenant?.id]);

  // Filter programs based on active tab
  const filteredPrograms = useMemo(() => {
    if (activeTab === 0) {
      return programs;
    } else {
      const categoryIndex = activeTab - 1;
      const selectedCategory = categories[categoryIndex];

      if (!selectedCategory) return programs;

      return programs.filter((program) => {
        if (!program.category) return false;

        if (Array.isArray(program.category)) {
          return program.category.some(
            (cat) => cat && cat.id === selectedCategory.id
          );
        }

        const singleCat = program.category as any;
        return singleCat && singleCat.id === selectedCategory.id;
      });
    }
  }, [programs, categories, activeTab]);

  const handleProgramPress = useCallback((program: Program) => {
    router.push({
      pathname: "/programs/[id]",
      params: { id: program.id, program: JSON.stringify(program) },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#032E9B" />
        <Text style={styles.loadingText}>Loading programs...</Text>
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
        <Text style={styles.sectionTitle}>Programs</Text>
        <Text style={styles.sectionSubtitle}>Professional Development</Text>
        <Text style={styles.sectionDescription}>
          Advance your career with our comprehensive programs designed for
          professional growth and success.
        </Text>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {/* All Programs Tab */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => setActiveTab(0)}
        >
          <Text
            style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}
          >
            ALL PROGRAMS
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

      {/* Programs List */}
      {filteredPrograms.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredPrograms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onPress={() => handleProgramPress(item)}
            />
          )}
          contentContainerStyle={styles.programsListContainer}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No programs found for this category.
          </Text>
        </View>
      )}

      {/* Show All Button */}
      <TouchableOpacity
        style={styles.showAllButton}
        onPress={() => router.push("/programs")}
      >
        <Text style={styles.showAllButtonText}>Show All Programs →</Text>
      </TouchableOpacity>
    </View>
  );
}

interface ProgramCardProps {
  program: Program;
  onPress: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

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
    getLanguageName(program.language),
    ...(Array.isArray(program.category)
      ? program.category.map((cat) => cat.name)
      : []),
    ...(Array.isArray(program.level)
      ? program.level.map((level) =>
          typeof level === "string" ? level : level.name || ""
        )
      : []),
  ].filter(
    (tag): tag is string => Boolean(tag) && tag !== "unknown" && tag !== ""
  );

  return (
    <TouchableOpacity style={styles.programCard} onPress={onPress}>
      {/* Program Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: program.logo || "https://via.placeholder.com/180x120",
          }}
          style={styles.programImage}
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

      {/* Program Info */}
      <View style={styles.programContent}>
        {/* Tags */}
        <View style={styles.tagsContainer}>
          {tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Program Name */}
        <Text style={styles.programName} numberOfLines={2}>
          {program.name}
        </Text>

        {/* Provider */}
        <Text style={styles.provider}>
          💼 {program.tenant?.name || "Provider"}
        </Text>

        {/* Price and Rating */}
        <View style={styles.priceRatingContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {program.finalprice && program.finalprice !== "Free"
                ? `₪${program.finalprice}`
                : "Free"}
            </Text>
          </View>

          {program.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>
                ⭐ {program.rating.average}
              </Text>
              <Text style={styles.ratingCount}>
                ({program.rating.total_users})
              </Text>
            </View>
          )}
        </View>

        {/* Enroll Button */}
        <TouchableOpacity style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>📚 ENROLL NOW</Text>
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

  programsListContainer: {
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

  programCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 12,
  },

  imageContainer: {
    position: "relative",
    height: 120,
    backgroundColor: "#f0f0f0",
  },

  programImage: {
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

  programContent: {
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

  programName: {
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

  enrollButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
  },

  enrollButtonText: {
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
