import { useTenant } from "@/contexts/TenantContext";
import { getAboutUs } from "@/services/pagesApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function AboutUsScreen() {
  const { currentTenant } = useTenant();

  const [aboutUs, setAboutUs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAboutUs = async () => {
      if (!currentTenant?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getAboutUs(
          String(currentTenant.id),
          currentTenant.language || "en",
        );

        setAboutUs(response);
      } catch (err: any) {
        console.log("About us error:", err);
        setError(err?.message || "Failed to load about us");
      } finally {
        setLoading(false);
      }
    };

    loadAboutUs();
  }, [currentTenant?.id, currentTenant?.language]);

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

  const data = aboutUs || {};
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const partners = data.partners?.images || [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Image
          source={{
            uri: data.image || "https://via.placeholder.com/900x500",
          }}
          style={styles.heroImage}
        />

        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{data.title || "About Us"}</Text>

          {!!data.description && (
            <Text style={styles.heroDescription}>
              {cleanText(data.description)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.sectionsWrapper}>
        {sections.length > 0 ? (
          sections.map((section: any, index: number) => (
            <View key={index} style={styles.sectionCard}>
              {section.image ? (
                <Image
                  source={{ uri: section.image }}
                  style={styles.sectionImage}
                />
              ) : (
                <View style={styles.noImageBox}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}

              <View style={styles.sectionBody}>
                <Text style={styles.sectionTitle}>
                  {section.title || `Section ${index + 1}`}
                </Text>

                <Text style={styles.sectionDescription}>
                  {cleanText(section.description)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No sections available</Text>
          </View>
        )}
      </View>

      <View style={styles.partnersWrapper}>
        <Text style={styles.partnersTitle}>
          {data.partners?.title || "Success Partners"}
        </Text>

        <View style={styles.titleLine} />

        {partners.length > 0 ? (
          <View style={styles.partnersGrid}>
            {partners.map((logoUrl: string, index: number) => (
              <View key={index} style={styles.partnerCard}>
                <Image source={{ uri: logoUrl }} style={styles.partnerLogo} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No partners available</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    paddingBottom: 50,
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
  hero: {
    height: 360,
    backgroundColor: "#111827",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 42,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 18,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  heroDescription: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionsWrapper: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 16,
  },
  sectionCard: {
    backgroundColor: "#F7F8FC",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
  },
  sectionImage: {
    width: "100%",
    height: 230,
  },
  noImageBox: {
    height: 230,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "#6B7280",
    fontWeight: "900",
  },
  sectionBody: {
    padding: 16,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 8,
  },
  sectionDescription: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "600",
  },
  partnersWrapper: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 18,
  },
  partnersTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  titleLine: {
    width: 70,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#123CFF",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  partnersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  partnerCard: {
    width: "47%",
    height: 110,
    borderRadius: 20,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  partnerLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  emptyBox: {
    backgroundColor: "#F7F8FC",
    borderRadius: 22,
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "800",
  },
});
