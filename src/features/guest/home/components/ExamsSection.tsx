import { useTenant } from "@/contexts/TenantContext";
import { getExams } from "@/services/homeApi";
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

interface Exam {
  id: string;
  name: string;
  logo?: string;
  rating?: { average: number; total_users: number };
  finalprice?: string | number;
  tenant?: { name: string };
  duration?: string;
  questions?: number;
  category?: Array<{ id: string; name: string }>;
}

interface Category {
  id: string;
  name: string;
}

export default function ExamsSection() {
  const { currentTenant } = useTenant();
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadExams = async () => {
      if (!currentTenant?.id) return;

      try {
        setLoading(true);

        const res: any = await getExams(
          String(currentTenant.id),
          currentTenant.language || "en",
          { maxResults: 5 },
        );

        setExams(res?.exams || res?.onlineexams || []);
        setCategories(res?.categories || []);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [currentTenant?.id]);

  const filtered = useMemo(() => {
    if (activeTab === 0) return exams;

    const cat = categories[activeTab - 1];
    if (!cat) return exams;

    return exams.filter((e) => e.category?.some((c) => c.id === cat.id));
  }, [exams, categories, activeTab]);

  const openExam = useCallback((exam: Exam) => {
    router.push({
      pathname: "/exams/[id]",
      params: { id: exam.id, exam: JSON.stringify(exam) },
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#123CFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Exams</Text>
          <Text style={styles.subtitle}>Test Your Knowledge</Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/exams")}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >

        {categories.slice(0, 4).map((c, i) => (
          <Chip
            key={c.id}
            title={c.name}
            active={activeTab === i + 1}
            onPress={() => setActiveTab(i + 1)}
          />
        ))}
      </ScrollView>

      {/* Cards */}
      <FlatList
        horizontal
        data={filtered}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ExamCard exam={item} onPress={() => openExam(item)} />
        )}
      />
    </View>
  );
}

/* ---------- Card ---------- */

function ExamCard({ exam, onPress }: { exam: Exam; onPress: () => void }) {
  const price =
    exam.finalprice && Number(exam.finalprice) > 0
      ? `${exam.finalprice}`
      : "Free";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: exam.logo || "https://via.placeholder.com/300" }}
          style={styles.image}
        />

        <View style={styles.overlay} />

        {exam.questions && (
          <View style={styles.qBadge}>
            <Text style={styles.qText}>{exam.questions}Q</Text>
          </View>
        )}

        {exam.duration && (
          <View style={styles.dBadge}>
            <Text style={styles.dText}>{exam.duration}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {exam.name}
        </Text>

        <Text style={styles.provider}>
          💼 {exam.tenant?.name || "Provider"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.rating}>⭐ {exam.rating?.average || 0}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>TAKE EXAM</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Chip ---------- */

function Chip({ title, active, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 20,
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    color: "#123CFF",
    fontWeight: "800",
  },

  viewAll: {
    color: "#123CFF",
    fontWeight: "900",
  },

  tabs: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },

  chip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
  },

  chipActive: {
    backgroundColor: "#123CFF",
  },

  chipText: {
    fontWeight: "800",
    color: "#111",
  },

  chipTextActive: {
    color: "#fff",
  },

  list: {
    paddingLeft: 20,
    gap: 16,
  },

  card: {
    width: 210,
    borderRadius: 22,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  imageBox: {
    height: 130,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  qBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "#111",
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  qText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  dBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#FFE66D",
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  dText: {
    fontSize: 11,
    fontWeight: "900",
  },

  body: {
    padding: 14,
  },

  name: {
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 6,
  },

  provider: {
    color: "#777",
    fontSize: 12,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  rating: {
    fontWeight: "800",
  },

  price: {
    fontWeight: "900",
  },

  btn: {
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },

  loading: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
