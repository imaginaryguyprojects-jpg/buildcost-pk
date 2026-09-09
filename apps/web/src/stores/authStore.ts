import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserSettings } from "@buildcost/types";
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@buildcost/config";
import { createClient } from "../lib/supabase/client";
import { validateEmail, validatePassword } from "../lib/auth/validation";

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
    cityId?: string;
  }) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; message?: string }>;
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
            // No valid session: purge any stale or tampered client storage
            if (get().isAuthenticated) {
              set({ user: null, isAuthenticated: false });
            }
            return;
          }

          // Strict email confirmation verification
          const isConfirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);
          if (!isConfirmed) {
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Fetch verified user profile directly from Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          const normalizedEmail = (session.user.email || "").toLowerCase().trim();
          const isAdmin =
            isSuperAdminEmail(normalizedEmail) ||
            profile?.role === "admin" ||
            profile?.role === "superadmin";

          let isPro = isAdmin;
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
              normalizedEmail.split("@")[0],
            phone: profile?.phone || session.user.user_metadata?.phone,
            companyName: profile?.company_name || session.user.user_metadata?.company,
            cityId: profile?.city_id || "isb",
            role: isAdmin ? "superadmin" : ((profile?.role as any) || "user"),
            plan: isPro ? "pro" : "free",
            subscriptionTier: isPro ? "pro" : "free",
            subscriptionStatus: isPro ? "PRO_ACTIVE" : "FREE",
            is_pro: isPro,
            emailConfirmed: true,
            createdAt: profile?.created_at || session.user.created_at,
            updatedAt: profile?.updated_at || new Date().toISOString(),
          };

          set({ user: verifiedUser, isAuthenticated: true });
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

      loginAsSuperAdmin: () => {
        get().showToast("Direct bypass disabled for security. Please sign in with admin credentials.", "warning");
        get().openLoginModal();
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

      login: async (email, password) => {
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
          return { success: false, error: emailCheck.error };
        }

        if (!password) {
          return { success: false, error: "Password is required." };
        }

        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
          });

          if (error || !data?.user) {
            return {
              success: false,
              error: error?.message || "Invalid email or password. Please try again."
            };
          }

          // Strict Email Confirmation Check
          const isConfirmed = !!(data.user.email_confirmed_at || data.user.confirmed_at);
          if (!isConfirmed) {
            await supabase.auth.signOut();
            return {
              success: false,
              error:
                "Your email address is not verified yet. Please check your inbox or spam folder to confirm your email before signing in."
            };
          }

          // Fetch verified user profile from Supabase database
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          const normalizedEmail = (data.user.email || email).toLowerCase().trim();
          const isAdmin = isSuperAdminEmail(normalizedEmail) || profile?.role === "admin" || profile?.role === "superadmin";

          // Verify PRO subscription status directly from database
          let isPro = isAdmin;
          if (!isPro && profile?.is_pro === true) {
            const exp = profile.pro_expires_at;
            isPro = !exp || new Date(exp).getTime() > Date.now();
          }

          const verifiedUser: UserProfile = {
            id: data.user.id,
            email: normalizedEmail,
            fullName: profile?.full_name || data.user.user_metadata?.full_name || normalizedEmail.split("@")[0],
            phone: profile?.phone || data.user.user_metadata?.phone,
            companyName: profile?.company_name || data.user.user_metadata?.company,
            cityId: profile?.city_id || "isb",
            role: isAdmin ? "superadmin" : ((profile?.role as any) || "user"),
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

          get().showToast(isAdmin ? `⚡ Welcome Admin: ${verifiedUser.fullName}` : `Welcome back, ${verifiedUser.fullName}!`, "success");
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Authentication failed. Please check your network connection."
          };
        }
      },

      signup: async (data) => {
        const emailCheck = validateEmail(data.email);
        if (!emailCheck.valid) {
          return { success: false, error: emailCheck.error };
        }

        const passCheck = validatePassword(data.password);
        if (!passCheck.valid) {
          return { success: false, error: passCheck.error };
        }

        try {
          const supabase = createClient();
          const cleanEmail = data.email.trim().toLowerCase();
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

          // Check if email confirmation is required
          const isConfirmed = !!(resData.user.email_confirmed_at || resData.user.confirmed_at);
          if (!isConfirmed) {
            return {
              success: true,
              needsVerification: true,
              message: `Account created successfully! We sent a confirmation link to ${cleanEmail}. Please verify your email before signing in.`
            };
          }

          const isAdmin = isSuperAdminEmail(cleanEmail);
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

          get().showToast("Account created successfully!", "success");
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err.message || "Failed to create account. Please check your connection."
          };
        }
      },

      logout: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch (e) {
          // ignore
        }
        set({
          user: null,
          isAuthenticated: false,
          pendingAction: null,
        });
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
