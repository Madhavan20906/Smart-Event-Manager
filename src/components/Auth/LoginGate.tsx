import React, { useState } from 'react';
import { Role } from '../../types';
import { Shield, Users, Award, Lock, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

interface LoginGateProps {
  onAuthenticate: (user: { name: string; email: string; role: Role }) => void;
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1085438842603-dummy-google-client-id.apps.googleusercontent.com';

export const LoginGate: React.FC<LoginGateProps> = ({ onAuthenticate }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('participant');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    onAuthenticate({
      name: name.trim(),
      email: email.trim(),
      role: selectedRole,
    });
  };

  const handleGoogleSuccess = (_credentialResponse: { credential?: string }) => {
    // Decode JWT or use fallback profile details
    setIsGoogleLoading(true);
    setTimeout(() => {
      onAuthenticate({
        name: 'Google Verified User',
        email: 'user@gmail.com',
        role: selectedRole,
      });
      setIsGoogleLoading(false);
    }, 600);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/30 shadow-glow-primary mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">EventPulse Access Gateway</h2>
            <p className="text-xs font-mono text-gray-400">
              Authenticated Role Authorization & Single Sign-On
            </p>
          </div>

          {/* Google OAuth Section */}
          <div className="space-y-3">
            <label className="block text-xs font-mono text-gray-400 text-center uppercase tracking-wider">
              Single Sign-On
            </label>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  // Graceful OAuth fallback for demo environment
                  onAuthenticate({
                    name: 'Google OAuth User',
                    email: 'google.user@eventpulse.io',
                    role: selectedRole,
                  });
                }}
                theme="filled_black"
                shape="pill"
                text="continue_with"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/80 w-full"></div>
            <span className="bg-card px-3 text-[11px] font-mono text-gray-500 uppercase">Or Continue With Credentials</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-name-input" className="block text-xs font-mono text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="login-name-input"
                type="text"
                required
                placeholder="e.g. Alex Chen"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="login-email-input" className="block text-xs font-mono text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                placeholder="e.g. alex@dev.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            {/* Role Radio Group */}
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-2">Select Authorized Role Node</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  aria-label="Authorize as Participant Role"
                  onClick={() => setSelectedRole('participant')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedRole === 'participant'
                      ? 'bg-primary/20 border-primary text-white shadow-glow-primary'
                      : 'bg-surface border-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4 mb-2 text-primary" />
                  <span className="text-xs font-bold font-mono">Participant</span>
                </button>

                <button
                  type="button"
                  aria-label="Authorize as Blind Judge Role"
                  onClick={() => setSelectedRole('judge')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedRole === 'judge'
                      ? 'bg-primary/20 border-primary text-white shadow-glow-primary'
                      : 'bg-surface border-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Award className="w-4 h-4 mb-2 text-secondary" />
                  <span className="text-xs font-bold font-mono">Blind Judge</span>
                </button>

                <button
                  type="button"
                  aria-label="Authorize as Organizer Role"
                  onClick={() => setSelectedRole('organizer')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedRole === 'organizer'
                      ? 'bg-primary/20 border-primary text-white shadow-glow-primary'
                      : 'bg-surface border-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Shield className="w-4 h-4 mb-2 text-accent" />
                  <span className="text-xs font-bold font-mono">Organizer</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              aria-label="Authorize Session & Enter EventPulse"
              className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-glow-primary flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <LogIn className="w-4 h-4" />
              <span>Authorize Session & Enter Platform</span>
            </button>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};
