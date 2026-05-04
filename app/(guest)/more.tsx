import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function MoreScreen() {
  return (
    <View style={{ padding: 20, gap: 16 }}>
      <TouchableOpacity onPress={() => router.push("/about-us")}>
        <Text>About Us</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/contact-us")}>
        <Text>Contact Us</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/faqs")}>
        <Text>FAQs</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/verify-certificate")}>
        <Text>Verify Certificate</Text>
      </TouchableOpacity>
    </View>
  );
}
