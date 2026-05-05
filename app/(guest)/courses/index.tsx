import { useTenant } from "@/contexts/TenantContext";
import { getAllFilter } from "@/services/filterApi";
import { getCourses } from "@/services/homeApi";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Course {
  id: string | number;
  name: string;
  logo?: string;
  rating?: {
    average: number;
    total_users: number;
  };
  finalprice?: string | number;
  tenant?: { name: string };
  category?: any;
  level?: any;
  language?: string;
}

const PER_PAGE = 6;

export default function CoursesPage() {
  const { currentTenant } = useTenant();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const searchTimer = useRef<any>(null);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / PER_PAGE));
  }, [totalCount]);

  const loadCourses = async (
    filters: any = {},
    search: string = "",
    pageNumber: number = 1,
  ) => {
    if (!currentTenant?.id) return;

    try {
      setLoading(true);
      setCurrentFilters(filters);

      const response: any = await getCourses(
        String(currentTenant.id),
        currentTenant.language || "en",
        {
          ...filters,
          search: search || undefined,
          page: pageNumber,
          perpage: PER_PAGE,
        },
      );

      const data = response?.courses || [];
      const total = response?.totalcount || response?.total || data.length;

      setCourses(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setPage(pageNumber);
    } catch (error) {
      console.log("Courses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    if (!currentTenant?.id) return;

    try {
      const response = await getAllFilter(
        String(currentTenant.id),
        currentTenant.language || "en",
        "courses",
      );

      setFilterOptions(response);
    } catch (error) {
      console.log("Filter error:", error);
    }
  };

  useEffect(() => {
    loadCourses({}, "", 1);
    loadFilters();

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [currentTenant?.id, currentTenant?.language]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(() => {
      loadCourses(currentFilters, value, 1);
    }, 700);
  };

  const handleApplyFilter = (filters: any) => {
    setFilterVisible(false);
    loadCourses(filters, searchTerm, 1);
  };

  const handleResetFilter = () => {
    setSearchTerm("");
    setCurrentFilters({});
    setFilterVisible(false);
    loadCourses({}, "", 1);
  };

  const openCourse = (course: Course) => {
    router.push({
      pathname: "/courses/[id]",
      params: {
        id: String(course.id),
        course: JSON.stringify(course),
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Text style={styles.heroSmall}>Explore Learning</Text>
          <Text style={styles.heroTitle}>All Courses</Text>
          <Text style={styles.heroDesc}>
            Find the right course using search and smart filters.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={searchTerm}
              onChangeText={handleSearch}
              placeholder="Search courses..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
          >
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Courses</Text>
          <Text style={styles.resultCount}>{totalCount} results</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#123CFF" />
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={courses}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <CourseCard course={item} onPress={() => openCourse(item)} />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No courses found</Text>
              </View>
            }
          />
        )}

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={page <= 1}
              style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              onPress={() => loadCourses(currentFilters, searchTerm, page - 1)}
            >
              <Text style={styles.pageBtnText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.pageText}>
              {page} / {totalPages}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={page >= totalPages}
              style={[
                styles.pageBtn,
                page >= totalPages && styles.pageBtnDisabled,
              ]}
              onPress={() => loadCourses(currentFilters, searchTerm, page + 1)}
            >
              <Text style={styles.pageBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <FilterSheet
        visible={filterVisible}
        options={filterOptions}
        itemsNumber={totalCount}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />
    </View>
  );
}

function CourseCard({
  course,
  onPress,
}: {
  course: Course;
  onPress: () => void;
}) {
  const price =
    course.finalprice && Number(course.finalprice) > 0
      ? `${course.finalprice}`
      : "Free";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: course.logo || "https://via.placeholder.com/300" }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>COURSE</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.courseName} numberOfLines={2}>
          {course.name}
        </Text>

        <Text style={styles.provider} numberOfLines={1}>
          💼 {course.tenant?.name || "Provider"}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.rating}>⭐ {course.rating?.average || 0}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FilterSheet({
  visible,
  options,
  itemsNumber,
  onClose,
  onApply,
  onReset,
}: {
  visible: boolean;
  options: any;
  itemsNumber: number;
  onClose: () => void;
  onApply: (filters: any) => void;
  onReset: () => void;
}) {
  const [cost, setCost] = useState<any[]>([]);
  const [trainingtype, setTrainingtype] = useState<any[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [language, setLanguage] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  const [level, setLevel] = useState<any>(null);
  const [skill, setSkill] = useState<any>(null);

  const apply = () => {
    onApply({
      cost: cost.length ? cost : undefined,
      trainingtype: trainingtype.length ? trainingtype : undefined,
      rating: rating || undefined,
      provider: provider ? [provider] : undefined,
      language: language ? [language] : undefined,
      categories: categories ? [categories] : undefined,
      level: level ? [level] : undefined,
      skill: skill ? [skill] : undefined,
    });
  };

  const reset = () => {
    setCost([]);
    setTrainingtype([]);
    setRating(null);
    setProvider(null);
    setLanguage(null);
    setCategories(null);
    setLevel(null);
    setSkill(null);
    onReset();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          {!options ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#123CFF" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <FilterGroup title="Cost">
                {(options.cost || []).map((item: any) => (
                  <OptionChip
                    key={String(item.id)}
                    title={getName(item)}
                    active={cost.includes(item.id)}
                    onPress={() => setCost([item.id])}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Provider">
                {(options.providers || []).map((item: any) => (
                  <OptionChip
                    key={String(item.id)}
                    title={getName(item)}
                    active={provider === item.id}
                    onPress={() =>
                      setProvider(provider === item.id ? null : item.id)
                    }
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Categories">
                {(options.categories || []).map((item: any) => (
                  <OptionChip
                    key={String(item.id)}
                    title={getName(item)}
                    active={categories === item.id}
                    onPress={() =>
                      setCategories(categories === item.id ? null : item.id)
                    }
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Language">
                {(options.languages || []).map((item: any) => (
                  <OptionChip
                    key={String(item.code)}
                    title={item.name}
                    active={language === item.code}
                    onPress={() =>
                      setLanguage(language === item.code ? null : item.code)
                    }
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Level">
                {(options.levels || []).map((item: any) => (
                  <OptionChip
                    key={String(item.id)}
                    title={getName(item)}
                    active={level === item.id}
                    onPress={() => setLevel(level === item.id ? null : item.id)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Skill">
                {(options.skills || []).map((item: any) => (
                  <OptionChip
                    key={String(item.id)}
                    title={getName(item)}
                    active={skill === item.id}
                    onPress={() => setSkill(skill === item.id ? null : item.id)}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Training Type">
                {(options.trainingtype || [])
                  .filter((item: any) => item.name !== "unknown")
                  .map((item: any) => (
                    <OptionChip
                      key={String(item.id)}
                      title={item.name}
                      active={trainingtype.includes(item.id)}
                      onPress={() => {
                        setTrainingtype((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((x) => x !== item.id)
                            : [...prev, item.id],
                        );
                      }}
                    />
                  ))}
              </FilterGroup>

              <FilterGroup title="Rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <OptionChip
                    key={value}
                    title={`${value} ⭐`}
                    active={rating === value}
                    onPress={() => setRating(rating === value ? null : value)}
                  />
                ))}
              </FilterGroup>
            </ScrollView>
          )}

          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetText}>RESET</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={apply}>
              <Text style={styles.applyText}>APPLY</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetResults}>{itemsNumber} Search Results</Text>
        </View>
      </View>
    </Modal>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.optionsWrap}>{children}</View>
    </View>
  );
}

function OptionChip({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.optionChip, active && styles.optionChipActive]}
      onPress={onPress}
    >
      <Text
        numberOfLines={1}
        style={[styles.optionText, active && styles.optionTextActive]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function getName(item: any) {
  return item?.name_en || item?.name || item?.name_ar || "Option";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    paddingTop: 18,
    paddingBottom: 150,
  },

  hero: {
    marginHorizontal: 16,
    borderRadius: 28,
    backgroundColor: "#123CFF",
    padding: 24,
    marginBottom: 18,
  },

  heroSmall: {
    color: "#FFE66D",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8,
  },

  heroDesc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  searchRow: {
    marginHorizontal: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  searchBox: {
    flex: 1,
    height: 56,
    borderRadius: 22,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  searchIcon: {
    fontSize: 22,
    color: "#111827",
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },

  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 22,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  filterIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  resultHeader: {
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },

  resultCount: {
    color: "#123CFF",
    fontSize: 13,
    fontWeight: "900",
  },

  loading: {
    paddingVertical: 40,
    alignItems: "center",
  },

  grid: {
    paddingHorizontal: 16,
  },

  column: {
    gap: 12,
    marginBottom: 14,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  imageBox: {
    height: 118,
    backgroundColor: "#EEF1FF",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  badge: {
    position: "absolute",
    left: 10,
    bottom: -12,
    backgroundColor: "#E8EAFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    color: "#123CFF",
    fontSize: 10,
    fontWeight: "900",
  },

  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 22,
    paddingBottom: 12,
  },

  courseName: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    minHeight: 40,
    marginBottom: 8,
  },

  provider: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rating: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "900",
  },

  price: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
  },

  empty: {
    paddingVertical: 50,
    alignItems: "center",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "800",
  },

  pagination: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },

  pageBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  pageBtnDisabled: {
    opacity: 0.35,
  },

  pageBtnText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: -3,
  },

  pageText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  sheet: {
    maxHeight: "86%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
  },

  sheetTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },

  close: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "700",
  },

  filterGroup: {
    marginBottom: 18,
  },

  filterTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionChip: {
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 170,
  },

  optionChipActive: {
    backgroundColor: "#123CFF",
  },

  optionText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
  },

  optionTextActive: {
    color: "#fff",
  },

  sheetFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
  },

  resetBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  resetText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
  },

  applyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  applyText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },

  sheetResults: {
    marginTop: 10,
    textAlign: "right",
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
});
