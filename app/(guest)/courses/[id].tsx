import { useTenant } from "@/contexts/TenantContext";
import { getCourseDetails } from "@/services/courseApi";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import CardInfo from "@/components/shared/CardInfo";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type TabKey = "overview" | "lessons" | "certificate";

export default function CourseDetailsScreen() {
  const { id, course } = useLocalSearchParams();
  const { currentTenant } = useTenant();

  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackCourse = useMemo(() => {
    try {
      return course ? JSON.parse(String(course)) : null;
    } catch {
      return null;
    }
  }, [course]);

  useEffect(() => {
    const loadDetails = async () => {
      if (!currentTenant?.id || !id) return;

      try {
        setLoading(true);
        setError(null);

        const response: any = await getCourseDetails(
          String(id),
          String(currentTenant.id),
          currentTenant.language || "en",
        );

        setCourseDetails(response?.course || response);
      } catch (err: any) {
        setError(err?.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [currentTenant?.id, currentTenant?.language, id]);

  const data = courseDetails || fallbackCourse;

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#123CFF" />
        <Text style={styles.loadingText}>Loading course details...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No course data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <Image
            source={{
              uri:
                data.logo ||
                data.image ||
                "https://via.placeholder.com/600x400",
            }}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay} />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heartBtn}>
            <Text style={styles.heartText}>♡</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>COURSE</Text>
          </View>

          <Text style={styles.title}>{data.name}</Text>

          <Text style={styles.provider}>
            💼 {data.tenant?.name || "AlRajhi Bank"}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Rating</Text>
              <Text style={styles.metaValue}>
                ⭐ {data.rating?.average || 0}
                <Text style={styles.muted}>
                  {" "}
                  ({data.rating?.total_users || 0})
                </Text>
              </Text>
            </View>

            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Price</Text>
              <Text style={styles.price}>
                {data.finalprice && Number(data.finalprice) > 0
                  ? `${data.finalprice}`
                  : "Free"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.enrollBtn}>
            <Text style={styles.enrollText}>ENROLL NOW</Text>
            
            <Text style={styles.enrollArrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.tabs}>
            <TabButton
              title="Overview"
              active={activeTab === "overview"}
              onPress={() => setActiveTab("overview")}
            />
            <TabButton
              title="Lessons"
              active={activeTab === "lessons"}
              onPress={() => setActiveTab("lessons")}
            />
            <TabButton
              title="Certificate"
              active={activeTab === "certificate"}
              onPress={() => setActiveTab("certificate")}
            />
          </View>

          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "lessons" && <LessonsTab data={data} />}
          {activeTab === "certificate" && <CertificateTab data={data} />}
        </View>
        <CardInfo data={data} />

      </ScrollView>
    </View>
  );
}

function TabButton({
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
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function OverviewTab({ data }: { data: any }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.blockTitle}>About this course</Text>
      <Text style={styles.description}>
        {cleanText(data.summary || data.description) ||
          "No overview available for this course."}
      </Text>
    </View>
  );
}

function LessonsTab({ data }: { data: any }) {
  const sections = data?.content || [];

  if (!sections.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No lessons available</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.blockTitle}>Lessons and Activities</Text>

      {sections.map((section: any, sectionIndex: number) => (
        <View
          key={section.sectionid || sectionIndex}
          style={styles.lessonSection}
        >
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonTitle}>
              {extractText(section.sectionname) ||
                `Section ${sectionIndex + 1}`}
            </Text>
            <Text style={styles.lessonCount}>
              {section.modules?.length || 0} items
            </Text>
          </View>

          {(section.modules || []).map((module: any, index: number) => (
            <View key={module.id || index} style={styles.moduleItem}>
              <View style={styles.moduleIcon}>
                <Text style={styles.moduleIconText}>
                  {getModuleIcon(module)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.moduleName} numberOfLines={2}>
                  {extractText(module.name) || `Content ${index + 1}`}
                </Text>
                <Text style={styles.moduleType}>
                  {module.type || "activity"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function CertificateTab({ data }: { data: any }) {
  const criteria = data?.completion_criteria || [];

  return (
    <View style={styles.tabContent}>
      <Text style={styles.blockTitle}>How to Earn Your Certificate</Text>
      <Text style={styles.description}>
        Complete the following requirements to earn your certificate.
      </Text>

      {criteria.length ? (
        criteria.map((item: any, index: number) => (
          <View key={item.moduleid || index} style={styles.requirementItem}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>✓</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.requirementTitle}>
                {extractText(item.modulename) || `Requirement ${index + 1}`}
              </Text>
              <Text style={styles.requirementDesc}>
                {getRequirementAction(item)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No certificate requirements available.
          </Text>
        </View>
      )}
    </View>
  );
}

function extractText(text?: string) {
  if (!text) return "";
  const match = text.match(/\{mlang en\}(.*?)\{mlang\}/);
  return cleanText(match ? match[1] : text);
}

function cleanText(text?: string) {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getModuleIcon(module: any) {
  const type = module?.type || "";
  const file = module?.files?.[0];
  const mimetype = file?.mimetype || "";

  if (type === "forum") return "💬";
  if (mimetype.includes("video")) return "▶";
  if (mimetype.includes("audio")) return "♫";
  if (mimetype.includes("image")) return "▧";
  if (mimetype.includes("pdf")) return "▤";
  return "📄";
}

function getRequirementAction(item: any) {
  const name = String(item?.modulename || "").toLowerCase();
  const desc = String(item?.description || "").toLowerCase();

  if (name.includes("quiz") || name.includes("exam"))
    return "Minimum passing grade required";
  if (desc.includes("video") || name.includes("video"))
    return "Watch the full video";
  if (desc.includes("submit")) return "Submit and receive passing grade";

  return "Complete activity";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  content: {
    paddingBottom: 140,
  },

  center: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontWeight: "700",
  },

  errorText: {
    color: "#EF4444",
    fontWeight: "800",
    textAlign: "center",
  },

  hero: {
    height: 310,
    backgroundColor: "#111827",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  backBtn: {
    position: "absolute",
    top: 54,
    left: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 34,
    color: "#111827",
    marginTop: -4,
  },

  heartBtn: {
    position: "absolute",
    top: 54,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  heartText: {
    fontSize: 26,
    color: "#111827",
  },

  card: {
    marginTop: -34,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8EAFF",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    marginBottom: 14,
  },

  badgeText: {
    color: "#123CFF",
    fontSize: 11,
    fontWeight: "900",
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  provider: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 18,
  },

  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  metaBox: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    borderRadius: 20,
    padding: 14,
  },

  metaLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 6,
  },

  metaValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  muted: {
    color: "#6B7280",
    fontWeight: "600",
  },

  price: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },

  enrollBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#123CFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 22,
  },

  enrollText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },

  enrollArrow: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    padding: 4,
    marginBottom: 20,
  },

  tabBtn: {
    flex: 1,
    height: 42,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  tabBtnActive: {
    backgroundColor: "#111827",
  },

  tabText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "900",
  },

  tabTextActive: {
    color: "#fff",
  },

  tabContent: {
    paddingTop: 4,
  },

  blockTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  description: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },

  lessonSection: {
    backgroundColor: "#F7F8FC",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },

  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  lessonTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  lessonCount: {
    color: "#123CFF",
    fontSize: 12,
    fontWeight: "900",
  },

  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },

  moduleIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#E8EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  moduleIconText: {
    fontSize: 17,
  },

  moduleName: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
  },

  moduleType: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
  },

  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },

  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  checkText: {
    color: "#16A34A",
    fontSize: 16,
    fontWeight: "900",
  },

  requirementTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  requirementDesc: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyBox: {
    backgroundColor: "#F7F8FC",
    borderRadius: 22,
    paddingVertical: 34,
    alignItems: "center",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
});
