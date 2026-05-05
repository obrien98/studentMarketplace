import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";
import { theme } from "../constants/marketplace-theme";

export default function CreateListing() {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const createListing = async () => {
    const trimmedTitle = title.trim();
    const trimmedPrice = price.trim();
    const trimmedDescription = description.trim();
    const user = auth.currentUser;

    if (!trimmedTitle || !trimmedPrice || !trimmedDescription) {
      setErrorMessage("Please fill in the title, price, and description.");
      return;
    }

    if (Number(trimmedPrice) <= 0) {
      setErrorMessage("Please enter a valid price greater than 0.");
      return;
    }

    if (!user) {
      setErrorMessage("You need to be logged in to create a listing.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const listingId = `${user.uid}_${Date.now()}`;

      await setDoc(doc(db, "listings", listingId), {
        title: trimmedTitle,
        price: trimmedPrice,
        description: trimmedDescription,
      });

      router.replace({
        pathname: "/profile",
        params: {
          success: "Listing posted successfully!",
        }
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage("Could not create your listing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <Text style={styles.badge}>Post something useful</Text>
        <Text style={styles.header}>Create Listing</Text>
        <Text style={styles.subheader}>Add a clear title and a fair price so other students can find it quickly.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Listing details</Text>

        <Text style={styles.label}>Item title</Text>
        <TextInput
          placeholder="Textbook, desk lamp, mini fridge..."
          placeholderTextColor={theme.colors.mutedText}
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          style={styles.input}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          placeholder="50"
          placeholderTextColor={theme.colors.mutedText}
          value={price}
          onChangeText={(value) => {
            setPrice(value);
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Add a short description with condition, brand, or helpful details."
          placeholderTextColor={theme.colors.mutedText}
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[styles.input, styles.descriptionInput]}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={createListing}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Post Listing</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },

  heroCard: {
    backgroundColor: "#dce9d5",
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

  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    ...theme.shadow,
  },

  header: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  subheader: {
    fontSize: 16,
    lineHeight: 24,
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

  descriptionInput: {
    minHeight: 120,
    paddingTop: 16,
  },

  errorText: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: 15,
  },

  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: "center"
  },

  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700"
  }

});
