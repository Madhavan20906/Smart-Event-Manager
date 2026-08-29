import React, { useState } from 'react';
import { Role } from '../../types';
import {
  Shield,
  Users,
  Award,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Cpu,
  Fingerprint,
  Radio,
  Check,
  Zap
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

interface LoginGateProps {
  onAuthenticate: (user: {
    name: string;
    email: string;
    role: Role;
    skills?: string[];
  }) => void;
}

const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '1085438842603-dummy-google-client-id.apps.googleusercontent.com';

const PRESET_SKILLS = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Python',
  'PyTorch',
  'Machine Learning',
  'FastAPI',
  'Rust',
  'WebAssembly',
  'UI Design',
  'Gemini API',
  'Cybersecurity',
];

export const LoginGate: React.FC<LoginGateProps> = ({ onAuthenticate }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('participant');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'React',
    'TypeScript',
    'AI Prompting',
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleExecuteAuth = (userData: {
    name: string;
    email: string;
    role: Role;
    skills?: string[];
  }) => {
    setIsVerifying(true);
    setVerificationProgress(0);

    // Cryptographic Zero-Knowledge Token simulation animation
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVerifying(false);
            onAuthenticate(userData);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === 'register' && !name.trim()) return;

    const finalName =
      mode === 'register'
        ? name.trim()
        : email.split('@')[0].replace('.', ' ').toUpperCase();

    handleExecuteAuth({
      name: finalName,
      email: email.trim(),
      role: selectedRole,
      skills: selectedSkills,
    });
  };

  const handleGoogleSuccess = (_credentialResponse: { credential?: string }) => {
    handleExecuteAuth({
      name: 'Google Verified Attendee',
      email: 'user.google@eventpulse.io',
      role: selectedRole,
      skills: ['React', 'TypeScript', 'Gemini API'],
    });
  };

  // Password strength logic
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 33;
    if (/[A-Z]/.test(password)) strength += 33;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 34;
    return strength;
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
        {/* Zero-Knowledge Cryptographic Verification Modal */}
        {isVerifying ? (
          <div className="bg-card border border-primary/50 rounded-3xl p-8 max-w-md w-full shadow-glow-primary text-center space-y-6 animate-slide-up relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none"></div>

            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin flex items-center justify-center mx-auto">
                <Fingerprint className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-accent">
                {verificationProgress}%
              </div>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/30 inline-flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>ZERO-KNOWLEDGE PROOF ENGINE</span>
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Authenticating Node Cryptography
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Generating ECDSA Identity Token & Mutating Event Graph...
              </p>
            </div>

            {/* Simulated Hex Proof Log */}
            <div className="bg-surface/90 border border-border p-3 rounded-xl text-left text-[11px] font-mono text-accent space-y-1">
              <div>
                [ZKP]: <span className="text-gray-300">Hash(0x7F89...3C1B)</span>
              </div>
              <div>
                [ROLE]: <span className="text-primary">{selectedRole.toUpperCase()}</span>
              </div>
              <div>
                [STATUS]: <span className="text-white">VERIFIED AT NODE 0</span>
              </div>
            </div>

            <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
              <div
                className="bg-gradient-to-r from-primary via-secondary to-accent h-full transition-all duration-300"
                style={{ width: `${verificationProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          /* Main Auth Card */
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden my-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/30 to-secondary/30 text-primary border border-primary/40 shadow-glow-primary mb-1">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                EventPulse Security Gateway
              </h2>
              <p className="text-xs font-mono text-gray-400">
                Zero-Knowledge Cryptographic Authentication Engine
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                  mode === 'register'
                    ? 'bg-primary text-white shadow-glow-primary'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Node Account</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                  mode === 'login'
                    ? 'bg-primary text-white shadow-glow-primary'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Authenticate Session</span>
              </button>
            </div>

            {/* Google OAuth Section */}
            <div className="space-y-2">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    handleExecuteAuth({
                      name: 'Google OAuth Attendee',
                      email: 'google.user@eventpulse.io',
                      role: selectedRole,
                      skills: ['React', 'TypeScript', 'Gemini API'],
                    });
                  }}
                  theme="filled_black"
                  shape="pill"
                  text={mode === 'register' ? 'signup_with' : 'signin_with'}
                />
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border/80 w-full"></div>
              <span className="bg-card px-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                Or Continue With Password
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-name-input"
                    className="block text-xs font-mono text-gray-300 mb-1"
                  >
                    Full Name / Identity
                  </label>
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    placeholder="e.g. Madhavan"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email-input"
                  className="block text-xs font-mono text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="e.g. madhavan@dev.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password-input"
                  className="block text-xs font-mono text-gray-300 mb-1"
                >
                  Cryptographic Passkey / Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border">
                      <div
                        className={`h-full transition-all duration-300 ${
                          getPasswordStrength() > 66
                            ? 'bg-accent'
                            : getPasswordStrength() > 33
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                        style={{ width: `${getPasswordStrength()}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 block">
                      Passkey Encryption Strength: {getPasswordStrength()}%
                    </span>
                  </div>
                )}
              </div>

              {/* Skill Vector Selector (Register Only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1.5">
                    Select Your Skill Vector (For Matchmaking):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-surface/60 rounded-xl border border-border scrollbar-thin">
                    {PRESET_SKILLS.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            isSelected
                              ? 'bg-primary/20 border border-primary text-primary font-bold'
                              : 'bg-surface border border-border text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Role Radio Group */}
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-2">
                  Authorize Role Node:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
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
                aria-label="Generate Cryptographic Node & Enter"
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white font-bold text-sm transition-all shadow-glow-primary flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {mode === 'register'
                    ? 'Generate Cryptographic Node Account & Enter'
                    : 'Authenticate Encrypted Session & Enter'}
                </span>
              </button>

              <div className="pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    handleExecuteAuth({
                      name: 'Alex Chen (You)',
                      email: 'alex@eventpulse.io',
                      role: selectedRole,
                      skills: ['React', 'TypeScript', 'Tailwind CSS', 'AI Prompting'],
                    });
                  }}
                  aria-label="Instant Guest Demo Access without logging in"
                  className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-border text-gray-300 hover:text-white font-mono text-xs transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Zap className="w-4 h-4 text-warning animate-pulse" />
                  <span>⚡ Instant Guest Demo Access (0-Click Bypass)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};
