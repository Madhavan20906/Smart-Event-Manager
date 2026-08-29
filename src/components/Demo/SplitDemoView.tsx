import React, { useState } from 'react';
import { ParticipantDashboard } from '../Participant/ParticipantDashboard';
import { JudgeDashboard } from '../Judge/JudgeDashboard';
import { OrganizerDashboard } from '../Organizer/OrganizerDashboard';
import {
  Attendee,
  Team,
  Submission,
  Score,
  Announcement,
  GraphEvent,
  LeaderboardEntry,
  JoinRequest
} from '../../types';
import { Layers, Users, Award, Shield } from 'lucide-react';

interface SplitDemoViewProps {
  attendees: Attendee[];
  teams: Team[];
  submissions: Submission[];
  scores: Score[];
  announcements: Announcement[];
  events: GraphEvent[];
  leaderboard: LeaderboardEntry[];
  joinRequests: JoinRequest[];
  currentAttendee: Attendee;
  currentJudge: Attendee;
  onVerifyCheckin: (attendeeId: string) => void;
  onRequestJoinTeam: (teamId: string, attendeeId: string) => void;
  onSubmitProject: (payload: any) => void;
  onSubmitScore: (payload: any) => void;
  onCreateAnnouncement: (payload: any) => void;
}

export const SplitDemoView: React.FC<SplitDemoViewProps> = (props) => {
  const [leftTab, setLeftTab] = useState<'participant' | 'judge'>('participant');

  return (
    <div className="max-w-[1700px] mx-auto px-2 lg:px-4 py-4 space-y-4 animate-slide-up">
      {/* Top Banner explaining split view */}
      <div className="bg-gradient-to-r from-card via-surface to-card border border-border/80 rounded-xl p-3 shadow-glass flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-accent/20 text-accent border border-accent/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>90-Second Demo Simulator Mode</span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-accent/20 text-accent font-semibold">
                Side-by-Side Graph Sync
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Perform an action on the left panel (e.g. check-in or submit a score) and watch the right Organizer leaderboard & event graph log update instantly!
            </p>
          </div>
        </div>

        {/* Left Side Role Selector */}
        <div className="flex items-center space-x-2 bg-surface p-1 rounded-lg border border-border">
          <button
            onClick={() => setLeftTab('participant')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              leftTab === 'participant'
                ? 'bg-primary text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Left: Participant</span>
          </button>
          <button
            onClick={() => setLeftTab('judge')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              leftTab === 'judge'
                ? 'bg-primary text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Left: Blind Judge</span>
          </button>
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Side: Client Action View */}
        <div className="bg-background border border-border/80 rounded-2xl p-2 max-h-[85vh] overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 bg-surface/90 backdrop-blur px-3 py-2 border-b border-border/80 text-xs font-mono text-gray-400 flex items-center justify-between z-10 rounded-t-xl">
            <span className="text-primary font-bold flex items-center space-x-1">
              <span>{leftTab === 'participant' ? 'PARTICIPANT NODE ACTION' : 'BLIND JUDGE EVALUATOR'}</span>
            </span>
            <span>Mutates Event Graph</span>
          </div>

          {leftTab === 'participant' ? (
            <ParticipantDashboard
              currentAttendee={props.currentAttendee}
              teams={props.teams}
              submissions={props.submissions}
              announcements={props.announcements}
              joinRequests={props.joinRequests}
              onVerifyCheckin={props.onVerifyCheckin}
              onRequestJoinTeam={props.onRequestJoinTeam}
              onSubmitProject={props.onSubmitProject}
            />
          ) : (
            <JudgeDashboard
              currentJudge={props.currentJudge}
              submissions={props.submissions}
              scores={props.scores}
              teams={props.teams}
              onSubmitScore={props.onSubmitScore}
            />
          )}
        </div>

        {/* Right Side: Organizer Command & Leaderboard */}
        <div className="bg-background border border-border/80 rounded-2xl p-2 max-h-[85vh] overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 bg-surface/90 backdrop-blur px-3 py-2 border-b border-border/80 text-xs font-mono text-gray-400 flex items-center justify-between z-10 rounded-t-xl">
            <span className="text-accent font-bold flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>ORGANIZER REAL-TIME COMMAND CENTER</span>
            </span>
            <span>Live Pub/Sub Subscriber</span>
          </div>

          <OrganizerDashboard
            attendees={props.attendees}
            teams={props.teams}
            submissions={props.submissions}
            scores={props.scores}
            announcements={props.announcements}
            events={props.events}
            leaderboard={props.leaderboard}
            onCreateAnnouncement={props.onCreateAnnouncement}
          />
        </div>
      </div>
    </div>
  );
};
