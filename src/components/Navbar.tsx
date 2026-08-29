import React from 'react';
import { Role, Attendee } from '../types';
import { Activity, Shield, Users, Award, Radio, RefreshCw, Layers, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  eventCount: number;
  onResetData: () => void;
  checkedInCount: number;
  totalAttendees: number;
  currentUser?: Attendee;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onRoleChange,
  eventCount,
  onResetData,
  checkedInCount,
  totalAttendees,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Logo & Graph Indicator */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-glow-primary">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Pulse</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                LIVE GRAPH
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 hidden sm:inline-flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>ANTIGRAVITY AI ENGINE</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono hidden sm:block">
              Single Event Graph • Zero Polling • Pub/Sub Engine
            </p>
          </div>
        </div>

        {/* Live Status & Role Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Active Authenticated Node User Badge */}
          {currentUser && (
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs shadow-sm">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20 border border-primary/30 shrink-0">
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                  alt={`Avatar image for logged in user ${currentUser.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white font-sans truncate max-w-[120px]">{currentUser.name}</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Logout & Switch Account Node"
                  aria-label="Logout and switch authenticated identity node"
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-danger/15 hover:bg-danger/30 border border-danger/40 text-danger-light text-[11px] font-mono font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary ml-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}

          {/* Live Node Mutation Counter */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-mono text-gray-300">
            <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>Mutations: <strong className="text-white">{eventCount}</strong></span>
          </div>

          {/* Quick Check-in Ratio */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-mono text-gray-300">
            <span>Check-ins: <strong className="text-accent">{checkedInCount}/{totalAttendees}</strong></span>
          </div>

          {/* Role Navigation Pills */}
          <nav className="flex items-center p-1 rounded-xl bg-card border border-border shadow-inner">
            <button
              onClick={() => onRoleChange('participant')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'participant'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Participant</span>
            </button>

            <button
              onClick={() => onRoleChange('judge')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'judge'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Blind Judge</span>
            </button>

            <button
              onClick={() => onRoleChange('organizer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'organizer'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Organizer</span>
            </button>

            <button
              onClick={() => onRoleChange('demo')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRole === 'demo'
                  ? 'bg-gradient-to-r from-secondary to-accent text-white font-semibold shadow-glow-accent'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Demo Split</span>
            </button>
          </nav>

          {/* Reset Baseline Seed Data Button */}
          <button
            onClick={onResetData}
            title="Reset Event Graph to Baseline Seed Data"
            aria-label="Reset Event Graph to Baseline Seed Data"
            className="p-2 rounded-lg bg-card border border-border text-gray-400 hover:text-white hover:bg-surface-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
