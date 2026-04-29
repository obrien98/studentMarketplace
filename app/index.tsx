import { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

type Listing = {
  id: string;
  title?: string;
  price?: string;
};

export default function Home() { // define Home screen component

  // Note: State = data that can change and causes the ut to update.
  // listings = current array of listing objects shown in ui
  // setListings = updates state, causes a rerender
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

      setListings(data); // store new state value -> trigger re-render -> call our component again -> ui updates
    } catch (error) {
      console.error("Error loading listings:", error);
      setErrorMessage("Could not load your listings right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { // same pattern as auth protection, grab listings from db once when home screen mounts
    loadListings();
  }, []);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      setErrorMessage("Could not log out right now.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (

    <View style={styles.container}>

      <View style={styles.headerRow}>
        <Text style={styles.header}>Student Marketplace</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheader}>My Listings</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/create-listing")}
      >
        <Text style={styles.buttonText}>Create Listing</Text>
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyText}>Create your first item to see it here.</Text>
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
                  }
                })
              }
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>${item.price}</Text>
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
    padding: 20,
    backgroundColor: "#f4f6f8"
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },

  subheader: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },

  logoutButton: {
    backgroundColor: "#1f2937",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  logoutText: {
    color: "white",
    fontWeight: "600",
  },

  errorText: {
    color: "#b91c1c",
    marginBottom: 14,
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
    color: "#555",
  },

  emptyState: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 10,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },

  title: {
    fontSize: 18,
    fontWeight: "600"
  },

  price: {
    fontSize: 16,
    color: "#555",
    marginTop: 4
  }

});
