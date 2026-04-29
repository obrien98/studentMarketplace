import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";

export default function CreateListing() {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const createListing = async () => {
    const trimmedTitle = title.trim();
    const trimmedPrice = price.trim();
    const user = auth.currentUser;

    if (!trimmedTitle || !trimmedPrice) {
      setErrorMessage("Please fill in both the title and price.");
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
      });

      router.replace("/");
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage("Could not create your listing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.header}>Create Listing</Text>
        <Text style={styles.subheader}>Add an item for other students to see.</Text>

        <TextInput
          placeholder="Item Title"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          style={styles.input}
        />

        <TextInput
          placeholder="Price ($)"
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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={createListing}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Post Listing</Text>
          )}
        </TouchableOpacity>

      </View>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    justifyContent: "center",
    padding: 20
  },

  card: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8
  },

  subheader: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fafafa"
  },

  errorText: {
    color: "#b91c1c",
    marginBottom: 15,
    fontSize: 15,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }

});
