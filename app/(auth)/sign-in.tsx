import { useSignIn } from "@clerk/clerk-expo";
import type { EmailCodeFactor } from "@clerk/types";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import {
  getErrorMessage,
  handleAuthSuccess,
  verifyEmailCode,
} from "@/utils/auth-helpers";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;
    setError("");

    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === "complete") {
        if (attempt.createdSessionId) {
          await handleAuthSuccess(setActive, attempt.createdSessionId, router);
        } else {
          setError("Session ID not available");
        }
      } else if (attempt.status === "needs_second_factor") {
        const emailCodeFactor = attempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor =>
            factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        setError("Statut de connexion inattendu");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [isLoaded, signIn, setActive, router, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    setError("");

    try {
      await verifyEmailCode(signIn, code, setActive, router);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [isLoaded, signIn, code, setActive, router]);

  if (showEmailCode) {
    return (
      <AuthForm
        title="Connexion"
        email={email}
        code={code}
        onEmailChange={setEmail}
        onCodeChange={setCode}
        onSubmit={handleVerify}
        submitLabel="Vérifier"
        linkText=""
        linkHref="/sign-up"
        linkLabel=""
        isVerification
        error={error}
      />
    );
  }

  return (
    <AuthForm
      title="Connexion"
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSignIn}
      submitLabel="Se connecter"
      linkText="Pas encore de compte ?"
      linkHref="/sign-up"
      linkLabel="S'inscrire"
      disabled={!email || !password}
      error={error}
    />
  );
}
