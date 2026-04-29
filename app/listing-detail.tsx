import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";

type Listing = {
  title?: string;
  price?: string;
};

export default function ListingDetail() {

  const { id } = useLocalSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {

    const loadListing = async () => {
      if (typeof id !== "string") {
        setErrorMessage("This listing could not be found.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const docRef = doc(db, "listings", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setListing(snap.data() as Listing);
        } else {
          setErrorMessage("This listing does not exist anymore.");
        }
      } catch (error) {
        setErrorMessage("Could not load this listing right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();

  }, [id]);

  const deleteListing = async () => {
    const user = auth.currentUser;

    if (typeof id !== "string") {
      setErrorMessage("This listing could not be deleted.");
      return;
    }

    if (!user) {
      setErrorMessage("You need to be logged in to delete a listing.");
      return;
    }

    const isOwner = typeof id === "string" && id.startsWith(`${user.uid}_`);

    if (!isOwner) {
      setErrorMessage("You can only delete your own listings.");
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage("");

      await deleteDoc(doc(db, "listings", id));
      router.replace("/");
    } catch (error) {
      console.error("Error deleting listing:", error);
      setErrorMessage("Could not delete the listing. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loading}>Loading listing...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.errorText}>{errorMessage || "Listing not found."}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const user = auth.currentUser;
  const canDeleteListing = typeof id === "string" && !!user?.uid && id.startsWith(`${user.uid}_`);

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.title}>{listing.title}</Text>

        <Text style={styles.price}>${listing.price}</Text>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.deleteButton, !canDeleteListing && styles.disabledButton]}
          onPress={deleteListing}
          disabled={!canDeleteListing || isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteText}>
              {canDeleteListing ? "Delete Listing" : "Not Your Listing"}
            </Text>
          )}
        </TouchableOpacity>

      </View>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    padding: 20
  },

  card: {
    width: "100%",
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center"
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10
  },

  price: {
    fontSize: 22,
    color: "#2563eb",
    marginBottom: 12
  },

  ownerText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },

  deleteButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8
  },

  disabledButton: {
    backgroundColor: "#9ca3af",
  },

  deleteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },

  loading: {
    fontSize: 18,
    marginTop: 12,
  },

  errorText: {
    fontSize: 15,
    color: "#b91c1c",
    textAlign: "center",
    marginBottom: 16,
  },

  backButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 8,
  },

  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  }

});
