import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'client' | 'agent';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  isClient: boolean;
  isAgent: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  const [roleLoading, setRoleLoading] = useState(false);
  const lastRoleUserId = useRef<string | null>(null);

  const fetchUserRole = async (userId: string, force = false) => {
    // Skip if we already have the role for this user (avoids reload on tab switch)
    if (!force && lastRoleUserId.current === userId && role !== null) return;
    
    setRoleLoading(true);
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setRole(data.role as AppRole);
      lastRoleUserId.current = userId;
    }
    setRoleLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes (does NOT control initial loading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        // Skip redundant updates on TOKEN_REFRESHED to prevent re-renders on tab switch
        if (event === 'TOKEN_REFRESHED') {
          // Only update session ref for token freshness; skip state updates if user hasn't changed
          const newUserId = session?.user?.id ?? null;
          const currentUserId = lastRoleUserId.current;
          if (newUserId === currentUserId) {
            // Silently update session without triggering re-renders
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer to avoid deadlock
          setTimeout(() => {
            if (isMounted) fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          lastRoleUserId.current = null;
        }
      }
    );

    // INITIAL load - controls loading state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Fetch role BEFORE setting loading to false
        if (session?.user) {
          await fetchUserRole(session.user.id, true);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: loading || roleLoading,
        role,
        isAdmin: role === 'admin',
        isClient: role === 'client',
        isAgent: role === 'agent',
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
