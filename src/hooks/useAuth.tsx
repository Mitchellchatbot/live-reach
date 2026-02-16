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
  hasAgentAccess: boolean;
  refreshRole: () => Promise<void>;
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
  const [allRoles, setAllRoles] = useState<Set<string>>(new Set());
  const [hasAgentAccess, setHasAgentAccess] = useState(false);

  const [roleLoading, setRoleLoading] = useState(false);
  const lastRoleUserId = useRef<string | null>(null);

  const fetchUserRole = async (userId: string, force = false) => {
    if (!force && lastRoleUserId.current === userId && role !== null) return;
    
    setRoleLoading(true);

    // Fetch ALL roles for this user (supports multi-role)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const roleSet = new Set((roles || []).map(r => r.role as string));
    setAllRoles(roleSet);

    // Pick highest-privilege as primary role
    const primary: AppRole | null = roleSet.has('admin') ? 'admin'
      : roleSet.has('client') ? 'client'
      : roleSet.has('agent') ? 'agent'
      : null;
    setRole(primary);
    lastRoleUserId.current = userId;
    
    // Check if user has accepted agent invitations
    const { data: agentData } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', userId)
      .eq('invitation_status', 'accepted')
      .limit(1);
    
    setHasAgentAccess((agentData && agentData.length > 0) || false);
    
    setRoleLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'TOKEN_REFRESHED') {
          const newUserId = session?.user?.id ?? null;
          const currentUserId = lastRoleUserId.current;
          if (newUserId === currentUserId) {
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            if (isMounted) fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setAllRoles(new Set());
          lastRoleUserId.current = null;
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

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
    setAllRoles(new Set());
  };

  const refreshRole = async () => {
    if (user) {
      await fetchUserRole(user.id, true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: loading || roleLoading,
        role,
        isAdmin: allRoles.has('admin'),
        isClient: allRoles.has('client'),
        isAgent: allRoles.has('agent'),
        hasAgentAccess,
        refreshRole,
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
