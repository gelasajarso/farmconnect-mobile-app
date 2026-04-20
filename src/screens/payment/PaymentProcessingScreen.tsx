import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import type { MerchantStackParamList } from "../../navigation/types";
import {
  initChapaPayment,
  verifyChapaPayment,
  initTelebirrPayment,
  pollTelebirrStatus,
} from "../../services/payment.service";
import type { PaymentStatus } from "../../types/payment";

type NavProp = StackNavigationProp<MerchantStackParamList, "PaymentProcessing">;
type RoutePropType = RouteProp<MerchantStackParamList, "PaymentProcessing">;

const PROVIDER_LABELS: Record<string, string> = {
  CHAPA: "Chapa",
  TELEBIRR: "Telebirr",
};

const STEPS: Record<string, string[]> = {
  CHAPA: [
    "Initializing payment…",
    "Opening Chapa checkout…",
    "Verifying payment…",
  ],
  TELEBIRR: [
    "Sending USSD push…",
    "Waiting for approval…",
    "Confirming payment…",
  ],
};

export default function PaymentProcessingScreen() {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RoutePropType>();
  const { provider, paymentParams } = params;

  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const steps = STEPS[provider] ?? ["Processing…"];

  function animateStep(nextIndex: number) {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setStepIndex(nextIndex);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (provider === "CHAPA") {
          // Step 1: init
          animateStep(0);
          const initRes = await initChapaPayment({
            order_id: paymentParams.order_id,
            amount: paymentParams.amount,
            currency: "ETB",
            email: paymentParams.merchant_email,
            first_name: paymentParams.merchant_name.split(" ")[0] ?? "User",
            last_name: paymentParams.merchant_name.split(" ")[1] ?? "",
            tx_ref: `FC-${paymentParams.order_id}-${Date.now()}`,
            callback_url: "https://api.farmconnect.app/payments/chapa/callback",
            return_url: "farmconnect://payment/result",
          });

          if (cancelled) return;
          if (initRes.status !== "success")
            throw new Error("Payment initialization failed");

          // Step 2: simulate checkout
          animateStep(1);
          await new Promise((r) => setTimeout(r, 1500));

          // Step 3: verify
          if (cancelled) return;
          animateStep(2);
          const txRef = initRes.data.checkout_url.split("/").pop() ?? "";
          const verifyRes = await verifyChapaPayment(txRef);

          if (cancelled) return;
          const status: PaymentStatus =
            verifyRes.data.status === "success" ? "SUCCESS" : "FAILED";
          navigation.replace("PaymentResult", {
            status,
            provider,
            amount: paymentParams.amount,
            order_id: paymentParams.order_id,
            reference: txRef,
            message: verifyRes.message,
          });
        } else if (provider === "TELEBIRR") {
          // Step 1: init
          animateStep(0);
          const initRes = await initTelebirrPayment({
            order_id: paymentParams.order_id,
            amount: paymentParams.amount,
            phone_number: "0911000000", // would come from user profile in production
            subject: `FarmConnect Order ${paymentParams.order_id}`,
          });

          if (cancelled) return;
          if (initRes.status !== "success")
            throw new Error("Telebirr initialization failed");

          // Step 2: wait for user approval
          animateStep(1);
          await new Promise((r) => setTimeout(r, 2000));

          // Step 3: poll status
          if (cancelled) return;
          animateStep(2);
          const statusRes = await pollTelebirrStatus(
            initRes.data.transaction_id,
          );

          if (cancelled) return;
          const status: PaymentStatus =
            statusRes.status === "SUCCESS" ? "SUCCESS" : "FAILED";
          navigation.replace("PaymentResult", {
            status,
            provider,
            amount: paymentParams.amount,
            order_id: paymentParams.order_id,
            reference: initRes.data.transaction_id,
            message:
              status === "SUCCESS"
                ? "Payment confirmed"
                : "Payment failed or timed out",
          });
        }
      } catch (err: any) {
        if (cancelled) return;
        navigation.replace("PaymentResult", {
          status: "FAILED",
          provider,
          amount: paymentParams.amount,
          order_id: paymentParams.order_id,
          reference: null,
          message: err?.message ?? "An unexpected error occurred",
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <ActivityIndicator size="large" color="#1A7A35" />
        </View>

        <Text style={styles.provider}>{PROVIDER_LABELS[provider]}</Text>
        <Text style={styles.amount}>
          ETB{" "}
          {paymentParams.amount.toLocaleString("en-ET", {
            minimumFractionDigits: 2,
          })}
        </Text>

        <Animated.Text style={[styles.step, { opacity: fadeAnim }]}>
          {steps[stepIndex]}
        </Animated.Text>

        {/* Step dots */}
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === stepIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Text style={styles.hint}>Please do not close this screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FBF3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },

  provider: {
    fontSize: 13,
    color: "#9E9E9E",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0D1B0F",
    letterSpacing: -1,
    marginBottom: 24,
  },

  step: {
    fontSize: 16,
    color: "#1A7A35",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },

  dots: { flexDirection: "row", gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E0E0E0" },
  dotActive: { backgroundColor: "#1A7A35", width: 20 },

  hint: { fontSize: 12, color: "#BDBDBD", textAlign: "center" },
});
