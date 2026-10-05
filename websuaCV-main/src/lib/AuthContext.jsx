import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoadingAuth(true);
        setAuthError(null);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error("Auth initialization failed:", error);

        if (!mounted) return;

        setUser(null);
        setIsAuthenticated(false);
        setAuthError({
          type: "unknown",
          message: error?.message || "Authentication initialization failed",
        });
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase auth state changed:", event);

      if (!mounted) return;

      // Supabase provides the authoritative session for every auth event.
      // Applying it uniformly prevents missed SIGNED_IN events from leaving
      // the React auth state stale after a successful login.
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setAuthError(null);
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginViaEmailPassword = async (email, password) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Keep the context in sync with the successful response immediately;
    // the auth event remains the source of truth for refreshes and logout.
    setUser(data.user ?? null);
    setIsAuthenticated(!!data.user);

    return data;
  };

  const register = async ({ email, password, fullName }) => {
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
    }

    setUser(null);
    setIsAuthenticated(false);
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);

      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      setUser(currentUser ?? null);
      setIsAuthenticated(!!currentUser);
      setAuthError(null);

      return currentUser;
    } catch (error) {
      console.error("User auth check failed:", error);

      setUser(null);
      setIsAuthenticated(false);

      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authError,
        loginViaEmailPassword,
        register,
        logout,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
