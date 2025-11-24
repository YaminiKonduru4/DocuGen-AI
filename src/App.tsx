import React, { useState, useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { NewProject } from './pages/NewProject';
import { Editor } from './pages/Editor';
import type { Project, User } from './types';
import { dbService } from './services/dbService';
import { authService } from './services/authService';

const Layout: React.FC<{ children: React.ReactNode; user: User | null; onLogout: () => void; onNavigateHome: () => void }> = ({ children, user, onLogout, onNavigateHome }) => {
  const location = useLocation();
  const isEditor = location.pathname.includes('editor');

  return (
    <div className="min-h-screen bg-black text-white font-sans selection-white">
      <Header 
        user={user} 
        onLogout={onLogout} 
        onNavigateHome={onNavigateHome} 
      />
      <main className={isEditor ? '' : ''}>
        {children}
      </main>
    </div>
  );
};

const LoginScreen: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [mode, setMode] = React.useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleEmailSignIn = async () => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      if (user) onLogin(user);
    } catch (err) {
      console.error(err);
      alert('Sign in failed: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return alert('Email and password required');
    setLoading(true);
    try {
      await authService.signUp(email, password);
      alert('Sign-up initiated. Please check your email for confirmation (if enabled).');
      setMode('signin');
    } catch (err) {
      console.error(err);
      alert('Sign up failed: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return alert('Please enter your email to reset password');
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      alert('Password reset email sent. Check your inbox.');
      setMode('signin');
    } catch (err) {
      console.error(err);
      alert('Password reset failed: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      console.error(err);
      alert('Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center selection-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
      <div className="relative auth-container p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-6 shadow-lg logo-badge glass-panel">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 auth-font">DocuGen AI</h1>
        <p className="text-white/80 mb-6">Intelligent Document Authoring Platform</p>

        <div className="flex justify-center gap-2 mb-4">
          <button onClick={() => setMode('signin')} className={`px-3 py-1 rounded ${mode === 'signin' ? 'bg-white/10 text-black' : 'bg-black/60 text-white/80'}`}>Sign In</button>
          <button onClick={() => setMode('signup')} className={`px-3 py-1 rounded ${mode === 'signup' ? 'bg-white/10 text-black' : 'bg-black/60 text-white/80'}`}>Sign Up</button>
          <button onClick={() => setMode('reset')} className={`px-3 py-1 rounded ${mode === 'reset' ? 'bg-white/10 text-black' : 'bg-black/60 text-white/80'}`}>Forgot</button>
        </div>

        {mode === 'signup' && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name (optional)" className="w-full p-3 mb-3 rounded bg-white/3 border border-white/6 text-black placeholder-black/60" />
        )}

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mb-3 rounded bg-white/3 border border-white/6 text-black placeholder-black/60" />
        {mode !== 'reset' && (
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 mb-3 rounded bg-white/3 border border-white/6 text-black placeholder-black/60" />
        )}

        {mode === 'signin' && (
          <>
            <button onClick={handleEmailSignIn} disabled={loading} className="w-full py-3 mb-2 rounded-lg font-bold bg-white-gradient text-black">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button onClick={handleGoogle} className="w-full py-2 mb-2 border border-white/6 rounded-lg glass-panel text-white/80">Sign in with Google</button>
          </>
        )}

        {mode === 'signup' && (
          <button onClick={handleSignUp} disabled={loading} className="w-full py-3 mb-2 rounded-lg font-bold bg-white-gradient text-black">{loading ? 'Creating…' : 'Create account'}</button>
        )}

        {mode === 'reset' && (
          <button onClick={handlePasswordReset} disabled={loading} className="w-full py-3 mb-2 rounded-lg font-bold bg-white-gradient text-black">{loading ? 'Sending…' : 'Send reset email'}</button>
        )}

        <p className="mt-4 text-xs text-white/60">By continuing, you agree to our Terms of Service.</p>
      </div>
    </div>
  );
};

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const init = async () => {
      await authService.handleSessionFromUrl();
      try {
        if (typeof window !== 'undefined') {
          const hash = window.location.hash || window.location.search || '';
          const query = new URLSearchParams(hash.replace(/^#/, '?'));
          const type = query.get('type');
          const accessToken = query.get('access_token');
          if (type === 'recovery' && accessToken) {
            setRecoveryToken(accessToken);
          }
        }
      } catch (e) {
        
      }
      const current = await authService.getCurrentUser();
      if (current) {
        setUser(current);
        setLoading(true);
        try {
          const data = await dbService.getProjects(current.id);
          setProjects(data);
        } catch (err) {
          console.error('Failed to load projects', err);
        } finally {
          setLoading(false);
        }
      }

      unsub = authService.onAuthStateChange(async (u) => {
        setUser(u);
        if (u) {
          setLoading(true);
          try {
            const data = await dbService.getProjects(u.id);
            setProjects(data);
          } catch (err) {
            console.error('Failed to load projects', err);
          } finally {
            setLoading(false);
          }
        } else {
          setProjects([]);
        }
      });
    };

    init();
    return () => unsub && unsub();
  }, []);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    authService.signOut().catch(e => console.error('Sign out failed', e));
    setUser(null);
    setCurrentProject(null);
    setProjects([]);
  };

  const handleChangePassword = async (newPassword: string) => {
    if (!recoveryToken) return;
    try {
      await authService.updatePasswordUsingRecovery(recoveryToken, newPassword);
      const u = await authService.getCurrentUser();
      setUser(u);
      setRecoveryToken(null);
      alert('Password updated. You are now signed in.');
    } catch (e) {
      console.error('Failed to update password', e);
      alert('Failed to update password: ' + (e as any).message);
    }
  };

  const createProject = async (project: Project) => {
    if (!user) return;
    try {
      await dbService.createProject(project, user.id);
      setProjects([project, ...projects]);
      setIsCreating(false);
      setCurrentProject(project);
    } catch (e) {
      alert("Failed to save project to database. Check console for details.");
    }
  };

  const updateProject = async (updated: Project) => {
    const newProjects = projects.map(p => p.id === updated.id ? updated : p);
    setProjects(newProjects);
    setCurrentProject(updated);

    try {
      await dbService.updateProject(updated);
    } catch (e) {
      console.error("Failed to sync update to DB");
      
    }
  };

  const handleGoHome = () => {
    setCurrentProject(null);
    setIsCreating(false);
    window.location.hash = '#/';
  };

  return (
    <HashRouter>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout} onNavigateHome={handleGoHome}>
           {currentProject ? (
             <Editor 
                project={currentProject} 
                onUpdateProject={updateProject} 
                onClose={() => setCurrentProject(null)} 
             />
           ) : isCreating ? (
             <NewProject 
                onCancel={() => setIsCreating(false)} 
                onProjectCreated={createProject} 
             />
           ) : (
             <Dashboard 
                projects={projects} 
                onCreateNew={() => setIsCreating(true)}
                onOpenProject={setCurrentProject}
             />
           )}
           {loading && !currentProject && !isCreating && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/30"></div>
              </div>
           )}
        </Layout>
      )}
      {recoveryToken && (
        <PasswordResetModal onClose={() => setRecoveryToken(null)} onChangePassword={(pw) => handleChangePassword(pw)} />
      )}
    </HashRouter>
  );
}

  // Password Reset Modal component inserted outside App to keep file scoped
  const PasswordResetModal: React.FC<{ onClose: () => void; onChangePassword: (pw: string) => void }>=({ onClose, onChangePassword })=>{
    const [newPw, setNewPw] = React.useState('');
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-black/70 p-6 rounded-lg border border-white/6 w-full max-w-md">
          <h3 className="text-lg font-bold text-white mb-3">Set a new password</h3>
          <input type="password" value={newPw} onChange={(e)=>setNewPw(e.target.value)} placeholder="New password" className="w-full p-3 mb-3 bg-black/60 border border-white/6 rounded text-white" />
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-3 py-2 bg-black/60 rounded">Cancel</button>
            <button onClick={()=>onChangePassword(newPw)} className="px-3 py-2 bg-white-gradient rounded text-black">Save</button>
          </div>
        </div>
      </div>
    );
  };