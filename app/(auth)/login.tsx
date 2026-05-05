import { useTenant } from "@/contexts/TenantContext";
import { logoLogin, moodleLogin } from "@/services";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const { currentTenant } = useTenant();

  const [logoData, setLogoData] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLoginInfo = async () => {
      if (!currentTenant?.id) return;

      try {
        setLoadingLogo(true);

        const response = await logoLogin(
          String(currentTenant.id),
          currentTenant.language || "en",
        );

        setLogoData(response);
      } catch (err) {
        console.log("Login logo error:", err);
      } finally {
        setLoadingLogo(false);
      }
    };

    loadLoginInfo();
  }, [currentTenant?.id, currentTenant?.language]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    if (!currentTenant?.id) {
      setError("Tenant not found");
      return;
    }

    try {
      setError("");
      setLoadingLogin(true);

      const response: any = await moodleLogin(
        username.trim(),
        password,
        String(currentTenant.id),
        currentTenant.language || "en",
      );

      console.log("Login response:", response);

      if (response?.error || response?.exception) {
        setError(response?.message || "Login failed");
        return;
      }

      router.replace("/(guest)");
    } catch (err: any) {
      console.log("Login error:", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoadingLogin(false);
    }
  };

  const logoUrl =
    logoData?.logo ||
    logoData?.tenant_logo ||
    currentTenant?.logo ||
    "https://via.placeholder.com/200x100";

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoBox}>
          {loadingLogo ? (
            <ActivityIndicator color="#123CFF" />
          ) : (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          )}
        </View>

        <Text style={styles.title}>Login</Text>

        <Text style={styles.subtitle}>
          Welcome back, please login to continue
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            style={styles.input}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.loginBtn, loadingLogin && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loadingLogin}
          >
            {loadingLogin ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          {!!logoData?.register_url && (
            <TouchableOpacity>
              <Text style={styles.registerText}>Don't have an account?</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 90,
    resizeMode: "contain",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
  },
  loginBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#123CFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  registerText: {
    textAlign: "center",
    color: "#123CFF",
    fontWeight: "800",
    marginTop: 18,
  },
});
