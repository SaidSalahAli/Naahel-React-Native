import { useTenant } from "@/contexts/TenantContext";
import { getFaqs } from "@/services/pagesApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FaqsScreen() {
  const { currentTenant } = useTenant();

  const [faqs, setFaqs] = useState<any[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFaqs = async () => {
      if (!currentTenant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response: any = await getFaqs(
          String(currentTenant.id),
          currentTenant.language || "en",
        );

        setFaqs(Array.isArray(response) ? response : []);
      } catch (err: any) {
        console.log("FAQs error:", err);
        setError(err?.message || "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, [currentTenant?.id, currentTenant?.language]);

  useEffect(() => {
    setExpandedIndexes([]);
  }, [activeCategoryIndex]);

  const selectedCategory = faqs[activeCategoryIndex];
  const selectedFaqs = selectedCategory?.faqs || [];

  const toggleQuestion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const expandAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndexes(selectedFaqs.map((_: any, index: number) => index));
  };

  const collapseAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndexes([]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#123CFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>FREQUENTLY ASKED QUESTIONS</Text>

        {faqs.length > 0 ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {faqs.map((category: any, index: number) => {
                const active = activeCategoryIndex === index;

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.85}
                    style={[styles.tabBtn, active && styles.tabBtnActive]}
                    onPress={() => setActiveCategoryIndex(index)}
                  >
                    <Text
                      style={[styles.tabText, active && styles.tabTextActive]}
                    >
                      {category.faq_section || `Section ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={expandAll}>
                <Text style={styles.actionText}>+ Expand all</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={collapseAll}>
                <Text style={styles.actionText}>- Collapse all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.accordionBox}>
              {selectedFaqs.length > 0 ? (
                selectedFaqs.map((item: any, index: number) => {
                  const expanded = expandedIndexes.includes(index);

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.9}
                      onPress={() => toggleQuestion(index)}
                      style={[
                        styles.questionItem,
                        index === selectedFaqs.length - 1 &&
                          styles.lastQuestionItem,
                      ]}
                    >
                      <View style={styles.questionHeader}>
                        <View style={styles.numberCircle}>
                          <Text style={styles.numberText}>{index + 1}</Text>
                        </View>

                        <Text style={styles.questionText}>
                          {item.faq_question || `Question ${index + 1}`}
                        </Text>

                        <Text style={styles.arrowText}>
                          {expanded ? "⌃" : "⌄"}
                        </Text>
                      </View>

                      {expanded && (
                        <View style={styles.answerBox}>
                          <Text style={styles.answerText}>
                            {item.faq_answer || "No answer available."}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No questions available.</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No FAQs found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "900",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
  },
  title: {
    color: "#111827",
    fontSize: 25,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 26,
  },
  tabs: {
    gap: 10,
    paddingBottom: 14,
  },
  tabBtn: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: "#111827",
  },
  tabText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#fff",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 18,
    marginBottom: 16,
  },
  actionText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  accordionBox: {
    borderWidth: 1,
    borderColor: "#D3CCCC",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  questionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  lastQuestionItem: {
    borderBottomWidth: 0,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F9FAFB",
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#8C76DD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numberText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  questionText: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "900",
  },
  arrowText: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 8,
  },
  answerBox: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingLeft: 62,
    paddingRight: 16,
    backgroundColor: "#fff",
  },
  answerText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "600",
  },
  emptyBox: {
    backgroundColor: "#F7F8FC",
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
});
