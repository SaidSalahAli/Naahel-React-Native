/**
 * Courses List Screen Example
 * Demonstrates how to fetch and display courses
 */

import { useAuth } from "@/contexts/AuthContext";
import { useConfig } from "@/contexts/ConfigContext";
import { getAvailableCourses } from "@/services/courseApi";
import { Course } from "@/types";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CoursesScreen() {
  const { user } = useAuth();
  const { i18n } = useConfig();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [user?.tenantid, i18n]);

  const fetchCourses = async () => {
    if (!user?.tenantid) {
      setError("Tenant ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableCourses(user.tenantid, i18n);
      setCourses(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <View style={styles.courseFooter}>
        <Text style={styles.courseLevel}>{item.level}</Text>
        <Text style={styles.courseDuration}>{item.duration} hours</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCourses}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Courses</Text>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No courses available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  courseLevel: {
    fontSize: 12,
    backgroundColor: "#007AFF",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  courseDuration: {
    fontSize: 12,
    color: "#666",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
