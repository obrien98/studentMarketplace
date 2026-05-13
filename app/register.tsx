// - Collect email and password
// - Validate inputs
// - Create Firebase account
// - Redirect user after signup


import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { theme } from "../constants/marketplace-theme";

export default function Register() {
  const headerHeight = useHeaderHeight();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const register = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters long.");
      return;
    }

    try {
      setIsRegistering(true);
      setErrorMessage("");
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (error) {
      console.error("Error creating account:", error);
      setErrorMessage("Could not create your account. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.heroCard}>
          <Text style={styles.badge}>Join the app</Text>
          <Text style={styles.header}>Sell to other students</Text>
          <Text style={styles.subheader}>Create an account to post textbooks, furniture, tech, and more.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Create account</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@pace.edu"
            placeholderTextColor={theme.colors.mutedText}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="At least 6 characters"
            placeholderTextColor={theme.colors.mutedText}
            secureTextEntry
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            style={styles.input}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={register}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },

  heroCard: {
    backgroundColor: "#e8efe1",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadow,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.white,
    color: "#355e3b",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadow,
  },

  header: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  subheader: {
    fontSize: 17,
    lineHeight: 25,
    color: theme.colors.mutedText,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
  },

  errorText: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },

  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: theme.spacing.md,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },

  secondaryButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: "600",
  },
});
