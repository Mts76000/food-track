import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export const SignOutButton = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={20} color="#f44336" />
      <Text style={styles.buttonText}>Se déconnecter</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#f44336",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "600",
  },
});
