import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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

  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
      <Stack.Screen name="create-listing" options={{ title: "Create Listing" }} />
      <Stack.Screen name="listing-detail" options={{ title: "Listing" }} />
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
});
