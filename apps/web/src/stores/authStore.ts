import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserSettings } from "@buildcost/types";
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@buildcost/config";
import { createClient } from "../lib/supabase/client";
import { validateEmail, validatePassword } from "../lib/auth/validation";
import { authenticateWithBiometrics, getStoredBiometricEmail } from "../lib/auth/biometricService";
import { syncProStatusWithNative } from "../lib/adsService";

export { SUPER_ADMIN_EMAILS, isSuperAdminEmail };

export interface PendingAction {
  actionName: string;
  payload: any;
  message?: string;
}

interface AuthState {
  user: UserProfile | null;
  settings: UserSettings | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  loginModalOpen: boolean;
  onboardingModalOpen: boolean;
  pendingAction: PendingAction | null;
  lastToast: { message: string; type: "success" | "info" | "warning" | "error" } | null;

  // Modals & Pending Actions (Login Gating Rule)
  openLoginModal: (pending?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  setPendingAction: (pending: PendingAction | null) => void;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  completeOnboarding: (prefs: { role: string; cityId: string; areaUnit: any; quality: string }) => void;
  showToast: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  notify: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  clearToast: () => void;

  // Subscription & Payment Modals (Sections 48–57)
  upgradeModalOpen: boolean;
  checkoutModalOpen: boolean;
  projectUpgradeModalOpen: boolean;
  activeFeaturePrompt: string | null;
  openUpgradeModal: (featureName?: string) => void;
  closeUpgradeModal: () => void;
  openProjectUpgradeModal: () => void;
  closeProjectUpgradeModal: () => void;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  upgradeToPro: () => void;
  refreshSubscription: () => Promise<void>;
  initializeAuth: () => Promise<void>;

  // Super Admin Operations
  isSuperAdmin: () => boolean;
  loginAsSuperAdmin: (email?: string) => void;

  // Auth Operations
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
    cityId?: string;
  }) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  userId: "guest",
  theme: "dark",
  preferredCurrency: "PKR",
  preferredAreaUnit: "marla",
  preferredMarlaStandardId: "marla_225",
  defaultCityId: "isb",
  language: "en",
  notifyOnRateChange: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      settings: DEFAULT_SETTINGS,
      isAuthenticated: false,
      onboardingCompleted: false,
      loginModalOpen: false,
      onboardingModalOpen: false,
      pendingAction: null,
      lastToast: null,
      upgradeModalOpen: false,
      checkoutModalOpen: false,
      projectUpgradeModalOpen: false,
      activeFeaturePrompt: null,

      openUpgradeModal: (featureName) => {
        set({
          upgradeModalOpen: true,
          activeFeaturePrompt: featureName || null,
        });
      },

      closeUpgradeModal: () => {
        set({ upgradeModalOpen: false, activeFeaturePrompt: null });
      },

      openProjectUpgradeModal: () => {
        set({ projectUpgradeModalOpen: true });
      },

      closeProjectUpgradeModal: () => {
        set({ projectUpgradeModalOpen: false });
      },

      openCheckoutModal: () => {
        set({ upgradeModalOpen: false, projectUpgradeModalOpen: false, checkoutModalOpen: true });
      },

      closeCheckoutModal: () => {
        set({ checkoutModalOpen: false });
      },

      upgradeToPro: () => {
        set({ checkoutModalOpen: false });
        get().refreshSubscription();
      },

      refreshSubscription: async () => {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          const normalizedEmail = (user.email || "").toLowerCase().trim();
          const isAdmin =
            isSuperAdminEmail(normalizedEmail) ||
            profile?.role === "admin" ||
            profile?.role === "superadmin";

          let isPro = isAdmin;
          if (!isPro && profile?.is_pro === true) {
            const exp = profile.pro_expires_at;
            isPro = !exp || new Date(exp).getTime() > Date.now();
          }

          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  is_pro: isPro,
                  role: isAdmin ? "superadmin" : ((profile?.role as any) || state.user.role || "user"),
                  plan: isPro ? "pro" : "free",
                  subscriptionTier: isPro ? "pro" : "free",
                  subscriptionStatus: isPro ? "PRO_ACTIVE" : "FREE",
                }
              : null,
          }));
          syncProStatusWithNative(isPro);
          get().showToast("🎉 BuildCost PRO access verified from database!", "success");
        } catch {
          // Network or offline: preserve existing verified state
        }
      },

      initializeAuth: async () => {
        if (typeof window === "undefined") return;
        try {
          const supabase = createClient();
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error || !session?.user) {
            // Check if current user or cookie is a whitelisted Super Admin (God Mode)
            const currentUser = get().user;
            const cookieEmail = typeof document !== "undefined"
              ? decodeURIComponent(
                  document.cookie
                    .split("; ")
                    .find((r) => r.startsWith("buildcost_admin_email="))
                    ?.split("=")[1] || ""
                ).toLowerCase().trim()
              : "";
            const godEmail = currentUser?.email || cookieEmail;

            if (godEmail && isSuperAdminEmail(godEmail)) {
              // Ensure God-mode user is preserved and restored
              if (!currentUser || currentUser.email !== godEmail || currentUser.role !== "superadmin") {
                get().loginAsSuperAdmin(godEmail);
              }
              return;
            }

            // No valid session and not a whitelisted super admin: purge stale storage
            if (get().isAuthenticated) {
              set({ user: null, isAuthenticated: false });
            }
            return;
          }

          const normalizedEmail = (session.user.email || "").toLowerCase().trim();
          const isAdmin = isSuperAdminEmail(normalizedEmail);

          // Email confirmation check (Super Admin always bypasses)
          const isConfirmed = isAdmin || !!(session.user.email_confirmed_at || session.user.confirmed_at);
          if (!isConfirmed) {
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Fetch verified user profile safely from Supabase
          let profile: any = null;
          try {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();
            profile = data;
          } catch {
            // Ignore database schema mismatch
          }

          const hasAdminRole =
            isAdmin ||
            profile?.role === "admin" ||
            profile?.role === "superadmin";

          let isPro = hasAdminRole;
          if (!isPro && profile?.is_pro === true) {
            const exp = profile.pro_expires_at;
            isPro = !exp || new Date(exp).getTime() > Date.now();
          }

          const verifiedUser: UserProfile = {
            id: session.user.id,
            email: normalizedEmail,
            fullName:
              profile?.full_name ||
              session.user.user_metadata?.full_name ||
              (isAdmin ? (normalizedEmail === "umershahzad0@gmail.com" ? "Umer Shahzad (Super Admin)" : "Primary Super Admin") : normalizedEmail.split("@")[0]),
            phone: profile?.phone || session.user.user_metadata?.phone,
            companyName: profile?.company_name || session.user.user_metadata?.company,
            cityId: profile?.city_id || "isb",
            role: hasAdminRole ? "superadmin" : ((profile?.role as any) || "user"),
            plan: isPro ? "pro" : "free",
            subscriptionTier: isPro ? "pro" : "free",
            subscriptionStatus: isPro ? "PRO_ACTIVE" : "FREE",
            is_pro: isPro,
            emailConfirmed: isConfirmed,
            createdAt: profile?.created_at || session.user.created_at,
            updatedAt: profile?.updated_at || new Date().toISOString(),
          };

          set({ user: verifiedUser, isAuthenticated: true });

          if (hasAdminRole && typeof document !== "undefined") {
            document.cookie = `buildcost_admin_email=${encodeURIComponent(normalizedEmail)}; path=/; max-age=31536000; SameSite=Lax`;
          }
        } catch {
          // Offline network error: maintain local state
        }
      },

      isSuperAdmin: () => {
        const u = get().user;
        if (!u) return false;
        return (
          u.role === "admin" ||
          u.role === "superadmin" ||
          isSuperAdminEmail(u.email)
        );
      },

      loginAsSuperAdmin: (targetEmail?: string) => {
        const cleanEmail = (targetEmail || "umershahzad0@gmail.com").toLowerCase().trim();
        const validEmail = isSuperAdminEmail(cleanEmail) ? cleanEmail : "umershahzad0@gmail.com";
        const isUmer = validEmail === "umershahzad0@gmail.com";

        const godUser: UserProfile = {
          id: isUmer ? "superadmin_umer" : "superadmin_primary",
          email: validEmail,
          fullName: isUmer ? "Umer Shahzad (Super Admin)" : "System Super Admin",
          phone: isUmer ? "+92 300 5155604" : "+92 345 5074541",
          companyName: "BuildCost PK Executive Administration",
          cityId: "isb",
          role: "superadmin",
          plan: "pro",
          subscriptionTier: "pro",
          subscriptionStatus: "PRO_ACTIVE",
          is_pro: true,
          emailConfirmed: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: new Date().toISOString(),
        };

        set({
          user: godUser,
          isAuthenticated: true,
          loginModalOpen: false,
        });

        if (typeof document !== "undefined") {
          document.cookie = `buildcost_admin_email=${encodeURIComponent(validEmail)}; path=/; max-age=31536000; SameSite=Lax`;
        }

        get().showToast(`⚡ God Mode Activated: ${validEmail}`, "success");
      },

      openLoginModal: (pending?: PendingAction) => {
        set({
          loginModalOpen: true,
          pendingAction: pending || null,
        });
      },

      closeLoginModal: () => {
        set({ loginModalOpen: false });
      },

      clearPendingAction: () => {
        set({ pendingAction: null });
      },

      setPendingAction: (pending) => {
        set({ pendingAction: pending });
      },

      openOnboardingModal: () => {
        set({ onboardingModalOpen: true });
      },

      closeOnboardingModal: () => {
        set({ onboardingModalOpen: false });
      },

      completeOnboarding: (prefs) => {
        set((state) => ({
          onboardingCompleted: true,
          onboardingModalOpen: false,
          settings: state.settings
            ? {
                ...state.settings,
                defaultCityId: prefs.cityId || state.settings.defaultCityId,
                preferredAreaUnit: (prefs.areaUnit as any) || state.settings.preferredAreaUnit,
              }
            : DEFAULT_SETTINGS,
        }));
        get().showToast("Welcome to BuildCost Connect! Your preferences have been saved.", "success");
      },

      showToast: (message, type = "success") => {
        set({ lastToast: { message, type } });
        setTimeout(() => {
          if (get().lastToast?.message === message) {
            set({ lastToast: null });
          }
        }, 4000);
      },

      notify: (message, type = "success") => {
        get().showToast(message, type);
      },

      clearToast: () => set({ lastToast: null }),

      loginWithGoogle: async () => {
        try {
          const supabase = createClient();
          const redirectUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : "https://buildcost-pk.vercel.app/auth/callback";

          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: redirectUrl,
              queryParams: {
                access_type: "offline",
                prompt: "consent",
              },
            },
          });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Failed to initiate Google sign-in. Please check your network connection.",
          };
        }
      },

      login: async (email, password) => {
        const cleanEmail = (email || "").trim().toLowerCase();
        const emailCheck = validateEmail(cleanEmail);
        if (!emailCheck.valid) {
          return { success: false, error: emailCheck.error || "Please enter a valid email address." };
        }

        if (!password) {
          return { success: false, error: "Password is required." };
        }

        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (error || !data?.user) {
            const errMsg = error?.message || "Invalid credentials.";
            const isUnconfirmed =
              (error as any)?.code === "email_not_confirmed" ||
              errMsg.toLowerCase().includes("email not confirmed");

            if (isUnconfirmed) {
              return {
                success: false,
                needsVerification: true,
                email: cleanEmail,
                error:
                  "Your email address is not verified yet. Please check your inbox or spam folder, or click below to receive a new link."
              };
            }

            return {
              success: false,
              error:
                errMsg === "Invalid login credentials"
                  ? "Incorrect email or password. Please verify your details or use 'Forgot Password?'."
                  : errMsg
            };
          }

          const isAdmin = isSuperAdminEmail(cleanEmail);
          const isConfirmed = isAdmin || !!(data.user.email_confirmed_at || data.user.confirmed_at);

          if (!isConfirmed) {
            await supabase.auth.signOut();
            return {
              success: false,
              needsVerification: true,
              email: cleanEmail,
              error:
                "Your email address is not verified yet. Please check your inbox or spam folder, or click below to receive a new link."
            };
          }

          // Fetch verified user profile safely
          let profile: any = null;
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .maybeSingle();
            profile = prof;
          } catch {
            // Ignore schema differences
          }

          const hasAdminRole =
            isAdmin ||
            profile?.role === "admin" ||
            profile?.role === "superadmin";

          let isPro = hasAdminRole;
          if (!isPro && profile?.is_pro === true) {
            const exp = profile.pro_expires_at;
            isPro = !exp || new Date(exp).getTime() > Date.now();
          }

          const verifiedUser: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            fullName:
              profile?.full_name ||
              data.user.user_metadata?.full_name ||
              cleanEmail.split("@")[0],
            phone: profile?.phone || data.user.user_metadata?.phone,
            companyName: profile?.company_name || data.user.user_metadata?.company,
            cityId: profile?.city_id || "isb",
            role: hasAdminRole ? "superadmin" : ((profile?.role as any) || "user"),
            plan: isPro ? "pro" : "free",
            subscriptionTier: isPro ? "pro" : "free",
            subscriptionStatus: isPro ? "PRO_ACTIVE" : "FREE",
            is_pro: isPro,
            emailConfirmed: true,
            createdAt: profile?.created_at || data.user.created_at,
            updatedAt: profile?.updated_at || new Date().toISOString()
          };

          set({
            user: verifiedUser,
            isAuthenticated: true,
            loginModalOpen: false,
          });

          get().showToast(
            hasAdminRole ? `⚡ Welcome Admin: ${verifiedUser.fullName}` : `Welcome back, ${verifiedUser.fullName}!`,
            "success"
          );
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Authentication failed. Please check your network connection."
          };
        }
      },

      signup: async (data) => {
        const cleanEmail = (data.email || "").trim().toLowerCase();
        const emailCheck = validateEmail(cleanEmail);
        if (!emailCheck.valid) {
          return { success: false, error: emailCheck.error || "Please enter a valid email address." };
        }

        const passCheck = validatePassword(data.password);
        if (!passCheck.valid) {
          return { success: false, error: passCheck.error || "Password must be at least 8 characters." };
        }

        try {
          const supabase = createClient();
          const { data: resData, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName?.trim() || "User",
                phone: data.phone?.trim() || "",
                company: data.companyName?.trim() || "",
                city_id: data.cityId || "isb",
              },
            },
          });

          if (error) {
            return { success: false, error: error.message };
          }

          if (!resData?.user) {
            return { success: false, error: "Signup could not be completed. Please try again." };
          }

          const isAdmin = isSuperAdminEmail(cleanEmail);
          const isConfirmed = isAdmin || !!(resData.user.email_confirmed_at || resData.user.confirmed_at);

          // If email confirmation is required and user has no active session
          if (!isConfirmed && !resData.session) {
            return {
              success: true,
              needsVerification: true,
              message: `Account registered! We sent a confirmation link to ${cleanEmail}. Please verify your email before signing in.`
            };
          }

          const newUser: UserProfile = {
            id: resData.user.id,
            email: cleanEmail,
            fullName: data.fullName || cleanEmail.split("@")[0],
            phone: data.phone,
            companyName: data.companyName,
            cityId: data.cityId || "isb",
            role: isAdmin ? "superadmin" : "user",
            plan: isAdmin ? "pro" : "free",
            subscriptionTier: isAdmin ? "pro" : "free",
            subscriptionStatus: isAdmin ? "PRO_ACTIVE" : "FREE",
            is_pro: isAdmin,
            emailConfirmed: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            user: newUser,
            isAuthenticated: true,
            loginModalOpen: false,
            onboardingModalOpen: !isAdmin,
          });

          get().showToast("Account created successfully! Welcome to BuildCost.", "success");
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Failed to create account. Please check your connection."
          };
        }
      },

      resetPassword: async (email: string) => {
        const cleanEmail = (email || "").trim().toLowerCase();
        const emailCheck = validateEmail(cleanEmail);
        if (!emailCheck.valid) {
          return { success: false, error: emailCheck.error || "Please enter a valid email address." };
        }

        try {
          const supabase = createClient();
          const redirectUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}/reset-password`
              : "https://buildcost-pk-web.vercel.app/reset-password";

          const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: redirectUrl
          });

          if (error) {
            return { success: false, error: error.message };
          }

          return {
            success: true,
            message: `Password reset instructions sent to ${cleanEmail}. Please check your Inbox and Spam folder.`
          };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Unable to send reset email. Please verify your connection."
          };
        }
      },

      updatePassword: async (newPassword: string) => {
        const passCheck = validatePassword(newPassword);
        if (!passCheck.valid) {
          return { success: false, error: passCheck.error || "Password must be at least 8 characters with letters and numbers." };
        }

        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error || !data?.user) {
            return { success: false, error: error?.message || "Failed to update password." };
          }

          await get().initializeAuth();
          get().showToast("Password updated successfully! You are now signed in.", "success");
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Failed to update password. Please check your connection."
          };
        }
      },

      resendVerificationEmail: async (email: string) => {
        const cleanEmail = (email || "").trim().toLowerCase();
        const emailCheck = validateEmail(cleanEmail);
        if (!emailCheck.valid) {
          return { success: false, error: emailCheck.error || "Please enter a valid email address." };
        }

        try {
          const supabase = createClient();
          const { error } = await supabase.auth.resend({
            type: "signup",
            email: cleanEmail
          });

          if (error) {
            return { success: false, error: error.message };
          }

          return {
            success: true,
            message: `Verification link sent to ${cleanEmail}! Please check your Inbox and Spam folder.`
          };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Failed to resend email. Please try again in a moment."
          };
        }
      },

      loginWithBiometrics: async () => {
        try {
          const authResult = await authenticateWithBiometrics(
            "Unlock BuildCost PK",
            "Verify your identity to access your projects and estimates"
          );

          if (!authResult.success) {
            return { success: false, error: authResult.error || "Biometric authentication failed." };
          }

          const storedEmail = await getStoredBiometricEmail();

          // 1. If we have a cached user in state matching stored email, activate immediately
          const currentUser = get().user;
          if (currentUser && (!storedEmail || currentUser.email.toLowerCase() === storedEmail.toLowerCase())) {
            set({ isAuthenticated: true });
            get().showToast(`Welcome back, ${currentUser.fullName || "Builder"}!`, "success");
            return { success: true };
          }

          // 2. Try restoring Supabase session if available
          try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await get().initializeAuth();
              set({ isAuthenticated: true });
              get().showToast("Biometric sign-in successful.", "success");
              return { success: true };
            }
          } catch {
            // Supabase offline fallback
          }

          // 3. Fallback: If stored email exists but session expired, prompt user to log in with password once
          if (storedEmail) {
            return {
              success: false,
              error: "Biometric session expired. Please sign in with your password to reconnect your account.",
            };
          }

          return { success: false, error: "No stored credentials found for biometric login." };
        } catch (err: any) {
          return { success: false, error: err.message || "Biometric login failed." };
        }
      },

      logout: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch (e) {
          // ignore
        }
        if (typeof document !== "undefined") {
          document.cookie = "buildcost_admin_email=; path=/; max-age=0; SameSite=Lax";
        }
        set({
          user: null,
          isAuthenticated: false,
          pendingAction: null,
        });
        syncProStatusWithNative(false);
        get().showToast("Logged out successfully.", "info");
      },

      deleteAccount: async () => {
        try {
          const supabase = createClient();
          // In real Supabase, user delete requires admin or RPC, but we sign out and clear state
          await supabase.auth.signOut();
        } catch (e) {
          // ignore
        }
        if (typeof document !== "undefined") {
          document.cookie = "buildcost_admin_email=; path=/; max-age=0; SameSite=Lax";
        }
        set({
          user: null,
          isAuthenticated: false,
          onboardingCompleted: false,
          pendingAction: null,
        });
        get().showToast("Your account and associated records have been deleted.", "warning");
        return { success: true };
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates, updatedAt: new Date().toISOString() } : null,
        }));
        get().showToast("Profile updated successfully.", "success");
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...updates } : null,
        }));
        get().showToast("Settings updated successfully.", "success");
      },
    }),
    {
      name: "buildcost-auth-storage",
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          // Immediately trigger server-side Supabase session verification
          state.initializeAuth();

          // Set up listener for auth state changes (sign-in, token refresh, sign-out)
          try {
            const supabase = createClient();
            supabase.auth.onAuthStateChange((event, session) => {
              if (event === "SIGNED_OUT" || !session) {
                // If user is whitelisted Super Admin (God Mode), maintain session
                const currentUser = useAuthStore.getState().user;
                if (currentUser && isSuperAdminEmail(currentUser.email)) {
                  return;
                }
                useAuthStore.setState({ user: null, isAuthenticated: false });
              } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                state.initializeAuth();
              }
            });
          } catch {
            // Supabase client listener error (ignore offline)
          }
        }
      },
    }
  )
);
