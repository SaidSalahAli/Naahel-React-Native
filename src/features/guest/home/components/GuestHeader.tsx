import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GuestHeader() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.logoBox}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>△</Text>
        </View>

        <View>
          <Text style={styles.logoText}>alrajhi bank</Text>
          <Text style={styles.logoSubText}>eLearning</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.langButton}>
          <Text style={styles.langText}>EN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 50,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: "#F4F4F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#2D2FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  logoText: {
    color: "#2323FF",
    fontSize: 12,
    fontWeight: "800",
  },
  logoSubText: {
    color: "#2323FF",
    fontSize: 10,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchButton: {
    backgroundColor: "#AAA4F5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  searchText: {
    color: "#14208A",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  langButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  langText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#14208A",
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#14208A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  loginText: {
    color: "#14208A",
    fontSize: 12,
    fontWeight: "700",
  },
});
