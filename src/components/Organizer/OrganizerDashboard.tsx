import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Attendee,
  Team,
  Submission,
  Score,
  Announcement,
  GraphEvent,
  LeaderboardEntry
} from '../../types';
import { expandAnnouncementWithGemini } from '../../services/geminiService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { QRScannerModal } from '../Participant/QRScannerModal';
import {
  Users,
  Shield,
  Trophy,
  Activity,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Terminal,
  Radio,
  FileText,
  Zap,
  HelpCircle,
  AlertTriangle,
  Camera,
  Search,
  Filter,
  QrCode,
  UserCheck,
  Clock,
  X
} from 'lucide-react';

interface OrganizerDashboardProps {
  attendees: Attendee[];
  teams: Team[];
  submissions: Submission[];
  scores: Score[];
  announcements: Announcement[];
  events: GraphEvent[];
  leaderboard: LeaderboardEntry[];
  onCreateAnnouncement: (payload: {
    text: string;
    bulletPoints?: string;
    urgent: boolean;
    targetRole: 'all' | 'participant' | 'judge';
  }) => void;
  onVerifyCheckin?: (identifier: string, status?: 'Verified' | 'Pending') => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  attendees,
  teams,
  submissions,
  scores,
  announcements,
  events,
  leaderboard,
  onCreateAnnouncement,
  onVerifyCheckin,
}) => {
  const [activeOrgTab, setActiveOrgTab] = useState<'leaderboard' | 'attendance'>('leaderboard');
  const [showOrgScannerModal, setShowOrgScannerModal] = useState(false);
  const [attendeeSearchTerm, setAttendeeSearchTerm] = useState('');
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState<'all' | 'Verified' | 'Pending'>('all');
  const [attendeeRoleFilter, setAttendeeRoleFilter] = useState<'all' | 'participant' | 'judge'>('all');
  const [bulletInput, setBulletInput] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [targetRole, setTargetRole] = useState<'all' | 'participant' | 'judge'>('all');
  const [isExpandingAI, setIsExpandingAI] = useState(false);
  const prevRankOneRef = useRef<string | null>(null);

  // Trigger confetti when rank #1 team shifts
  useEffect(() => {
    const topTeam = leaderboard[0]?.teamId;
    if (topTeam && prevRankOneRef.current && prevRankOneRef.current !== topTeam) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.4 },
      });
    }
    prevRankOneRef.current = topTeam || null;
  }, [leaderboard]);

  // Computations for live stat tiles
  const checkedInAttendees = attendees.filter(a => a.checkinStatus === 'Verified').length;
  const capacity = Math.max(10, attendees.length + 2);
  const checkinRate = Math.round((checkedInAttendees / attendees.length) * 100) || 0;
  const engagementRate = Math.round(((teams.length * 2 + checkedInAttendees) / (attendees.length * 2)) * 100) || 0;

  // Chart data for funnel
  const funnelData = [
    { stage: 'Registered', count: attendees.length, fill: '#6366f1' },
    { stage: 'Checked In', count: checkedInAttendees, fill: '#06b6d4' },
    { stage: 'Teams Formed', count: teams.length * 2, fill: '#10b981' },
    { stage: 'Submitted', count: submissions.length, fill: '#f59e0b' },
    { stage: 'Judged', count: submissions.filter(s => s.status === 'Judged').length, fill: '#ec4899' },
  ];

  // Timeline mock data
  const checkinTimelineData = [
    { time: '09:00', checkins: 1 },
    { time: '10:00', checkins: 2 },
    { time: '11:00', checkins: 4 },
    { time: '12:00', checkins: checkedInAttendees },
  ];

  const handleOrgScanSuccess = (code: string) => {
    setShowOrgScannerModal(false);
    if (onVerifyCheckin) {
      onVerifyCheckin(code.trim());
    }
  };

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch =
      !attendeeSearchTerm.trim() ||
      a.name.toLowerCase().includes(attendeeSearchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(attendeeSearchTerm.toLowerCase()) ||
      a.qrCode.toLowerCase().includes(attendeeSearchTerm.toLowerCase());

    const matchesStatus =
      attendeeStatusFilter === 'all' || a.checkinStatus === attendeeStatusFilter;

    const matchesRole =
      attendeeRoleFilter === 'all' || a.role === attendeeRoleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleExpandWithGemini = async () => {
    if (!bulletInput.trim()) return;
    setIsExpandingAI(true);
    try {
      const expanded = await expandAnnouncementWithGemini(bulletInput);
      setAnnouncementText(expanded);
    } catch (err) {
      console.warn('Gemini AI expansion failed:', err);
    } finally {
      setIsExpandingAI(false);
    }
  };

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim() && !bulletInput.trim()) return;
    
    onCreateAnnouncement({
      text: announcementText.trim() || bulletInput.trim(),
      bulletPoints: bulletInput,
      urgent: isUrgent,
      targetRole,
    });

    setBulletInput('');
    setAnnouncementText('');
    setIsUrgent(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-slide-up">
      {/* Camera QR Scanner Modal for Organizer */}
      {showOrgScannerModal && (
        <QRScannerModal
          onScanSuccess={handleOrgScanSuccess}
          onClose={() => setShowOrgScannerModal(false)}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-glow-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Organizer Command Center</h2>
              <p className="text-xs font-mono text-gray-400">
                Real-Time Event Graph Engine • Z-Score Leaderboard • AI Broadcast Hub
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono bg-card px-4 py-2 rounded-xl border border-border">
          <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-ping"></span>
          <span className="text-gray-300">Pub/Sub Listener: <strong className="text-white">Active</strong></span>
        </div>
      </div>

      {/* Organizer Sub-Navigation & Scanner Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setActiveOrgTab('leaderboard')}
            className={`pb-2 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeOrgTab === 'leaderboard'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard & Analytics</span>
          </button>

          <button
            onClick={() => setActiveOrgTab('attendance')}
            className={`pb-2 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeOrgTab === 'attendance'
                ? 'border-accent text-accent font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Attendance Roster</span>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-accent/20 text-accent font-mono font-bold">
              {checkedInAttendees} / {attendees.length} Verified
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowOrgScannerModal(true)}
          aria-label="Scan Attendee QR Badge with Camera"
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-accent to-emerald-600 hover:from-emerald-600 hover:to-accent text-white font-bold text-xs transition-all shadow-glow-accent flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Attendee QR Badge</span>
        </button>
      </div>

      {/* STAT TILES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Check-in Capacity */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-glass space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Check-in Rate</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-sans">{checkedInAttendees}</span>
            <span className="text-xs text-gray-400 font-mono">/ {attendees.length} Verified ({checkinRate}%)</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
              style={{ width: `${checkinRate}%` }}
            ></div>
          </div>
        </div>

        {/* Stat 2: Active Teams */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-glass space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Teams Formed</span>
            <Trophy className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-sans">{teams.length}</span>
            <span className="text-xs text-gray-400 font-mono">Nodes Active</span>
          </div>
          <p className="text-[11px] text-gray-400">
            {teams.reduce((acc, t) => acc + t.memberIds.length, 0)} participants matched in teams
          </p>
        </div>

        {/* Stat 3: Submissions */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-glass space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Submissions & Scores</span>
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-sans">{submissions.length}</span>
            <span className="text-xs text-gray-400 font-mono">({scores.length} score entries)</span>
          </div>
          <p className="text-[11px] text-gray-400">
            {submissions.filter(s => s.status === 'Judged').length} submissions fully normalized
          </p>
        </div>

        {/* Stat 4: Engagement Rate */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-glass space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400">
            <span>Graph Engagement</span>
            <Activity className="w-4 h-4 text-warning" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white font-sans">{engagementRate}%</span>
            <span className="text-xs text-accent font-mono">▲ Active</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
            <div
              className="bg-gradient-to-r from-accent to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${engagementRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION: LEADERBOARD & AI BROADCAST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Normalized Leaderboard OR Attendance Roster */}
        <div className="lg:col-span-2 space-y-6">
          {activeOrgTab === 'attendance' ? (
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-glass space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-accent" />
                    <span>Event Attendance & Check-in Roster</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage entry statuses for all registered graph nodes in real time. Organizers can toggle check-ins or scan QR badges.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-accent/20 text-accent border border-accent/40">
                    {checkedInAttendees} / {attendees.length} Verified ({checkinRate}%)
                  </span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search attendee by name, email, or QR code..."
                      value={attendeeSearchTerm}
                      onChange={e => setAttendeeSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-9 py-2 rounded-xl bg-card border border-border text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-primary"
                    />
                    {attendeeSearchTerm && (
                      <button
                        onClick={() => setAttendeeSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={attendeeStatusFilter}
                      onChange={e => setAttendeeStatusFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-card border border-border text-xs text-gray-200 font-mono focus:outline-none focus:border-primary"
                    >
                      <option value="all">Status: All</option>
                      <option value="Verified">Status: Verified</option>
                      <option value="Pending">Status: Pending</option>
                    </select>

                    <select
                      value={attendeeRoleFilter}
                      onChange={e => setAttendeeRoleFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-card border border-border text-xs text-gray-200 font-mono focus:outline-none focus:border-primary"
                    >
                      <option value="all">Role: All</option>
                      <option value="participant">Role: Participant</option>
                      <option value="judge">Role: Judge</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attendees Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-border/60 text-gray-400 font-mono uppercase text-[11px]">
                      <th className="py-3 px-3">Attendee</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">QR Wallet Code</th>
                      <th className="py-3 px-3">Check-in Status</th>
                      <th className="py-3 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredAttendees.map(att => (
                      <tr key={att.id} className="hover:bg-surface/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={att.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(att.name)}`}
                              alt={att.name}
                              className="w-8 h-8 rounded-full border border-border bg-surface object-cover"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{att.name}</div>
                              <div className="text-[11px] text-gray-400 font-mono">{att.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                            att.role === 'judge' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-primary/20 text-primary border border-primary/30'
                          }`}>
                            {att.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-gray-300">
                          <span className="px-2 py-1 rounded bg-surface border border-border text-[11px]">
                            {att.qrCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          {att.checkinStatus === 'Verified' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/40">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/20 text-warning border border-warning/40">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => onVerifyCheckin && onVerifyCheckin(att.id)}
                            aria-label={`Toggle checkin for ${att.name}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                              att.checkinStatus === 'Verified'
                                ? 'bg-surface hover:bg-surface-hover border border-border text-gray-300'
                                : 'bg-accent hover:bg-emerald-600 text-white shadow-glow-accent'
                            }`}
                          >
                            {att.checkinStatus === 'Verified' ? 'Mark Pending' : 'Verify Check-in'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-glass space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">Normalized Live Leaderboard</h3>
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-primary/20 text-primary border border-primary/30">
                    Z-Score Aggregated
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Rankings update in real time on every judge score submission. Score variance across judges is normalized.
                </p>
              </div>

              <span className="text-xs font-mono text-accent">
                Subscribed to Pub/Sub Graph
              </span>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-border/60 text-gray-400 font-mono uppercase text-[11px]">
                    <th className="py-3 px-2">Rank</th>
                    <th className="py-3 px-4">Team Code</th>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-3 text-center">Judges</th>
                    <th className="py-3 px-3 text-right">Raw Avg</th>
                    <th className="py-3 px-4 text-right">Z-Score Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {leaderboard.map(entry => (
                    <tr
                      key={entry.teamId}
                      className="hover:bg-surface/80 transition-colors group"
                    >
                      {/* Rank with momentum */}
                      <td className="py-4 px-2 font-mono font-bold text-sm">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                              entry.rank === 1
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                                : entry.rank === 2
                                ? 'bg-gray-300/20 text-gray-200 border border-gray-400/40 font-bold'
                                : entry.rank === 3
                                ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40 font-bold'
                                : 'text-gray-400'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          {entry.rank === 1 ? (
                            <TrendingUp className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </div>
                      </td>

                      {/* Team Code */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 rounded bg-surface border border-border text-primary font-bold">
                            {entry.teamCode}
                          </span>
                          {entry.scores.some(s => s.isOutlier) && (
                            <span
                              title={entry.scores.find(s => s.isOutlier)?.outlierNote || 'Outlier score flagged'}
                              className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-danger/20 text-danger border border-danger/40 flex items-center space-x-1 animate-pulse"
                            >
                              <AlertTriangle className="w-3 h-3 text-danger" />
                              <span>AI Outlier Flagged</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Project Title & AI Tooltip Summary */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">
                          {entry.projectTitle}
                        </div>
                        {entry.aiSummary && (
                          <div className="mt-1 text-[11px] text-secondary font-mono flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-secondary flex-shrink-0" />
                            <span className="truncate max-w-xs">{entry.aiSummary}</span>
                          </div>
                        )}
                      </td>

                      {/* Judge Count */}
                      <td className="py-4 px-3 text-center font-mono text-gray-300">
                        {entry.judgeCount} evaluation(s)
                      </td>

                      {/* Raw Score Avg */}
                      <td className="py-4 px-3 text-right font-mono text-gray-400">
                        {entry.rawAverage > 0 ? `${entry.rawAverage} / 40` : '—'}
                      </td>

                      {/* Z-Score Avg */}
                      <td className="py-4 px-4 text-right font-mono font-bold text-sm">
                        {entry.judgeCount > 0 ? (
                          <span
                            className={`px-2.5 py-1 rounded-lg border ${
                              entry.zScoreAverage > 0
                                ? 'bg-accent/15 text-accent border-accent/30'
                                : 'bg-warning/15 text-warning border-warning/30'
                            }`}
                          >
                            {entry.zScoreAverage > 0 ? `+${entry.zScoreAverage}` : entry.zScoreAverage}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Awaiting Scores</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics Funnel & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-glass space-y-4">
              <h4 className="text-sm font-mono font-bold text-gray-300 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Event Conversion Funnel</span>
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="stage" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={90} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-glass space-y-4">
              <h4 className="text-sm font-mono font-bold text-gray-300 flex items-center space-x-2">
                <Users className="w-4 h-4 text-secondary" />
                <span>Check-in Velocity Curve</span>
              </h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={checkinTimelineData}>
                    <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="checkins" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Right Col: AI Broadcast Composer & Live Event Graph Mutation Terminal */}
        <div className="space-y-6">
          {/* AI Broadcast Composer */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-glass space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Broadcast Composer</h3>
            </div>

            <form onSubmit={handlePublishBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Step 1: Type Bullet Points
                </label>
                <textarea
                  rows={2}
                  placeholder="- Submissions deadline extended by 15 mins&#10;- Mentors available at Table 2"
                  value={bulletInput}
                  onChange={e => setBulletInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handleExpandWithGemini}
                disabled={isExpandingAI || !bulletInput.trim()}
                aria-label="Expand raw bullet points with Gemini AI"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white text-xs font-bold transition-all shadow-glow-primary flex items-center justify-center space-x-1.5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExpandingAI ? 'Expanding with Gemini AI...' : 'Expand Bullets with Gemini AI'}</span>
              </button>

              <div>
                <label htmlFor="final-broadcast-textarea" className="block text-xs font-mono text-gray-300 mb-1">
                  Step 2: Final Broadcast Text
                </label>
                <textarea
                  id="final-broadcast-textarea"
                  rows={3}
                  required
                  placeholder="Final broadcast announcement message..."
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center space-x-2 text-xs font-mono text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={e => setIsUrgent(e.target.checked)}
                    aria-label="Mark announcement as urgent banner"
                    className="accent-danger rounded focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <span className={isUrgent ? 'text-danger font-bold' : ''}>Mark as Urgent Banner</span>
                </label>

                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value as 'all' | 'participant' | 'judge')}
                  aria-label="Target role selection for broadcast announcement"
                  className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-gray-200 font-mono focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="all">Target: All Roles</option>
                  <option value="participant">Target: Participants</option>
                  <option value="judge">Target: Judges</option>
                </select>
              </div>

              <button
                type="submit"
                aria-label="Publish announcement to live graph"
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-glow-primary flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Announcement Node</span>
              </button>
            </form>
          </div>

          {/* Real-time Event Graph Terminal Stream */}
          <div className="bg-surface/90 border border-border/80 rounded-2xl p-5 shadow-glass space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Terminal className="w-4 h-4 text-accent" />
                <span className="font-bold">Live Graph Event Log</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded bg-accent/20 text-accent">
                {events.length} Events Streamed
              </span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 text-[11px] pr-2 scrollbar-thin">
              {events.slice(0, 15).map(evt => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-card/80 border border-border/50 text-gray-300 space-y-1 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                      {evt.type}
                    </span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-200 leading-snug">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
