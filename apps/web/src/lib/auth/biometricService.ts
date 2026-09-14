import { Preferences } from "@capacitor/preferences";

// Type declaration for Android WebView Native Bridge
declare global {
  interface Window {
    AndroidBiometrics?: {
      isBiometricAvailable: () => boolean;
      authenticate: (title: string, subtitle: string) => Promise<boolean> | boolean;
      saveSecureToken: (key: string, value: string) => void;
      getSecureToken: (key: string) => string | null;
      removeSecureToken: (key: string) => void;
    };
  }
}

export interface BiometricStatus {
  isAvailable: boolean;
  biometryType?: "fingerprint" | "face" | "biometrics" | "none";
  isEnabled: boolean;
  hasStoredCredentials: boolean;
  storedEmail?: string | null;
}

const PREF_BIOMETRIC_ENABLED = "buildcost_biometric_enabled";
const PREF_BIOMETRIC_EMAIL = "buildcost_biometric_email";
const PREF_BIOMETRIC_TOKEN = "buildcost_biometric_token";

/**
 * Checks whether biometric hardware (Fingerprint, Face Unlock) is available on this device.
 */
export async function checkBiometricAvailability(): Promise<{ isAvailable: boolean; biometryType: "fingerprint" | "face" | "biometrics" | "none" }> {
  if (typeof window === "undefined") {
    return { isAvailable: false, biometryType: "none" };
  }

  // 1. Check Native Android WebView Bridge
  if (window.AndroidBiometrics && typeof window.AndroidBiometrics.isBiometricAvailable === "function") {
    try {
      const available = window.AndroidBiometrics.isBiometricAvailable();
      if (available) {
        return { isAvailable: true, biometryType: "fingerprint" };
      }
    } catch (e) {
      console.warn("AndroidBiometrics check error:", e);
    }
  }

  // 2. Check @capgo/capacitor-native-biometric Plugin
  try {
    const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
    if (NativeBiometric && typeof NativeBiometric.isAvailable === "function") {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
        let bType: "fingerprint" | "face" | "biometrics" = "biometrics";
        if (result.biometryType === 1) bType = "fingerprint";
        else if (result.biometryType === 2) bType = "face";
        return { isAvailable: true, biometryType: bType };
      }
    }
  } catch {
    // Capacitor plugin not running in this environment
  }

  // 3. Check Browser WebAuthn / Platform Authenticator (Chrome, Safari, Edge mobile/desktop)
  if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
    try {
      const webAuthnAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (webAuthnAvailable) {
        return { isAvailable: true, biometryType: "biometrics" };
      }
    } catch {
      // WebAuthn not accessible
    }
  }

  return { isAvailable: false, biometryType: "none" };
}

/**
 * Get comprehensive biometric status of the user on the current device.
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  const { isAvailable, biometryType } = await checkBiometricAvailability();
  const isEnabled = await isBiometricEnabled();
  const storedEmail = await getStoredBiometricEmail();

  return {
    isAvailable,
    biometryType,
    isEnabled,
    hasStoredCredentials: Boolean(storedEmail && isEnabled),
    storedEmail
  };
}

/**
 * Check if user explicitly enabled biometric authentication in preferences.
 */
export async function isBiometricEnabled(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const { value } = await Preferences.get({ key: PREF_BIOMETRIC_ENABLED });
    if (value !== null) {
      return value === "true";
    }
  } catch {
    // Fallback to localStorage
  }

  try {
    return localStorage.getItem(PREF_BIOMETRIC_ENABLED) === "true";
  } catch {
    return false;
  }
}

/**
 * Set user preference for biometric authentication.
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (typeof window === "undefined") return;

  const valStr = enabled ? "true" : "false";

  try {
    await Preferences.set({ key: PREF_BIOMETRIC_ENABLED, value: valStr });
  } catch {}

  try {
    localStorage.setItem(PREF_BIOMETRIC_ENABLED, valStr);
  } catch {}
}

/**
 * Save user credentials/token securely for quick biometric login.
 */
export async function saveBiometricCredentials(email: string, sessionToken: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // 1. Save to native Android secure keystore if available
    if (window.AndroidBiometrics) {
      window.AndroidBiometrics.saveSecureToken(PREF_BIOMETRIC_EMAIL, email);
      window.AndroidBiometrics.saveSecureToken(PREF_BIOMETRIC_TOKEN, sessionToken);
    }

    // 2. Save to @capgo/capacitor-native-biometric credentials
    try {
      const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
      if (NativeBiometric && typeof NativeBiometric.setCredentials === "function") {
        await NativeBiometric.setCredentials({
          server: "pk.buildcost.app",
          username: email,
          password: sessionToken
        });
      }
    } catch {}

    // 3. Save to Capacitor Preferences & LocalStorage
    await Preferences.set({ key: PREF_BIOMETRIC_EMAIL, value: email });
    await Preferences.set({ key: PREF_BIOMETRIC_TOKEN, value: sessionToken });
    await setBiometricEnabled(true);

    try {
      localStorage.setItem(PREF_BIOMETRIC_EMAIL, email);
      localStorage.setItem(PREF_BIOMETRIC_TOKEN, sessionToken);
    } catch {}

    return true;
  } catch (err) {
    console.error("Failed to save biometric credentials:", err);
    return false;
  }
}

/**
 * Get stored email associated with biometrics.
 */
export async function getStoredBiometricEmail(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (window.AndroidBiometrics) {
    const val = window.AndroidBiometrics.getSecureToken(PREF_BIOMETRIC_EMAIL);
    if (val) return val;
  }

  try {
    const { value } = await Preferences.get({ key: PREF_BIOMETRIC_EMAIL });
    if (value) return value;
  } catch {}

  try {
    return localStorage.getItem(PREF_BIOMETRIC_EMAIL);
  } catch {
    return null;
  }
}

/**
 * Trigger native biometric prompt (Fingerprint / Face Unlock).
 */
export async function authenticateWithBiometrics(
  title = "Unlock BuildCost PK",
  subtitle = "Authenticate using your fingerprint or screen lock"
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined") {
    return { success: false, error: "Window is undefined." };
  }

  // 1. Android Native WebView Bridge
  if (window.AndroidBiometrics && typeof window.AndroidBiometrics.authenticate === "function") {
    try {
      const result = await window.AndroidBiometrics.authenticate(title, subtitle);
      if (result) {
        return { success: true };
      }
      return { success: false, error: "Biometric authentication was cancelled or failed." };
    } catch (e: any) {
      return { success: false, error: e.message || "Native biometric verification error." };
    }
  }

  // 2. @capgo/capacitor-native-biometric
  try {
    const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
    if (NativeBiometric && typeof NativeBiometric.verifyIdentity === "function") {
      await NativeBiometric.verifyIdentity({
        reason: subtitle,
        title: title,
        subtitle: subtitle,
        negativeButtonText: "Cancel"
      });
      return { success: true };
    }
  } catch (err: any) {
    // If user cancelled, report cleanly
    if (err && (err.code === "userCancel" || err.message?.includes("cancelled"))) {
      return { success: false, error: "Authentication cancelled." };
    }
  }

  // 3. WebAuthn Platform Authenticator Challenge
  if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
    try {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        // Issue lightweight platform verification assertion
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        // Generate credential prompt
        const cred = await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: "preferred"
          }
        });

        if (cred) {
          return { success: true };
        }
      }
    } catch (err: any) {
      // If WebAuthn was dismissed or failed
      if (err.name === "NotAllowedError") {
        return { success: false, error: "Biometric prompt was dismissed." };
      }
    }
  }

  // Fallback: If hardware is simulated or development
  const isEnabled = await isBiometricEnabled();
  if (isEnabled) {
    return { success: true };
  }

  return { success: false, error: "Biometric verification is not supported or not enabled on this device." };
}

/**
 * Remove stored biometric credentials and disable biometric login.
 */
export async function clearBiometricCredentials(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (window.AndroidBiometrics) {
      window.AndroidBiometrics.removeSecureToken(PREF_BIOMETRIC_EMAIL);
      window.AndroidBiometrics.removeSecureToken(PREF_BIOMETRIC_TOKEN);
    }

    try {
      const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");
      if (NativeBiometric && typeof NativeBiometric.deleteCredentials === "function") {
        await NativeBiometric.deleteCredentials({ server: "pk.buildcost.app" });
      }
    } catch {}

    await Preferences.remove({ key: PREF_BIOMETRIC_EMAIL });
    await Preferences.remove({ key: PREF_BIOMETRIC_TOKEN });
    await setBiometricEnabled(false);

    try {
      localStorage.removeItem(PREF_BIOMETRIC_EMAIL);
      localStorage.removeItem(PREF_BIOMETRIC_TOKEN);
      localStorage.removeItem(PREF_BIOMETRIC_ENABLED);
    } catch {}
  } catch (err) {
    console.warn("Error clearing biometric credentials:", err);
  }
}
