import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AuthFormProps = {
  title: string;
  email: string;
  password?: string;
  code?: string;
  onEmailChange: (email: string) => void;
  onPasswordChange?: (password: string) => void;
  onCodeChange?: (code: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  linkText: string;
  linkHref: "/sign-in" | "/sign-up";
  linkLabel: string;
  isVerification?: boolean;
  disabled?: boolean;
  error?: string;
};

export function AuthForm({
  title,
  email,
  password,
  code,
  onEmailChange,
  onPasswordChange,
  onCodeChange,
  onSubmit,
  submitLabel,
  linkText,
  linkHref,
  linkLabel,
  isVerification = false,
  disabled = false,
  error,
}: AuthFormProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NutriTrack</Text>
        <Text style={styles.subtitle}>{title}</Text>
      </View>

      <View style={styles.form}>
        {isVerification ? (
          <>
            <Text style={styles.description}>
              Un code de vérification a été envoyé à votre email.
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Code de vérification"
              placeholderTextColor="#999"
              onChangeText={onCodeChange}
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={email}
              placeholder="Email"
              placeholderTextColor="#999"
              onChangeText={onEmailChange}
              keyboardType="email-address"
            />
            {password !== undefined && onPasswordChange && (
              <TextInput
                style={styles.input}
                value={password}
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                secureTextEntry
                onChangeText={onPasswordChange}
              />
            )}
          </>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            disabled && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={onSubmit}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>{submitLabel}</Text>
        </Pressable>

        {!isVerification && (
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>{linkText} </Text>
            <Link href={linkHref}>
              <Text style={styles.link}>{linkLabel}</Text>
            </Link>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4caf50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    paddingHorizontal: 32,
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "600",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginTop: -8,
  },
});
