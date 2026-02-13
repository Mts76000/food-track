import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { getErrorMessage, verifySignUpCode } from "@/utils/auth-helpers";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [isLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    setError("");

    try {
      await verifySignUpCode(signUp, code, setActive, router);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [isLoaded, signUp, code, setActive, router]);

  if (pendingVerification) {
    return (
      <AuthForm
        title="Inscription"
        email={email}
        code={code}
        onEmailChange={setEmail}
        onCodeChange={setCode}
        onSubmit={handleVerify}
        submitLabel="Vérifier"
        linkText=""
        linkHref="/sign-in"
        linkLabel=""
        isVerification
        error={error}
      />
    );
  }

  return (
    <AuthForm
      title="Inscription"
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSignUp}
      submitLabel="S'inscrire"
      linkText="Déjà un compte ?"
      linkHref="/sign-in"
      linkLabel="Se connecter"
      disabled={!email || !password}
      error={error}
    />
  );
}
