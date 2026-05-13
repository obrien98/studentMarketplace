import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";
import { theme } from "../constants/marketplace-theme";

type Listing = {
  title?: string;
  price?: string;
  description?: string;
};

export default function ListingDetail() {

  const { id, source } = useLocalSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    if (typeof id !== "string") {
      setErrorMessage("This listing could not be found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const unsubscribe = onSnapshot(
      doc(db, "listings", id),
      (snapshot) => {
        if (snapshot.exists()) {
          const listingData = snapshot.data() as Listing;
          setListing(listingData);

          if (!isEditing) {
            setEditedTitle(listingData.title || "");
            setEditedPrice(listingData.price || "");
            setEditedDescription(listingData.description || "");
          }
        } else {
          setListing(null);
          setErrorMessage("This listing does not exist anymore.");
        }

        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading listing:", error);
        setErrorMessage("Could not load this listing right now.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [id, isEditing]);

  const goBackToPreviousScreen = () => {
    if (source === "browse") {
      router.replace("/");
      return;
    }

    router.replace("/profile");
  };

  const handleListingAction = async () => {
    const user = auth.currentUser;

    if (typeof id !== "string") {
      setErrorMessage("This listing could not be updated.");
      return;
    }

    const listingId = id;
    const confirmDelete = async () => {
      try {
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        await deleteDoc(doc(db, "listings", listingId));
        goBackToPreviousScreen();
      } catch (error) {
        console.error("Error updating listing:", error);
        setErrorMessage("Could not complete this action. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!user) {
      setErrorMessage("You need to be logged in to continue.");
      return;
    }

    if (isOwner) {
      Alert.alert(
        "Delete listing?",
        "This will remove the listing from your profile.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              confirmDelete();
            },
          },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteDoc(doc(db, "listings", listingId));
      router.replace({
        pathname: "/",
        params: {
          success: "Listing claimed successfully!",
        }
      });
    } catch (error) {
      console.error("Error updating listing:", error);
      setErrorMessage("Could not complete this action. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveChanges = async () => {
    if (typeof id !== "string") {
      setErrorMessage("This listing could not be updated.");
      return;
    }

    if (!editedTitle.trim() || !editedPrice.trim() || !editedDescription.trim()) {
      setErrorMessage("Please fill in the title, price, and description.");
      return;
    }

    if (Number(editedPrice) <= 0) {
      setErrorMessage("Please enter a valid price greater than 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await updateDoc(doc(db, "listings", id), {
        title: editedTitle.trim(),
        price: editedPrice.trim(),
        description: editedDescription.trim(),
      });

      setListing({
        title: editedTitle.trim(),
        price: editedPrice.trim(),
        description: editedDescription.trim(),
      });
      setIsEditing(false);
      setSuccessMessage("Listing updated successfully!");
    } catch (error) {
      console.error("Error saving listing:", error);
      setErrorMessage("Could not save your changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loading}>Loading listing...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.missingBadge}>Listing unavailable</Text>
          <Text style={styles.errorText}>{errorMessage || "Listing not found."}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBackToPreviousScreen}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const user = auth.currentUser;
  const isOwner = typeof id === "string" && !!user?.uid && id.startsWith(`${user.uid}_`);
  const actionLabel = isOwner ? "Delete Listing" : "Claim Listing";
  const heroText = isOwner
    ? "Review the price below or remove the listing if it is no longer available."
    : "If you want this item, claim it to remove it from the available marketplace.";

  return (

    <View style={styles.container}>

      <View style={styles.heroCard}>
        <Text style={styles.badge}>Listing details</Text>
        <Text style={styles.heroTitle}>{listing.title}</Text>
        <Text style={styles.heroSubtitle}>{heroText}</Text>
      </View>

      <View style={styles.card}>
        {isOwner && isEditing ? (
          <>
            <Text style={styles.label}>Item title</Text>
            <TextInput
              value={editedTitle}
              onChangeText={setEditedTitle}
              style={styles.input}
              placeholder="Item title"
              placeholderTextColor={theme.colors.mutedText}
            />

            <Text style={styles.label}>Price</Text>
            <TextInput
              value={editedPrice}
              onChangeText={setEditedPrice}
              style={styles.input}
              placeholder="Price"
              placeholderTextColor={theme.colors.mutedText}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              placeholderTextColor={theme.colors.mutedText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Asking price</Text>
            <Text style={styles.price}>${listing.price}</Text>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.descriptionText}>{listing.description || "No description added."}</Text>
          </>
        )}

        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {isOwner && isEditing ? (
          <>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveChanges}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.actionText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => {
                setEditedTitle(listing.title || "");
                setEditedPrice(listing.price || "");
                setEditedDescription(listing.description || "");
                setErrorMessage("");
                setSuccessMessage("");
                setIsEditing(false);
              }}
            >
              <Text style={styles.backLinkText}>Cancel editing</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {(!isOwner || !isEditing) ? (
        <TouchableOpacity
          style={[styles.actionButton, !isOwner && styles.claimButton]}
          onPress={handleListingAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.actionText}>{actionLabel}</Text>
          )}
        </TouchableOpacity>
        ) : null}

        {isOwner && !isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setIsEditing(true);
            }}
          >
            <Text style={styles.editButtonText}>Edit Listing</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.backLink}
          onPress={goBackToPreviousScreen}
        >
          <Text style={styles.backLinkText}>Back to previous page</Text>
        </TouchableOpacity>

      </View>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },

  heroCard: {
    backgroundColor: "#e7ddfb",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadow,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.white,
    color: "#5b21b6",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.mutedText,
  },

  card: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    ...theme.shadow,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.mutedText,
    marginBottom: theme.spacing.sm,
  },

  input: {
    width: "100%",
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

  price: {
    fontSize: 36,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    fontWeight: "800",
  },

  descriptionText: {
    width: "100%",
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  actionButton: {
    backgroundColor: "#d1431e",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: theme.radius.md,
    minWidth: 180,
    alignItems: "center",
  },

  claimButton: {
    backgroundColor: "#1c7c54",
  },

  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: theme.radius.md,
    minWidth: 180,
    alignItems: "center",
  },

  editButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceSoft,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: theme.radius.md,
    minWidth: 180,
    alignItems: "center",
  },

  editButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  actionText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700"
  },

  loading: {
    fontSize: 18,
    marginTop: 12,
    color: theme.colors.mutedText,
  },

  missingBadge: {
    backgroundColor: theme.colors.surfaceSoft,
    color: theme.colors.mutedText,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  errorText: {
    fontSize: 15,
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },

  successText: {
    width: "100%",
    fontSize: 15,
    color: "#166534",
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },

  backButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: theme.radius.md,
  },

  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  backLink: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },

  backLinkText: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: "600",
  }

});
