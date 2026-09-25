import "../global.css";
import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { View, Text, Animated, Easing, Image, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(15)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo Scale & Fade in
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Text Fade-up
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Footer Fade in
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 800,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // 4. Spinner Continuous Rotation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 5. Tagline Subtle Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.75,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Transition to onboarding / main flow
    const timer = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 2200);

    return () => clearTimeout(timer);
  }, [router]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 bg-[#0F766E] items-center justify-center px-6">
      {/* <StatusBar style="light" /> */}


      {/* Center Logo and Brand Section */}
      <View className="items-center justify-center -mt-12">
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            alignItems: "center",
          }}
        >


          {/* Logo Image */}
          <Image
            source={require("../../assets/logo.png")}
            style={{
              width: 140,
              height: 140,
              resizeMode: "contain",
            }}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text className="text-white text-3xl font-extrabold tracking-tight">
            MediFind Ghana
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          opacity: footerOpacity,
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Animated Custom Loading Spinner */}
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            marginBottom: 16,
          }}
        >
          <Svg width={44} height={44} viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="8"
            />
            <Circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#ffffff"
              strokeWidth="8"
              strokeDasharray="90 160"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: pulseValue }}>
          <Text className="text-white text-sm font-medium text-center tracking-wide">
            Finding health, one pharmacy at a time.
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
