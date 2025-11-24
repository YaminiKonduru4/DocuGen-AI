import { supabase } from './supabaseClient';
import type { User as AppUser } from '../types';

export type AuthChangeCallback = (user: AppUser | null) => void;

const mapSupabaseUser = (u: any): AppUser | null => {
  if (!u) return null;
  return {
    id: u.id,
    name: (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email || 'User',
    email: u.email || ''
  };
};

export const authService = {
  async signUp(email: string, password: string) {
    const res = await supabase.auth.signUp({ email, password });
    if (res.error) throw res.error;
    return res;
  },

  async requestPasswordReset(email: string, redirectTo?: string) {
    try {
      const redirect = redirectTo || (typeof window !== 'undefined' ? (window as any).location.origin : undefined);
      const res = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect });
      if ((res as any).error) throw (res as any).error;
      return res;
    } catch (e) {
      throw e;
    }
  },

  async signIn(email: string, password: string) {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) throw res.error;
    const user = mapSupabaseUser(res.data.user || res.data.session?.user || null);
    // Upsert profile in `profiles` table
    if (user) {
      try {
        await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: user.name, updated_at: new Date().toISOString() });
      } catch (e) {
        console.warn('Failed to upsert profile after signIn', e);
      }
    }
    return user;
  },

  async signInWithGoogle() {
    // This triggers a redirect to provider. Provide an explicit redirectTo to return to the app.
    const redirect = (typeof window !== 'undefined') ? (window as any).location.origin : undefined;
    const res = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirect } });
    if (res.error) throw res.error;
    // On success a redirect will occur; return the result for completeness
    return res;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    const user = mapSupabaseUser(data.user || null);
    if (user) {
      try {
        // Try to load profile from `profiles` table; if present, use its full_name
        const { data: profileData, error } = await supabase.from('profiles').select('full_name,email').eq('id', user.id).single();
        if (!error && profileData) {
          return { ...user, name: profileData.full_name || user.name, email: profileData.email || user.email } as AppUser;
        }
      } catch (e) {
        console.warn('Failed to load profile for current user', e);
      }
    }
    return user;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getAccessToken() {
    const session = await this.getSession();
    return session?.access_token ?? null;
  },

  // Try to parse a session from the URL (used after password recovery / oauth redirects)
  async handleSessionFromUrl() {
    if (typeof window === 'undefined') return null;
    const auth = (supabase.auth as any);
    try {
      if (typeof auth.getSessionFromUrl === 'function') {
        const { data, error } = await auth.getSessionFromUrl();
        if (error) {
          console.warn('getSessionFromUrl error', error);
          return null;
        }
        return data;
      }
      if (typeof auth.getSessionFromURL === 'function') {
        const { data, error } = await auth.getSessionFromURL();
        if (error) {
          console.warn('getSessionFromURL error', error);
          return null;
        }
        return data;
      }
    } catch (e) {
      console.warn('Failed to handle session from URL', e);
    }
    return null;
  },

  // Update password using a recovery access token (used after clicking the password-reset link)
  async updatePasswordUsingRecovery(accessToken: string, newPassword: string) {
    try {
      // supabase.auth.updateUser accepts options with accessToken for recovery flows
      const res = await (supabase.auth as any).updateUser({ password: newPassword }, { accessToken });
      if (res.error) throw res.error;
      return res;
    } catch (e) {
      throw e;
    }
  },

  onAuthStateChange(cb: AuthChangeCallback) {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = mapSupabaseUser(session?.user || null);
      if (u) {
        // Upsert profile on every auth change to ensure a profile exists
        try {
          await supabase.from('profiles').upsert({ id: u.id, email: u.email, full_name: u.name, updated_at: new Date().toISOString() });
        } catch (e) {
          console.warn('Failed to upsert profile on auth change', e);
        }
        // Try to fetch profile name to keep display name synced
        try {
          const { data: profileData, error } = await supabase.from('profiles').select('full_name,email').eq('id', u.id).single();
          if (!error && profileData) {
            cb({ ...u, name: profileData.full_name || u.name, email: profileData.email || u.email });
            return;
          }
        } catch (e) {
          console.warn('Failed to load profile on auth change', e);
        }
      }
      cb(u);
    });
    return () => data.subscription.unsubscribe();
  }
};

export default authService;
