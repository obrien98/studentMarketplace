import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { auth } from "../../firebase/firebaseConfig";
import { theme } from "../../constants/marketplace-theme";

type Listing = {
  id: string;
  title?: string;
  price?: string;
  description?: string;
};

export default function Profile() {
  const { success } = useLocalSearchParams<{ success?: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadListings = async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const querySnapshot = await getDocs(collection(db, "listings"));
      const data: Listing[] = [];

      querySnapshot.forEach((doc) => {
        const listingData = { id: doc.id, ...doc.data() } as Listing;
        const belongsToCurrentUser = listingData.id.startsWith(`${user.uid}_`);

        if (belongsToCurrentUser) {
          data.push(listingData);
        }
      });

      setListings(data);
    } catch (error) {
      console.error("Error loading your listings:", error);
      setErrorMessage("Could not load your listings right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.header}>Manage your listings</Text>
          <Text style={styles.subheader}>Post new items, open your listings, and make changes when you need to.</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/create-listing")}
        >
          <Text style={styles.buttonText}>Post New Listing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Listings</Text>
        <Text style={styles.sectionSubtitle}>Tap any listing to edit or remove it.</Text>
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {success ? (
        <Text style={styles.successText}>{success}</Text>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyBadge}>Nothing posted yet</Text>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyText}>Post your first item to start selling to other students.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/listing-detail",
                  params: {
                    id: item.id,
                    source: "profile",
                  }
                })
              }
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTag}>Your listing</Text>
                <Text style={styles.cardArrow}>Edit</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.descriptionText} numberOfLines={2}>{item.description || "No description added."}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },

  heroCard: {
    backgroundColor: "#f8e8d2",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },

  heroCopy: {
    flex: 1,
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 30,
  },

  subheader: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.mutedText,
  },

  actionRow: {
    marginBottom: theme.spacing.md,
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },

  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  sectionHeader: {
    marginBottom: theme.spacing.md,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedText,
  },

  errorText: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: 15,
  },

  successText: {
    color: "#166534",
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.mutedText,
  },

  emptyState: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    ...theme.shadow,
  },

  emptyBadge: {
    backgroundColor: theme.colors.surfaceSoft,
    color: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: theme.colors.text,
  },

  emptyText: {
    fontSize: 15,
    color: theme.colors.mutedText,
    textAlign: "center",
  },

  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },

  cardTag: {
    backgroundColor: theme.colors.surfaceSoft,
    color: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    fontSize: 12,
    fontWeight: "700",
  },

  cardArrow: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },

  price: {
    fontSize: 24,
    color: theme.colors.primary,
    marginTop: 10,
    fontWeight: "800",
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.mutedText,
    marginTop: theme.spacing.sm,
  },
});
