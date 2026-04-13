import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AuthStackParamList } from "../navigation/types";

type NavProp = StackNavigationProp<AuthStackParamList, "Landing">;

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero image — top 60% */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80",
        }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Green tint overlay on image */}
      <View style={styles.greenOverlay} />

      {/* Bottom fade — image fades into white sheet */}
      <View style={styles.bottomFade} />

      {/* App name on image */}
      <View style={styles.topBadge}>
        <Text style={styles.appName}> FarmConnect</Text>
      </View>

      {/* White bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.dragPill} />

        {/* Tag line */}

        <Text style={styles.headline}>
          Buy, Sell &amp; Deliver{"\n"}Farm Products
        </Text>

        <Text style={styles.subtext}>
          <Text style={styles.subtextAccent}>Anytime.</Text>
          {"  "}
          <Text style={styles.subtextAccent}>Anywhere.</Text>
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2K+</Text>
            <Text style={styles.statLabel}>Farmers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>800+</Text>
            <Text style={styles.statLabel}>Merchants</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>150+</Text>
            <Text style={styles.statLabel}>Deliveries/day</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Login")}
          activeOpacity={0.88}
        >
          <Text style={styles.btnText}>Get Started  →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.signinRow}
        >
          <Text style={styles.signinText}>
            Already have an account?{" "}
            <Text style={styles.signinLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1A7A35",
  },

  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height: height * 0.23,
  },

  greenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height: height * 0.23,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },

  bottomFade: {
    position: "absolute",
    top: height * 0.23 - 60,
    left: 0,
    right: 0,
    height: 60,
  },

  topBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 48 : 36,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
  },
  appName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  sheet: {
    position: "absolute",
    top: height * 0.23 - 24,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 48 : 36,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  dragPill: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },

  // ── Tag ───────────────────────────────────────────────────────────────────
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3DAA5C",
    marginRight: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3DAA5C",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  headline: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0D1B0F",
    lineHeight: 42,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 15,
    color: "#aaa",
    fontWeight: "500",
    marginBottom: 28,
  },
  subtextAccent: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A7A35",
    letterSpacing: 0.3,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FBF3",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: "#B2DFBC",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A7A35",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    color: "#5A9A6A",
    marginTop: 3,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#B2DFBC",
  },

  btn: {
    backgroundColor: "#1A7A35",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 0,
    shadowColor: "#1A7A35",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  signinRow: {
    alignItems: "center",
    marginTop: 22,
  },
  signinText: {
    fontSize: 14,
    color: "#aaa",
  },
  signinLink: {
    color: "#1A7A35",
    fontWeight: "700",
  },gninLink: {
    color: "#2E7D32",
    fontWeight: "700",
  },
});
