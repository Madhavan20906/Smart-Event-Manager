import React, { useEffect, useState } from 'react';
import { eventGraphStore, EventGraphState } from './services/eventGraphStore';
import { Navbar } from './components/Navbar';
import { ParticipantDashboard } from './components/Participant/ParticipantDashboard';
import { JudgeDashboard } from './components/Judge/JudgeDashboard';
import { OrganizerDashboard } from './components/Organizer/OrganizerDashboard';
import { SplitDemoView } from './components/Demo/SplitDemoView';
import { Toast } from './components/UI/Toast';
import { LoginGate } from './components/Auth/LoginGate';
import { GraphEvent, Role } from './types';
import { Activity, ShieldCheck, Radio } from 'lucide-react';

const AUTH_STORAGE_KEY = 'EVENTPULSE_AUTH_USER_V1';

export const App: React.FC = () => {
  const [storeState, setStoreState] = useState<EventGraphState>(eventGraphStore.getState());
  const [latestToastEvent, setLatestToastEvent] = useState<GraphEvent | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    name: string;
    email: string;
    role: Role;
    skills?: string[];
  } | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn('Failed to parse auth user from storage:', err);
    }
    return null;
  });

  useEffect(() => {
    const unsubscribe = eventGraphStore.subscribe((newState) => {
      setStoreState({ ...newState });
      if (newState.events.length > 0) {
        setLatestToastEvent(newState.events[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync saved auth user into store on mount
  useEffect(() => {
    if (authenticatedUser) {
      eventGraphStore.registerOrLoginUser(authenticatedUser);
    }
  }, []);

  // Keyboard shortcut listener gated behind VITE_DEMO_MODE=true env flag
  useEffect(() => {
    const isDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && isDemoMode) {
        if (e.key === '1') eventGraphStore.setActiveRole('participant');
        if (e.key === '2') eventGraphStore.setActiveRole('judge');
        if (e.key === '3') eventGraphStore.setActiveRole('organizer');
        if (e.key === '4') eventGraphStore.setActiveRole('demo');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuthenticate = (user: {
    name: string;
    email: string;
    role: Role;
    skills?: string[];
  }) => {
    setAuthenticatedUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to save auth user to storage:', err);
    }
    eventGraphStore.registerOrLoginUser(user);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear auth storage:', err);
    }
  };

  const currentAttendee =
    storeState.attendees.find(a => a.id === storeState.currentUserId) || storeState.attendees[0];
  const currentJudge =
    storeState.attendees.find(a => a.id === 'att-3') || storeState.attendees[2]; // Marcus Vance
  const leaderboard = eventGraphStore.getLeaderboard();
  const checkedInCount = storeState.attendees.filter(a => a.checkinStatus === 'Verified').length;

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Login Gate Authorization Check */}
      {!authenticatedUser ? (
        <LoginGate onAuthenticate={handleAuthenticate} />
      ) : (
        <>
          {/* Top Header Navigation */}
          <Navbar
            activeRole={storeState.activeRole}
            onRoleChange={(role: Role) => eventGraphStore.setActiveRole(role)}
            eventCount={storeState.events.length}
            onResetData={() => eventGraphStore.resetStore()}
            checkedInCount={checkedInCount}
            totalAttendees={storeState.attendees.length}
            currentUser={currentAttendee}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 pb-12">
        {storeState.activeRole === 'participant' && (
          <ParticipantDashboard
            currentAttendee={currentAttendee}
            teams={storeState.teams}
            submissions={storeState.submissions}
            announcements={storeState.announcements}
            joinRequests={storeState.joinRequests}
            onVerifyCheckin={id => eventGraphStore.verifyCheckin(id)}
            onRequestJoinTeam={(tId, aId) => eventGraphStore.requestJoinTeam(tId, aId)}
            onSubmitProject={payload => eventGraphStore.updateSubmission(payload)}
          />
        )}

        {storeState.activeRole === 'judge' && (
          <JudgeDashboard
            currentJudge={currentJudge}
            submissions={storeState.submissions}
            scores={storeState.scores}
            teams={storeState.teams}
            onSubmitScore={payload => eventGraphStore.submitScore(payload)}
          />
        )}

        {storeState.activeRole === 'organizer' && (
          <OrganizerDashboard
            attendees={storeState.attendees}
            teams={storeState.teams}
            submissions={storeState.submissions}
            scores={storeState.scores}
            announcements={storeState.announcements}
            events={storeState.events}
            leaderboard={leaderboard}
            onCreateAnnouncement={payload => eventGraphStore.createAnnouncement(payload)}
          />
        )}

        {storeState.activeRole === 'demo' && (
          <SplitDemoView
            attendees={storeState.attendees}
            teams={storeState.teams}
            submissions={storeState.submissions}
            scores={storeState.scores}
            announcements={storeState.announcements}
            events={storeState.events}
            leaderboard={leaderboard}
            joinRequests={storeState.joinRequests}
            currentAttendee={currentAttendee}
            currentJudge={currentJudge}
            onVerifyCheckin={id => eventGraphStore.verifyCheckin(id)}
            onRequestJoinTeam={(tId, aId) => eventGraphStore.requestJoinTeam(tId, aId)}
            onSubmitProject={payload => eventGraphStore.updateSubmission(payload)}
            onSubmitScore={payload => eventGraphStore.submitScore(payload)}
            onCreateAnnouncement={payload => eventGraphStore.createAnnouncement(payload)}
          />
        )}
      </main>

      {/* Real-Time Event Mutation Toast */}
      <Toast event={latestToastEvent} onClose={() => setLatestToastEvent(null)} />

      {/* Footer */}
      <footer className="border-t border-border/80 bg-surface/50 py-6 px-4 text-center text-xs font-mono text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>EventPulse — Real-Time Live Event Graph Management Engine</span>
          </div>

          <div className="flex items-center space-x-4 text-gray-400">
            <span className="px-2 py-0.5 rounded bg-card border border-border text-[11px]">
              Shortcut: Alt+1 (Part) • Alt+2 (Judge) • Alt+3 (Org) • Alt+4 (Split)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Z-Score Normalized & Blind Evaluated</span>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
};
