import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Attendee, Team, Submission, Announcement, JoinRequest } from '../../types';
import { calculateSkillMatch } from '../../utils/math';
import {
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  UserPlus,
  Send,
  Bell,
  AlertTriangle,
  ExternalLink,
  Code2,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ParticipantDashboardProps {
  currentAttendee: Attendee;
  teams: Team[];
  submissions: Submission[];
  announcements: Announcement[];
  joinRequests: JoinRequest[];
  onVerifyCheckin: (attendeeId: string) => void;
  onRequestJoinTeam: (teamId: string, attendeeId: string) => void;
  onSubmitProject: (payload: {
    teamId: string;
    projectTitle: string;
    description: string;
    demoUrl: string;
    githubUrl: string;
  }) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  currentAttendee,
  teams,
  submissions,
  announcements,
  joinRequests,
  onVerifyCheckin,
  onRequestJoinTeam,
  onSubmitProject,
}) => {
  const [activeTab, setActiveTab] = useState<'discovery' | 'submission' | 'announcements'>('discovery');
  const [submissionForm, setSubmissionForm] = useState({
    projectTitle: '',
    description: '',
    demoUrl: '',
    githubUrl: '',
  });

  const myTeam = teams.find(t => t.id === currentAttendee.teamId || t.memberIds.includes(currentAttendee.id));
  const mySubmission = submissions.find(s => s.teamId === myTeam?.id);

  // Skill-Vector Matchmaking calculation for all teams
  const rankedTeams = teams.map(team => {
    const match = calculateSkillMatch(currentAttendee.skills, team.skillGaps);
    const hasRequested = joinRequests.some(r => r.teamId === team.id && r.attendeeId === currentAttendee.id);
    const isMember = team.memberIds.includes(currentAttendee.id);
    return {
      ...team,
      matchPercentage: match.matchPercentage,
      matchingSkills: match.matchingSkills,
      missingGaps: match.missingGaps,
      hasRequested,
      isMember,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const handleSubmitProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam) return;
    onSubmitProject({
      teamId: myTeam.id,
      projectTitle: submissionForm.projectTitle || mySubmission?.projectTitle || 'My EventPulse Demo',
      description: submissionForm.description || mySubmission?.description || 'Built using EventPulse real-time event graph.',
      demoUrl: submissionForm.demoUrl || mySubmission?.demoUrl || 'https://eventpulse.live/demo',
      githubUrl: submissionForm.githubUrl || mySubmission?.githubUrl || 'https://github.com/eventpulse/demo',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-slide-up">
      {/* Top Banner: Welcome & QR Check-in Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendee Profile & Status */}
        <div className="lg:col-span-2 bg-gradient-to-br from-card to-surface border border-border/80 rounded-2xl p-6 shadow-glass relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow-primary">
                <img
                  src={currentAttendee.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentAttendee.name}`}
                  alt={currentAttendee.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{currentAttendee.name}</h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                    Participant Node
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-mono mt-0.5">{currentAttendee.email}</p>
              </div>
            </div>

            {/* Skill Tags */}
            <div className="mb-4">
              <span className="text-xs font-mono text-gray-400 block mb-2">My Skill Vector:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentAttendee.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono rounded-lg bg-surface-hover border border-border text-gray-200"
                  >
                    ⚡ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Status Card */}
          <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-gray-400">Node Status:</span>
              {currentAttendee.checkinStatus === 'Verified' ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/40 shadow-glow-accent">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Attendee</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning/20 text-warning border border-warning/40">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Pending Entry Scan</span>
                </span>
              )}
            </div>

            {myTeam && (
              <div className="text-xs font-mono text-gray-300">
                Team Node: <strong className="text-primary">{myTeam.code} ({myTeam.name})</strong>
              </div>
            )}
          </div>
        </div>

        {/* QR Check-in Wallet Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-glass flex flex-col items-center justify-center text-center space-y-4 relative">
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <QrCode className="w-4 h-4 text-primary" />
            <span>ENTRY WALLET QR</span>
          </div>

          <div className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer">
            <QRCodeSVG
              value={currentAttendee.qrCode}
              size={120}
              level="H"
              includeMargin={true}
            />
          </div>

          <p className="text-[11px] font-mono text-gray-400">
            ID: <span className="text-gray-200">{currentAttendee.qrCode}</span>
          </p>

          {/* Interactive Check-in Trigger for Live Demo */}
          {currentAttendee.checkinStatus === 'Pending' ? (
            <button
              onClick={() => onVerifyCheckin(currentAttendee.id)}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-accent to-emerald-600 hover:from-emerald-600 hover:to-accent text-white font-semibold text-xs transition-all shadow-glow-accent flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Scan & Verify Entry</span>
            </button>
          ) : (
            <div className="w-full py-2 px-4 rounded-xl bg-accent/10 border border-accent/30 text-accent font-semibold text-xs flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Checked-in Live in Event Graph</span>
            </div>
          )}
        </div>
      </div>

      {/* Urgent Announcement Alert Banner */}
      {announcements.some(a => a.urgent) && (
        <div className="bg-gradient-to-r from-danger/20 via-danger/10 to-card border border-danger/50 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-danger/20 text-danger">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-danger uppercase tracking-wider block">
                Urgent Broadcast Event
              </span>
              <p className="text-sm font-medium text-white">
                {announcements.find(a => a.urgent)?.text}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-400 whitespace-nowrap hidden md:inline">
            Live Stream
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-border/80 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('discovery')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'discovery'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Skill-Vector Team Matchmaker</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
            {rankedTeams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submission')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'submission'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>My Submission Node</span>
          {mySubmission && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
              {mySubmission.status}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'announcements'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements Stream</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-surface-hover text-gray-300">
            {announcements.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Skill-Vector Matchmaker */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-xl border border-border">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Vector Cosine Skill Matchmaker</span>
                <span className="text-xs font-mono font-normal text-secondary px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                  Cosine Similarity Ranked
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Teams are automatically sorted by mathematical compatibility with your skill vector.
              </p>
            </div>

            <div className="text-xs font-mono text-gray-300 bg-surface px-3 py-1.5 rounded-lg border border-border">
              Your Skills: <span className="text-accent">{currentAttendee.skills.join(', ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rankedTeams.map(team => (
              <div
                key={team.id}
                className="bg-card border border-border hover:border-primary/50 transition-all rounded-2xl p-6 shadow-glass flex flex-col justify-between relative group"
              >
                {/* Match % Badge */}
                <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/40 text-primary shadow-glow-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{team.matchPercentage}% FIT MATCH</span>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-surface border border-border text-gray-300">
                      {team.code}
                    </span>
                    <span className="text-xs font-mono text-secondary px-2 py-0.5 rounded bg-secondary/10">
                      {team.tag}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                    {team.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 mb-4 italic">
                    "{team.tagline}"
                  </p>

                  {/* Skill Alignment breakdown */}
                  <div className="space-y-2 mb-6">
                    <div>
                      <span className="text-[11px] font-mono text-gray-400 block mb-1">
                        Matching Skills You Supply:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.matchingSkills.length > 0 ? (
                          team.matchingSkills.map((sk, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs font-mono rounded bg-accent/20 border border-accent/40 text-accent font-medium"
                            >
                              ✓ {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No direct overlap yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-gray-400 block mb-1">
                        Open Skill Gaps Needed:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.missingGaps.map((gap, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs font-mono rounded bg-warning/10 border border-warning/30 text-warning"
                          >
                            Need: {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">
                    Members: {team.memberIds.length} enrolled
                  </span>

                  {team.isMember ? (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                      Current Member
                    </span>
                  ) : team.hasRequested ? (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-surface-hover text-gray-300 border border-border">
                      Request Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => onRequestJoinTeam(team.id, currentAttendee.id)}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-glow-primary flex items-center space-x-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Request to Join Node</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: My Submission Node */}
      {activeTab === 'submission' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-glass max-w-3xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-primary" />
              <span>Team Submission Node</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Submissions directly update the event graph node. Judges will evaluate your project anonymously via team code {myTeam?.code || 'TEAM-01'}.
            </p>
          </div>

          {mySubmission && (
            <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">Current Node Status:</span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-accent/20 text-accent border border-accent/40">
                  {mySubmission.status}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">{mySubmission.projectTitle}</h4>
              <p className="text-xs text-gray-300">{mySubmission.description}</p>
              <div className="flex items-center space-x-4 pt-2 text-xs font-mono text-primary">
                <a href={mySubmission.demoUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Demo Link</span>
                </a>
                <a href={mySubmission.githubUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:underline">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitProjectForm} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Project Title</label>
              <input
                type="text"
                required
                placeholder="e.g. EventPulse — Real-time Live Event Graph"
                value={submissionForm.projectTitle}
                onChange={e => setSubmissionForm({ ...submissionForm, projectTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1">Project Description</label>
              <textarea
                rows={3}
                required
                placeholder="Briefly describe your solution architecture and key innovations..."
                value={submissionForm.description}
                onChange={e => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Live Demo URL</label>
                <input
                  type="url"
                  placeholder="https://my-demo.live"
                  value={submissionForm.demoUrl}
                  onChange={e => setSubmissionForm({ ...submissionForm, demoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/my-team/repo"
                  value={submissionForm.githubUrl}
                  onChange={e => setSubmissionForm({ ...submissionForm, githubUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-glow-primary flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Mutate Graph Node — Submit Project</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Announcements Stream */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 max-w-4xl">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all ${
                ann.urgent
                  ? 'bg-gradient-to-r from-danger/20 via-card to-card border-danger/60 shadow-lg'
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Bell className={`w-4 h-4 ${ann.urgent ? 'text-danger animate-bounce' : 'text-primary'}`} />
                  <span className="text-xs font-mono font-bold text-gray-300">{ann.author}</span>
                  {ann.urgent && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-danger/20 text-danger border border-danger/40">
                      URGENT
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-100 font-sans leading-relaxed">{ann.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
