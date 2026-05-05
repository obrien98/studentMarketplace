import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { theme } from "../../constants/marketplace-theme";

export default function Logout() {
  useEffect(() => {
    const logout = async () => {
      try {
        await signOut(auth);
        router.replace("/login");
      } catch (error) {
        console.error("Error logging out:", error);
        router.replace("/profile");
      }
    };

    logout();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>Logging out...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },

  text: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.mutedText,
  },
});
