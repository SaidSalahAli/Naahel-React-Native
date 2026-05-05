import { useTenant } from "@/contexts/TenantContext";
import { sendMessage } from "@/services/pagesApi";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ContactUsScreen() {
  const { currentTenant } = useTenant();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Invalid email address";
    if (phone.trim().length < 3) return "Phone must be valid";
    if (!subject.trim()) return "Subject is required";
    if (message.trim().length < 10)
      return "Message must be at least 10 characters";

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setSubmitStatus("error");
      setErrorMessage(validationError);
      return;
    }

    if (!currentTenant?.id) {
      setSubmitStatus("error");
      setErrorMessage("Tenant information is missing");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitStatus(null);
      setErrorMessage("");

      await sendMessage({
        tenantid: String(currentTenant.id),
        lang: currentTenant.language || "en",
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubmitStatus("success");

      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.log("Contact us error:", err);
      setSubmitStatus("error");
      setErrorMessage(
        err?.message || "Failed to send message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <View style={styles.card}>
          <Text style={styles.overline}>CONTACT US</Text>
          <Text style={styles.title}>Let's Communicate</Text>
          <Text style={styles.subtitle}>We Value Your Thoughts</Text>

          {submitStatus === "success" && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Thank you for your message! We will get back to you soon.
              </Text>
            </View>
          )}

          {submitStatus === "error" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <AppInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <AppInput
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
          />

          <AppInput
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            inputStyle={styles.messageInput}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitBtn, submitting && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AppInput({
  placeholder,
  value,
  onChangeText,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  inputStyle,
}: any) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholderTextColor="#404040"
      style={[styles.input, inputStyle]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 22,
  },
  overline: {
    fontSize: 12,
    letterSpacing: 2,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1E293B",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
    marginBottom: 22,
  },
  input: {
    minHeight: 54,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  messageInput: {
    height: 140,
    textAlignVertical: "top",
  },
  submitBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "800",
  },
});
