import React from 'react';
import { Button } from './Button';

interface HeaderProps {
  user: { name: string } | null;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateHome }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-black/80 to-white/5 backdrop-blur-md border-b border-white/6 z-50 flex items-center justify-between px-6 gradient-border">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-black to-white/10 flex items-center justify-center logo-badge">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xl font-bold gradient-text">
          DocuGen AI
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className="text-xs text-white/60">Free Plan</span>
                </div>
            <Button variant="ghost" onClick={onLogout} className="!p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </>
        ) : (
          <span className="text-sm text-white/60">Not Logged In</span>
        )}
      </div>
    </header>
  );
};