import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router, useSegments } from "expo-router";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Layout() {
  const [user, setUser] = useState(auth.currentUser);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    const currentScreen = segments[0];
    const isAuthScreen = currentScreen === "login" || currentScreen === "register";

    if (!user && !isAuthScreen) {
      router.replace("/login");
    }

    if (user && isAuthScreen) {
      router.replace("/");
    }
  }, [isCheckingAuth, segments, user]);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const renderBackButton = () => (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }

        router.replace("/");
      }}
      style={styles.backButton}
    >
      <Text style={styles.backArrow}>‹</Text>
      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );

  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Home" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen
        name="create-listing"
        options={{
          title: "Create Listing",
          headerBackVisible: false,
          headerLeft: renderBackButton,
        }}
      />
      <Stack.Screen
        name="listing-detail"
        options={{
          title: "Listing",
          headerBackVisible: false,
          headerLeft: renderBackButton,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingRight: 8,
  },

  backArrow: {
    fontSize: 28,
    color: "#1f2937",
    marginRight: 2,
    lineHeight: 28,
  },

  backText: {
    fontSize: 17,
    color: "#1f2937",
    fontWeight: "500",
  },
});
