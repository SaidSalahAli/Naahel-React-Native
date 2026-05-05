import { ConfigContext } from "@/contexts/ConfigContext";
import { useTenant } from "@/contexts/TenantContext";
import { TenantHeaderInfo } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HeaderButtonProps {
  label: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
}

interface MenuItemProps {
  label: string;
  onPress: () => void;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
}) => (
  <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
    <Text style={[styles.actionButtonText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

const MenuItem: React.FC<MenuItemProps> = ({ label, onPress }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.menuItemText}>{label}</Text>
  </TouchableOpacity>
);

export default function TenantHeader() {
  const { currentTenant, tenantHeaderInfo, isLoading } = useTenant();
  const config = useContext(ConfigContext);

  const [headerInfo, setHeaderInfo] = useState<TenantHeaderInfo | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Get i18n from config context
  const i18n = config?.i18n || "en";

  // Set header info from context
  useEffect(() => {
    if (tenantHeaderInfo) {
      setHeaderInfo(tenantHeaderInfo);
    }
  }, [tenantHeaderInfo]);

  const colors = {
    primary:
      currentTenant?.primarycolor || currentTenant?.primaryColor || "#fffff",
    secondary:
      currentTenant?.secondarycolor ||
      currentTenant?.secondaryColor ||
      "#AAA4F5",
    tertiary:
      currentTenant?.territoreycolor ||
      currentTenant?.teritoryColor ||
      "#FF8A19",
  };

  const handleLanguageChange = useCallback(
    async (lang: string) => {
      try {
        if (config?.setLanguage) {
          config.setLanguage(lang);
        }
        await AsyncStorage.setItem("language", lang);
        setShowLanguageMenu(false);
      } catch (error) {
        console.error("Language change error:", error);
      }
    },
    [config],
  );

  const handleMenuNavigation = (href: string) => {
    setShowMobileMenu(false);
    if (href.startsWith("http")) {
      // External link - open in browser
      console.log("Opening external link:", href);
    } else {
      router.push(href as any);
    }
  };

  const handleSearch = () => {
    setShowMobileMenu(false);
    router.push("/search" as any);
  };

  const handleLogin = () => {
    setShowMobileMenu(false);
    router.push("/login" as any);
  };

  // Menu items based on tenant header info
  const getMenuItems = (): Array<{ label: string; href: string }> => {
    const items: Array<{ label: string; href: string }> = [
      { label: "Home", href: "/" },
    ];

    // Check for about us
    if (headerInfo?.aboutus?.[0]?.status === "1") {
      items.push({
        label: "About Us",
        href: headerInfo.aboutus[0].link || "/about-us",
      });
    }

    // Check for contact us
    if (headerInfo?.contactus) {
      items.push({
        label: "Contact Us",
        href: headerInfo.contactus,
      });
    }

    // Check for FAQ
    if (headerInfo?.faq?.[0]?.status === "1") {
      items.push({
        label: "FAQs",
        href: headerInfo.faq[0].link || "/faqs",
      });
    }

    return items;
  };

  // Get services for display and navigation
  const getServices = () => {
    if (!headerInfo?.services || headerInfo.services.length === 0) {
      return [];
    }

    // Map service IDs to routes
    const serviceRoutes: { [key: string]: string } = {
      local_classroom: "/classrooms",
      local_courses: "/courses",
      local_learningplan: "/learning-paths",
      local_onlineexams: "/exams",
      local_program: "/programs",
    };

    return headerInfo.services.map((service: any) => ({
      name: service.name || service.title || "Service",
      link: serviceRoutes[service.id] || "/services",
      id: service.id,
    }));
  };

  if (isLoading) {
    return (
      <View style={[styles.wrapper, { opacity: 0.5 }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const menuItems = getMenuItems();
  const currentLanguage = i18n === "ar" ? "العربية" : "English";
  const otherLanguage = i18n === "ar" ? "English" : "العربية";
  const otherLanguageCode = i18n === "ar" ? "en" : "ar";

  return (
    <>
      {/* Main Header */}
      <View
        style={[
          styles.wrapper,
          {
            borderColor: colors.primary,
            backgroundColor: "ffff",
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoBox}>
          {currentTenant?.logo || headerInfo?.logo ? (
            <Image
              source={{ uri: currentTenant?.logo || headerInfo?.logo }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[styles.logoIcon, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.logoIconText}>△</Text>
            </View>
          )}
        </View>

        {/* Desktop Navigation - Hidden on mobile for now */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.desktopNav}
          scrollEnabled={false}
        >
          {menuItems.slice(0, 2).map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleMenuNavigation(item.href)}
              activeOpacity={0.7}
            >
              <Text style={[styles.navItemText, { color: colors.primary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Search Button */}
          <HeaderButton
            label="🔍"
            onPress={handleSearch}
            style={[styles.searchButton, { backgroundColor: colors.secondary }]}
          />

          {/* Language Button */}
          <View style={styles.languageDropdown}>
            <HeaderButton
              label={i18n.toUpperCase()}
              onPress={() => setShowLanguageMenu(!showLanguageMenu)}
              style={[styles.langButton, { backgroundColor: "#fff" }]}
              textStyle={{ color: colors.primary }}
            />

            {showLanguageMenu && (
              <View
                style={[styles.languageMenu, { borderColor: colors.primary }]}
              >
                <TouchableOpacity
                  style={styles.langOption}
                  onPress={() => handleLanguageChange(otherLanguageCode)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.langOptionText, { color: colors.primary }]}
                  >
                    {otherLanguage}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Login Button */}
          <HeaderButton
            label="Login"
            onPress={handleLogin}
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            textStyle={{ color: "#fff" }}
          />

          {/* Menu Button for Mobile */}
          <HeaderButton
            label="☰"
            onPress={() => setShowMobileMenu(!showMobileMenu)}
            style={styles.menuButton}
            textStyle={{ color: colors.primary, fontSize: 18 }}
          />
        </View>
      </View>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <View
          style={[
            styles.mobileMenu,
            { backgroundColor: colors.primary + "10" },
          ]}
        >
          <View
            style={[
              styles.mobileMenuContent,
              { borderLeftColor: colors.primary },
            ]}
          >
            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                label={item.label}
                onPress={() => handleMenuNavigation(item.href)}
              />
            ))}

            {/* Services Section if available */}
            {getServices().length > 0 && (
              <>
                <View style={styles.menuDivider} />
                <Text
                  style={[styles.menuSectionTitle, { color: colors.primary }]}
                >
                  Services
                </Text>
                {getServices().map((service: any, index: number) => (
                  <MenuItem
                    key={`service-${index}`}
                    label={service.name}
                    onPress={() =>
                      handleMenuNavigation(service.link || "/services")
                    }
                  />
                ))}
              </>
            )}

            {/* Language Selection */}
            <View style={styles.menuDivider} />
            <Text style={[styles.menuSectionTitle, { color: colors.primary }]}>
              Language
            </Text>
            <MenuItem
              label={`${otherLanguage}`}
              onPress={() => handleLanguageChange(otherLanguageCode)}
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 50,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#F4F4F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },

  logoImage: {
    width: 100,
    height: 40,
    borderRadius: 8,
  },

  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  logoIconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  logoText: {
    fontSize: 12,
    fontWeight: "800",
    maxWidth: 80,
  },

  logoSubText: {
    fontSize: 10,
    fontWeight: "600",
  },

  desktopNav: {
    display: "none",
    marginHorizontal: 16,
  },

  navItemText: {
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 8,
    paddingVertical: 4,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },

  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 34,
    minHeight: 34,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  searchButton: {
    backgroundColor: "#AAA4F5",
  },

  languageDropdown: {
    position: "relative",
  },

  langButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  languageMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },

  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0,
  },

  langOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  loginButton: {
    paddingHorizontal: 12,
    minHeight: 34,
  },

  loginText: {
    fontSize: 12,
    fontWeight: "700",
  },

  menuButton: {
    display: "none",
  },

  // Mobile Menu Styles
  mobileMenu: {
    position: "absolute",
    top: 130,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999,
    minWidth: 200,
    overflow: "hidden",
  },

  mobileMenuContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderLeftWidth: 3,
  },

  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },

  menuItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C2C2C",
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },

  menuSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  loadingText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },

  // Services Preview
  servicesPreview: {
    marginTop: 12,
    marginHorizontal: 16,
  },

  servicesScroll: {
    paddingVertical: 6,
  },

  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  serviceChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
