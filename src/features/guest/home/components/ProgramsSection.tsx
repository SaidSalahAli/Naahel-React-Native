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

  useEffect(() => {
    const loadPrograms = async () => {
      if (!currentTenant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response: any = await getPrograms(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 5 },
        );

        setPrograms(Array.isArray(response?.programs) ? response.programs : []);
        setCategories(
          Array.isArray(response?.categories) ? response.categories : [],
        );
      } catch (err: any) {
        console.error("Error loading programs:", err);
        setError(err.message || "Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [currentTenant?.id, currentTenant?.language]);

  const filteredPrograms = useMemo(() => {
    if (activeTab === 0) return programs;

    const selectedCategory = categories[activeTab - 1];
    if (!selectedCategory) return programs;

    return programs.filter((program) => {
      if (!program.category) return false;

      if (Array.isArray(program.category)) {
        return program.category.some(
          (cat) => String(cat.id) === String(selectedCategory.id),
        );
      }

      const singleCat = program.category as any;
      return String(singleCat?.id) === String(selectedCategory.id);
    });
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
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Programs</Text>
          <Text style={styles.sectionSubtitle}>Professional Development</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/programs" as any)}
        >
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionDescription}>
        Advance your career with structured programs built for real growth.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >


        {categories.slice(0, 4).map((category, index) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={category.id}
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
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No programs found.</Text>
        </View>
      )}
    </View>
  );
}

interface ProgramCardProps {
  program: Program;
  onPress: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onPress }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const price =
    program.finalprice && Number(program.finalprice) > 0
      ? `₪${program.finalprice}`
      : "Free";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.programCard}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: program.logo || "https://via.placeholder.com/400x260",
          }}
          style={styles.programImage}
          resizeMode="cover"
        />

        <View style={styles.imageOverlay} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>PROGRAM</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favoriteButton}
          onPress={() => setIsFavorite((prev) => !prev)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? "♥" : "♡"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.programContent}>
        <Text style={styles.programName} numberOfLines={2}>
          {program.name}
        </Text>

        <Text style={styles.provider} numberOfLines={1}>
          💼 {program.tenant?.name || "Provider"}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.ratingText}>
            ⭐ {program.rating?.average || 0}
            <Text style={styles.ratingCount}>
              {" "}
              ({program.rating?.total_users || 0})
            </Text>
          </Text>

          <Text style={styles.price}>{price}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.enrollButton}
          onPress={onPress}
        >
          <Text style={styles.enrollButtonText}>ENROLL NOW</Text>
          <Text style={styles.enrollArrow}>→</Text>
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
    maxWidth: 120,
  },

  tabTextActive: {
    color: "#fff",
  },

  programsListContainer: {
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

  programCard: {
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

  programImage: {
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

  programContent: {
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 14,
  },

  programName: {
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

  enrollButton: {
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  enrollButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "900",
  },

  enrollArrow: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "900",
  },
});
