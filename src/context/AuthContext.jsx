import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      console.log("Checking initial session...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) console.error("Session error:", error);

      if (mounted) {
        if (session?.user) {
          console.log("Session found, fetching profile...");
          await fetchProfile(session.user);
        } else {
          console.log("No session found.");
          setUser(null);
          setLoading(false);
        }
      }
    }
    
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      if (mounted) {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(authUser) {
    console.log("Fetching profile for UID:", authUser.id);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        // Even if profile fails, don't hang the app. Just default to staff.
        setUser({ ...authUser, role: 'staff', full_name: 'Unknown' });
      } else {
        console.log("Profile found:", data);
        setUser({ ...authUser, role: data.role, full_name: data.full_name });
      }
    } catch (err) {
      console.error("Catch block error:", err);
      setUser({ ...authUser, role: 'staff', full_name: 'Unknown' });
    } finally {
      console.log("Finished loading auth state.");
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    console.log("Attempting login...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error from Supabase:", error);
      throw error;
    }
    console.log("Login successful, user data:", data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);