import { useTenant } from "@/contexts/TenantContext";
import { getProgramDetails } from "@/services/programApi";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

export default function ProgramDetailsScreen() {
  const { id, program } = useLocalSearchParams();
  const { currentTenant } = useTenant();

  const [programDetails, setProgramDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);

  const fallbackProgram = useMemo(() => {
    try {
      return program ? JSON.parse(String(program)) : null;
    } catch {
      return null;
    }
  }, [program]);

  useEffect(() => {
    const loadDetails = async () => {
      if (!currentTenant?.id || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response: any = await getProgramDetails(
          String(id),
          String(currentTenant.id),
          currentTenant.language || "en",
        );

        setProgramDetails(response?.program ?? response);
      } catch (error) {
        console.log("Program details error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [currentTenant?.id, currentTenant?.language, id]);

  const data = programDetails || fallbackProgram;

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#123CFF" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No program data found</Text>
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
              uri: data.logo || "https://via.placeholder.com/600x400",
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
            <Text style={styles.badgeText}>PROGRAM</Text>
          </View>

          <Text style={styles.title}>{data.name || "Program Details"}</Text>

          <Text style={styles.provider}>
            💼 {data.tenant?.name || "No tenant"}
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
          {activeTab === "lessons" && <ProgramLessonsTab data={data} />}
          {activeTab === "certificate" && <ProgramCertificateTab data={data} />}
        </View>
        <CardInfo data={data} />
      </ScrollView>
    </View>
  );
}

function TabButton({ title, active, onPress }: any) {
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
      <Text style={styles.blockTitle}>About this program</Text>

      <Text style={styles.description}>
        {cleanText(data.summary || data.description) ||
          "No overview available for this program."}
      </Text>

      <InfoRow label="Level" value={data.level?.name} />
      <InfoRow label="Skill" value={data.skill?.name} />
      <InfoRow
        label="Business Unit"
        value={data.targetaudience?.businessunit}
      />
      <InfoRow label="Department" value={data.targetaudience?.department} />
      <InfoRow
        label="Sub Department"
        value={data.targetaudience?.subdepartment}
      />
      <InfoRow label="Trainees" value={String(data.trainees ?? 0)} />
      <InfoRow label="Points" value={String(data.points ?? 0)} />
      <InfoRow label="Groups" value={(data.groups || []).join(", ")} />
      <InfoRow label="Roles" value={(data.roles || []).join(", ")} />
      <InfoRow label="Certificate" value={data.certificate ? "Yes" : "No"} />
      <InfoRow
        label="Approval Required"
        value={data.approval_required ? "Yes" : "No"}
      />

      {Array.isArray(data.trainers) && data.trainers.length > 0 && (
        <>
          <Text style={styles.subBlockTitle}>Trainers</Text>

          {data.trainers.map((trainer: any, index: number) => (
            <InfoRow
              key={trainer.id || index}
              label={`Trainer ${index + 1}`}
              value={trainer.name || trainer.fullname || "Unnamed Trainer"}
            />
          ))}
        </>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ProgramLessonsTab({ data }: { data: any }) {
  const levels = data?.content || [];

  if (!levels.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No levels available</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.blockTitle}>Lessons and Activities</Text>

      {levels.map((level: any, levelIndex: number) => (
        <View key={level.id || levelIndex} style={styles.lessonSection}>
          <View style={styles.lessonHeader}>
            <View style={styles.levelNumber}>
              <Text style={styles.levelNumberText}>{levelIndex + 1}</Text>
            </View>

            <Text style={styles.lessonTitle}>
              {level.name || `Level ${levelIndex + 1}`}
            </Text>

            <Text style={styles.lessonCount}>
              {level.num_of_courses || level.courses?.length || 0} Courses
            </Text>
          </View>

          {(level.courses || []).map((course: any, courseIndex: number) => (
            <TouchableOpacity
              key={course.id || courseIndex}
              activeOpacity={0.85}
              style={styles.moduleItem}
            >
              <View style={styles.moduleIcon}>
                <Text style={styles.moduleIconText}>▣</Text>
              </View>

              <Text style={styles.moduleName} numberOfLines={2}>
                {course.coursename || course.name || "Untitled Course"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

function ProgramCertificateTab({ data }: { data: any }) {
  const levels = data?.certificate_requirments?.levels || data?.levels || [];
  const requirementType = data?.certificate_requirments?.type || "ALL";

  return (
    <View style={styles.tabContent}>
      <Text style={styles.blockTitle}>How to Earn Your Certificate</Text>

      <Text style={styles.description}>
        Complete the following requirements to earn your certificate.
      </Text>

      {levels.length ? (
        levels.map((level: any, index: number) => (
          <View key={level.id || index} style={styles.requirementItem}>
            <View style={styles.levelNumber}>
              <Text style={styles.levelNumberText}>{index + 1}</Text>
            </View>

            <Text style={styles.requirementTitle}>
              {level.name || `Level ${index + 1}`}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No certificate requirements available.
          </Text>
        </View>
      )}

      <Text style={styles.requirementType}>
        Certificate requirement:{" "}
        {requirementType === "ALL"
          ? "all levels"
          : `${String(requirementType).toLowerCase()} levels`}
      </Text>
    </View>
  );
}

function cleanText(text?: string) {
  if (!text) return "";

  return String(text)
    .replace(/<span[^>]*multilang-begin[^>]*>.*?<\/span>/g, "")
    .replace(/<span[^>]*multilang-end[^>]*>.*?<\/span>/g, "")
    .replace(/\{mlang\s+\w+\}/g, "")
    .replace(/\{mlang\}/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  },
  errorText: {
    color: "#EF4444",
    fontWeight: "900",
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
  subBlockTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginTop: 12,
    marginBottom: 10,
  },
  description: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoRow: {
    backgroundColor: "#F7F8FC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 5,
  },
  infoValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  lessonSection: {
    backgroundColor: "#F7F8FC",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  levelNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#123CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  levelNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
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
    color: "#123CFF",
    fontSize: 17,
    fontWeight: "900",
  },
  moduleName: {
    flex: 1,
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FC",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  requirementTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },
  requirementType: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
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
