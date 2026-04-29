import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import CreateListingScreen from "./screens/CreateListingScreen";
import ListingDetailScreen from "./screens/ListingDetailScreen";
import MyListingsScreen from "./screens/MyListingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="Marketplace" component={HomeScreen} />
        <Stack.Screen name="Create Listing" component={CreateListingScreen} />
        <Stack.Screen name="Listing Detail" component={ListingDetailScreen} />
        <Stack.Screen name="My Listings" component={MyListingsScreen} />

      </Stack.Navigator>

    </NavigationContainer>
  );
}
