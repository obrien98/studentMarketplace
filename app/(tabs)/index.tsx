// This is the default screen inside the tabs navigation

import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { auth } from "../../firebase/firebaseConfig";
import { theme } from "../../constants/marketplace-theme";

type Listing = {
  id: string;
  title?: string;
  price?: string;
  description?: string;
  ownerEmail?: string;
};

export default function BrowseListings() {
  const { success } = useLocalSearchParams<{ success?: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const unsubscribe = onSnapshot(
      collection(db, "listings"),
      (snapshot) => {
        const data: Listing[] = [];

        snapshot.forEach((doc) => {
          const listingData = { id: doc.id, ...doc.data() } as Listing; 
          const belongsToCurrentUser = listingData.id.startsWith(`${user.uid}_`); // dont show a user their own posts

          if (!belongsToCurrentUser) {
            data.push(listingData);
          }
        });

        setListings(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading other listings:", error);
        setErrorMessage("Could not load other listings right now.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.badge}>Campus marketplace</Text>
        <Text style={styles.header}>Browse Listings</Text>
        <Text style={styles.subheader}>See what other students are selling and claim an item when you want it.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Items</Text>
        <Text style={styles.sectionSubtitle}>Open any listing to claim it.</Text>
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
          <Text style={styles.loadingText}>Loading campus listings...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={listings}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyBadge}>All caught up</Text>
              <Text style={styles.emptyTitle}>No other listings available</Text>
              <Text style={styles.emptyText}>Check back later to see if another student posts something new.</Text>
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
                    source: "browse",
                  }
                })
              }
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTag}>Available now</Text>
                <Text style={styles.cardArrow}>Claim</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.ownerText}>Posted by: {item.ownerEmail || "Unknown user"}</Text>
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
    backgroundColor: "#d8ecf4",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.white,
    color: "#0f5f7a",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
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

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: theme.spacing.xxl,
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

  ownerText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    marginTop: theme.spacing.sm,
    fontWeight: "600",
  },
});
