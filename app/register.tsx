import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Register() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = () => {

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => router.replace("/"))
      .catch(err => alert(err.message));
  };

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.header}>Student Marketplace</Text>
        <Text style={styles.subheader}>Create Account</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={register}
        >
          <Text style={styles.registerText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>

      </View>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6
  },

  subheader: {
    fontSize: 18,
    marginBottom: 20,
    color: "#666"
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

  registerButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5
  },

  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },

  loginLink: {
    marginTop: 18,
    alignItems: "center"
  },

  loginText: {
    color: "#2563eb",
    fontSize: 15
  }

});
