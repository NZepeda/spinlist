"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logoutAction } from "@/features/auth/actions/logoutAction";
import { setAuthenticatedUser } from "@/monitoring/setAuthenticatedUser";
import { createClient } from "@/server/supabase/client";
import type { Profile } from "@/shared/types";
import { mapProfileRowToProfile } from "@/server/database/mappers/mapProfileRowToProfile";

interface AuthState {
  user: User | null;
}

type AuthAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "CLEAR_AUTH" };

interface AuthContextState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  initialProfile?: Profile | null;
  initialUser?: User | null;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        user: action.payload,
      };
    case "CLEAR_AUTH":
      return {
        user: null,
      };
    default:
      return state;
  }
}

/**
 * Auth provider that manages user authentication state.
 * Listens to Supabase auth state changes and automatically fetches the user profile data.
 */
export function AuthProvider({
  children,
  initialProfile = null,
  initialUser = null,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    user: initialUser,
  });
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();
  const initialUserId = initialUser?.id ?? null;

  useEffect(() => {
    if (initialUserId) {
      // Keep the bootstrap profile in the React Query cache so the initial
      // authenticated render does not immediately refetch the same record.
      queryClient.setQueryData(["profile", initialUserId], initialProfile);
    }
  }, [initialProfile, initialUserId, queryClient]);

  useEffect(() => {
    if (initialUser) {
      dispatch({ type: "SET_USER", payload: initialUser });
      return;
    }

    dispatch({ type: "CLEAR_AUTH" });
  }, [initialUser]);

  useEffect(() => {
    setAuthenticatedUser(state.user?.id ?? null);
  }, [state.user?.id]);

  const profileQuery = useQuery<Profile | null>({
    queryKey: ["profile", state.user?.id],
    queryFn: async () => {
      if (!state.user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", state.user.id)
        .single();

      if (error) {
        throw error;
      }
      if (!data) {
        return null;
      }

      return mapProfileRowToProfile(data);
    },
    enabled: Boolean(state.user),
    initialData:
      state.user?.id && state.user.id === initialUserId
        ? initialProfile
        : undefined,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error initializing auth:", sessionError);
        }

        if (session?.user) {
          dispatch({ type: "SET_USER", payload: session.user });
        } else {
          dispatch({ type: "CLEAR_AUTH" });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({ type: "CLEAR_AUTH" });
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: "SET_USER", payload: session.user });
      } else {
        dispatch({ type: "CLEAR_AUTH" });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const isLoading =
    Boolean(state.user) &&
    profileQuery.isLoading &&
    typeof profileQuery.data === "undefined";

  const contextValue: AuthContextState = {
    user: state.user,
    profile: profileQuery.data ?? null,
    isLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state and methods.
 * Returns the current user, their profile (cached via React Query), loading state, profile errors, and logout function.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
