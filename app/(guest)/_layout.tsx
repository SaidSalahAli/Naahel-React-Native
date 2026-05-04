import { Tabs } from "expo-router";
import React from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function GuestLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="courses" options={{ title: "Courses" }} />
      <Tabs.Screen name="classrooms" options={{ title: "Classes" }} />
      <Tabs.Screen name="programs" options={{ title: "Programs" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />

      <Tabs.Screen name="about-us" options={{ href: null }} />
      <Tabs.Screen name="contact-us" options={{ href: null }} />
      <Tabs.Screen name="faqs" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="verify-certificate" options={{ href: null }} />
      <Tabs.Screen name="exams" options={{ href: null }} />
    </Tabs>
  );
}
