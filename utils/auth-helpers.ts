import type { SetActive, SignInResource, SignUpResource } from "@clerk/types";
import type { Router } from "expo-router";

export async function handleAuthSuccess(
  setActive: SetActive,
  sessionId: string,
  router: Router,
) {
  await setActive({
    session: sessionId,
    navigate: async ({ session }) => {
      if (session?.currentTask) {
        return;
      }
      router.replace("/");
    },
  });
}

export function getErrorMessage(error: any): string {
  if (!error?.errors?.[0]) {
    return "Une erreur est survenue";
  }

  const clerkError = error.errors[0];
  const code = clerkError.code;
  const message = clerkError.message?.toLowerCase() || "";

  if (code === "form_password_pwned") {
    return "Ce mot de passe est trop commun";
  }
  if (code === "form_password_length_too_short") {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (code === "form_identifier_not_found") {
    return "Aucun compte trouvé avec cet email";
  }
  if (code === "form_password_incorrect") {
    return "Mot de passe incorrect";
  }
  if (code === "form_param_format_invalid") {
    return "Format d'email invalide";
  }
  if (code === "form_identifier_exists") {
    return "Un compte existe déjà avec cet email";
  }
  if (code === "form_code_incorrect") {
    return "Code de vérification incorrect";
  }

  if (message.includes("password")) {
    return "Erreur avec le mot de passe";
  }
  if (message.includes("email")) {
    return "Erreur avec l'email";
  }

  return "Une erreur est survenue";
}

export async function verifyEmailCode(
  signIn: SignInResource,
  code: string,
  setActive: SetActive,
  router: Router,
) {
  const attempt = await signIn.attemptSecondFactor({
    strategy: "email_code",
    code,
  });

  if (attempt.status === "complete") {
    if (attempt.createdSessionId) {
      await handleAuthSuccess(setActive, attempt.createdSessionId, router);
    } else {
      throw new Error("Session ID not available");
    }
  } else {
    throw new Error("Vérification incomplète");
  }
}

export async function verifySignUpCode(
  signUp: SignUpResource,
  code: string,
  setActive: SetActive,
  router: Router,
) {
  const attempt = await signUp.attemptEmailAddressVerification({ code });

  if (attempt.status === "complete") {
    if (attempt.createdSessionId) {
      await handleAuthSuccess(setActive, attempt.createdSessionId, router);
    } else {
      throw new Error("Session ID not available");
    }
  } else {
    throw new Error("Vérification incomplète");
  }
}
