import {
  Attendee,
  Team,
  Submission,
  Score,
  Announcement,
  GraphEvent,
  Role,
  JoinRequest,
  LeaderboardEntry
} from '../types';
import { recalibrateJudgeScores, calculateSkillMatch } from '../utils/math';

const STORAGE_KEY = 'EVENTPULSE_GRAPH_STORE_V1';
const BROADCAST_CHANNEL_NAME = 'EVENTPULSE_MUTATION_CHANNEL';

export interface EventGraphState {
  attendees: Attendee[];
  teams: Team[];
  submissions: Submission[];
  scores: Score[];
  announcements: Announcement[];
  events: GraphEvent[];
  joinRequests: JoinRequest[];
  currentUserId: string;
  activeRole: Role;
}

const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: 'att-1',
    name: 'Alex Chen (You)',
    email: 'alex@dev.io',
    role: 'participant',
    skills: ['React', 'TypeScript', 'Tailwind', 'AI Prompting', 'Figma'],
    checkinStatus: 'Pending',
    qrCode: 'EVTP-ATT-1-ALEX-CHEN-2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'att-2',
    name: 'Elena Rostova',
    email: 'elena@cyber.net',
    role: 'participant',
    skills: ['Python', 'PyTorch', 'FastAPI', 'Machine Learning'],
    checkinStatus: 'Verified',
    qrCode: 'EVTP-ATT-2-ELENA-R-2026',
    teamId: 'team-1',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'att-3',
    name: 'Marcus Vance',
    email: 'marcus@judge.org',
    role: 'judge',
    skills: ['System Design', 'Security', 'Cloud Architecture'],
    checkinStatus: 'Verified',
    qrCode: 'EVTP-ATT-3-MARCUS-2026',
  },
  {
    id: 'att-4',
    name: 'Sarah Jenkins',
    email: 'sarah@judge.org',
    role: 'judge',
    skills: ['UX Engineering', 'Product Design', 'Product Strategy'],
    checkinStatus: 'Verified',
    qrCode: 'EVTP-ATT-4-SARAH-2026',
  },
  {
    id: 'att-5',
    name: 'Devon Wright',
    email: 'devon@tech.com',
    role: 'participant',
    skills: ['Rust', 'WebAssembly', 'Solidity', 'Distributed Systems'],
    checkinStatus: 'Verified',
    qrCode: 'EVTP-ATT-5-DEVON-2026',
    teamId: 'team-2',
  },
  {
    id: 'att-6',
    name: 'Priya Sharma',
    email: 'priya@ai.co',
    role: 'participant',
    skills: ['Gemini API', 'Next.js', 'PostgreSQL', 'Tailwind'],
    checkinStatus: 'Verified',
    qrCode: 'EVTP-ATT-6-PRIYA-2026',
    teamId: 'team-3',
  },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    code: 'TEAM-01',
    name: 'NeuralSync',
    tagline: 'Real-time EEG brainwave signal classifier',
    tag: 'AI / MedTech',
    memberIds: ['att-2'],
    skillGaps: ['React', 'TypeScript', 'Tailwind'],
    submissionId: 'sub-1',
  },
  {
    id: 'team-2',
    code: 'TEAM-02',
    name: 'QuantumFlow',
    tagline: 'Decentralized high-frequency latency optimization',
    tag: 'Web3 / Infra',
    memberIds: ['att-5'],
    skillGaps: ['Figma', 'UI Design', 'AI Prompting'],
    submissionId: 'sub-2',
  },
  {
    id: 'team-3',
    code: 'TEAM-03',
    name: 'BioPulse AI',
    tagline: 'Predictive epidemic tracking using cellular data',
    tag: 'HealthTech',
    memberIds: ['att-6'],
    skillGaps: ['Machine Learning', 'Python', 'PyTorch'],
    submissionId: 'sub-3',
  },
  {
    id: 'team-4',
    code: 'TEAM-04',
    name: 'CyberVault',
    tagline: 'Zero-knowledge biometric passport verification',
    tag: 'Cybersecurity',
    memberIds: [],
    skillGaps: ['Rust', 'FastAPI', 'Solidity'],
  },
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    teamId: 'team-1',
    teamCode: 'TEAM-01',
    projectTitle: 'NeuralSync — Brain-Computer Live Graph',
    description: 'Ultra-low-latency neural telemetry visualization using WebSockets and real-time canvas rendering.',
    demoUrl: 'https://neuralsync.live',
    githubUrl: 'https://github.com/neuralsync/demo',
    status: 'Judged',
    submittedAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'sub-2',
    teamId: 'team-2',
    teamCode: 'TEAM-02',
    projectTitle: 'QuantumFlow — Sub-millisecond Mempool Engine',
    description: 'Rust-powered parallel tx engine for ultra-fast event processing.',
    demoUrl: 'https://quantumflow.io',
    githubUrl: 'https://github.com/quantumflow/core',
    status: 'Judged',
    submittedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'sub-3',
    teamId: 'team-3',
    teamCode: 'TEAM-03',
    projectTitle: 'BioPulse AI — Genomic Outbreak Simulator',
    description: 'Gemini-driven predictive epidemiologic agent modeling global mutation pathways.',
    demoUrl: 'https://biopulse-ai.app',
    githubUrl: 'https://github.com/biopulse/engine',
    status: 'Submitted',
    submittedAt: Date.now() - 3600000 * 1,
  },
];

const INITIAL_SCORES: Score[] = [
  {
    id: 'score-1',
    judgeId: 'att-3',
    judgeName: 'Marcus Vance',
    submissionId: 'sub-1',
    teamId: 'team-1',
    rubricScores: { innovation: 9, execution: 8, impact: 9, presentation: 8 },
    rawTotal: 34,
    zScore: 0.707,
    feedback: 'Extremely impressive technical execution. Neural signal streaming is crisp and architecture is robust.',
    aiSummary: 'Praised for outstanding technical execution and crisp neural signal streaming architecture.',
    timestamp: Date.now() - 3600000 * 2.5,
  },
  {
    id: 'score-2',
    judgeId: 'att-3',
    judgeName: 'Marcus Vance',
    submissionId: 'sub-2',
    teamId: 'team-2',
    rubricScores: { innovation: 7, execution: 9, impact: 6, presentation: 6 },
    rawTotal: 28,
    zScore: -0.707,
    feedback: 'Solid low-level Rust implementation, but presentation could be polished for non-technical users.',
    aiSummary: 'Commended for low-level Rust code quality, though UI presentation needs refinement.',
    timestamp: Date.now() - 3600000 * 1.8,
  },
  {
    id: 'score-3',
    judgeId: 'att-4',
    judgeName: 'Sarah Jenkins',
    submissionId: 'sub-1',
    teamId: 'team-1',
    rubricScores: { innovation: 9, execution: 9, impact: 8, presentation: 9 },
    rawTotal: 35,
    zScore: 0.85,
    feedback: 'Visual design and user flow are immaculate. Highly compelling product demo.',
    aiSummary: 'Highlighted immaculate visual design and highly compelling product demonstration flow.',
    timestamp: Date.now() - 3600000 * 2,
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    text: '🚨 Submissions Close in 45 Minutes! Ensure your demo video and GitHub link are finalized on your team node.',
    urgent: true,
    targetRole: 'all',
    timestamp: Date.now() - 1800000,
    author: 'Lead Organizer',
  },
  {
    id: 'ann-2',
    text: 'Blind Judging standard is active. Judges please review assignments in your blind evaluation queue.',
    urgent: false,
    targetRole: 'judge',
    timestamp: Date.now() - 3600000,
    author: 'Chief Judge',
  },
  {
    id: 'ann-3',
    text: 'Mentors are stationed at Table 4 for AI API troubleshooting and deployment assistance.',
    urgent: false,
    targetRole: 'participant',
    timestamp: Date.now() - 5400000,
    author: 'Event Coordinator',
  },
];

const INITIAL_EVENTS: GraphEvent[] = [
  {
    id: 'evt-1',
    type: 'ATTENDEE_CHECKIN',
    entityType: 'Attendee',
    entityId: 'att-2',
    description: 'Attendee Elena Rostova checked in via QR scan → Status flipped to Verified.',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'evt-2',
    type: 'TEAM_FORMED',
    entityType: 'Team',
    entityId: 'team-1',
    description: 'Team NeuralSync created node with skill gaps [React, TypeScript, Tailwind].',
    timestamp: Date.now() - 6500000,
  },
  {
    id: 'evt-3',
    type: 'SUBMISSION_UPDATED',
    entityType: 'Submission',
    entityId: 'sub-1',
    description: 'NeuralSync submitted project "NeuralSync — Brain-Computer Live Graph".',
    timestamp: Date.now() - 3600000 * 3,
  },
  {
    id: 'evt-4',
    type: 'SCORE_SUBMITTED',
    entityType: 'Score',
    entityId: 'score-1',
    description: 'Judge Marcus Vance submitted blind score for TEAM-01 → Z-score normalized (+0.707).',
    timestamp: Date.now() - 3600000 * 2.5,
  },
  {
    id: 'evt-5',
    type: 'ANNOUNCEMENT_MUTATED',
    entityType: 'Announcement',
    entityId: 'ann-1',
    description: 'Urgent broadcast published to all nodes: "Submissions Close in 45 Minutes!"',
    timestamp: Date.now() - 1800000,
  },
];

type Listener = (state: EventGraphState) => void;

class EventGraphStore {
  private state: EventGraphState;
  private listeners: Set<Listener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'GRAPH_MUTATION') {
          this.state = event.data.state;
          this.saveToStorage();
          this.notify();
        }
      };
    }
  }

  private loadInitialState(): EventGraphState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Schema validation guard to ensure data shape integrity
        if (
          parsed &&
          Array.isArray(parsed.attendees) &&
          Array.isArray(parsed.teams) &&
          Array.isArray(parsed.submissions) &&
          Array.isArray(parsed.scores) &&
          Array.isArray(parsed.announcements) &&
          Array.isArray(parsed.events)
        ) {
          return {
            ...parsed,
            events: parsed.events.slice(0, 100),
          };
        }
      }
    } catch (err) {
      console.warn('Failed to read or parse from localStorage, falling back to seed baseline:', err);
    }
    return {
      attendees: INITIAL_ATTENDEES,
      teams: INITIAL_TEAMS,
      submissions: INITIAL_SUBMISSIONS,
      scores: INITIAL_SCORES,
      announcements: INITIAL_ANNOUNCEMENTS,
      events: INITIAL_EVENTS,
      joinRequests: [],
      currentUserId: 'att-1',
      activeRole: 'participant',
    };
  }

  private saveToStorage() {
    try {
      // Keep events bounded to max 100 entries to prevent memory/storage inflation
      this.state.events = this.state.events.slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }

  private notify(event?: GraphEvent) {
    this.listeners.forEach(fn => fn(this.state));
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'GRAPH_MUTATION',
        state: this.state,
        event,
      });
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): EventGraphState {
    return this.state;
  }

  public setActiveRole(role: Role) {
    this.state = {
      ...this.state,
      activeRole: role,
    };
    this.saveToStorage();
    this.notify();
  }

  public registerOrLoginUser(payload: {
    name: string;
    email: string;
    role: Role;
    skills?: string[];
    avatarUrl?: string;
  }): Attendee {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();

    // Check if attendee already exists in graph
    let attendee = this.state.attendees.find(a => a.email.toLowerCase() === cleanEmail);

    if (attendee) {
      // Update existing attendee role and name if changed
      this.state.attendees = this.state.attendees.map(a =>
        a.id === attendee!.id
          ? {
              ...a,
              name: cleanName,
              role: payload.role,
              skills: payload.skills && payload.skills.length > 0 ? payload.skills : a.skills,
              avatarUrl: payload.avatarUrl || a.avatarUrl,
            }
          : a
      );
      attendee = this.state.attendees.find(a => a.id === attendee!.id)!;
    } else {
      // Create new Attendee Node
      const newId = `att-user-${Date.now()}`;
      const codeName = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 12);
      attendee = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        role: payload.role,
        skills: payload.skills && payload.skills.length > 0 ? payload.skills : ['React', 'TypeScript', 'Node.js', 'AI Prompting'],
        checkinStatus: 'Pending',
        qrCode: `EVTP-ATT-${codeName}-${Math.floor(1000 + Math.random() * 9000)}`,
        avatarUrl: payload.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      };
      this.state.attendees = [attendee, ...this.state.attendees];
    }

    this.state = {
      ...this.state,
      currentUserId: attendee.id,
      activeRole: payload.role,
    };

    const mutationEvent: GraphEvent = {
      id: `evt-${Date.now()}`,
      type: 'ATTENDEE_REGISTERED',
      entityType: 'Attendee',
      entityId: attendee.id,
      description: `Authenticated node identity "${attendee.name}" (${attendee.email}) joined graph as ${payload.role}.`,
      timestamp: Date.now(),
    };

    this.state.events = [mutationEvent, ...this.state.events].slice(0, 100);
    this.saveToStorage();
    this.notify(mutationEvent);

    return attendee;
  }

  // --- MUTATIONS ---

  public verifyCheckin(identifier: string, targetStatus?: 'Verified' | 'Pending') {
    const cleanId = identifier.trim().toLowerCase();
    const attendee = this.state.attendees.find(
      a =>
        a.id.toLowerCase() === cleanId ||
        a.qrCode.toLowerCase() === cleanId ||
        a.email.toLowerCase() === cleanId
    );
    if (!attendee) {
      console.warn(`[verifyCheckin] No attendee found matching identifier "${identifier}"`);
      return;
    }

    const nextStatus: 'Verified' | 'Pending' =
      targetStatus !== undefined
        ? targetStatus
        : attendee.checkinStatus === 'Verified'
        ? 'Pending'
        : 'Verified';

    // Immutable attendee status mutation
    this.state.attendees = this.state.attendees.map(a =>
      a.id === attendee.id ? { ...a, checkinStatus: nextStatus } : a
    );

    const mutationEvent: GraphEvent = {
      id: `evt-${Date.now()}`,
      type: 'ATTENDEE_CHECKIN',
      entityType: 'Attendee',
      entityId: attendee.id,
      description: `Attendee "${attendee.name}" (${attendee.email}) check-in mutated → Status: ${nextStatus}.`,
      timestamp: Date.now(),
    };

    this.state.events = [mutationEvent, ...this.state.events].slice(0, 100);
    this.saveToStorage();
    this.notify(mutationEvent);
  }

  public requestJoinTeam(teamId: string, attendeeId: string) {
    const attendee = this.state.attendees.find(a => a.id === attendeeId);
    const team = this.state.teams.find(t => t.id === teamId);
    if (!attendee || !team) return;

    const request: JoinRequest = {
      id: `req-${Date.now()}`,
      teamId,
      attendeeId,
      attendeeName: attendee.name,
      skills: attendee.skills,
      status: 'pending',
      timestamp: Date.now(),
    };

    this.state.joinRequests.unshift(request);

    const mutationEvent: GraphEvent = {
      id: `evt-${Date.now()}`,
      type: 'JOIN_REQUEST',
      entityType: 'Team',
      entityId: teamId,
      description: `${attendee.name} requested to join ${team.code} (${team.name}).`,
      timestamp: Date.now(),
    };

    this.state.events.unshift(mutationEvent);
    this.saveToStorage();
    this.notify(mutationEvent);
  }

  public submitScore(payload: {
    judgeId: string;
    judgeName: string;
    submissionId: string;
    teamId: string;
    rubricScores: { innovation: number; execution: number; impact: number; presentation: number };
    feedback: string;
    aiSummary?: string;
    isOutlier?: boolean;
    outlierNote?: string;
  }): Score {
    // 1. Input Validation
    const { innovation, execution, impact, presentation } = payload.rubricScores;
    const scoresArray = [innovation, execution, impact, presentation];

    if (scoresArray.some(s => typeof s !== 'number' || s < 0 || s > 10 || !Number.isInteger(s))) {
      throw new Error('Invalid rubric score: All criteria must be integers between 0 and 10.');
    }

    if (!payload.submissionId || !payload.teamId) {
      throw new Error('Invalid store write: submissionId and teamId are required.');
    }

    const rawTotal = innovation + execution + impact + presentation;

    const newScore: Score = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      judgeId: payload.judgeId,
      judgeName: payload.judgeName,
      submissionId: payload.submissionId,
      teamId: payload.teamId,
      rubricScores: payload.rubricScores,
      rawTotal,
      zScore: 0, // Recalibrated below
      feedback: payload.feedback || 'Evaluated score',
      aiSummary: payload.aiSummary,
      isOutlier: payload.isOutlier,
      outlierNote: payload.outlierNote,
      timestamp: Date.now(),
    };

    // Remove existing score by this judge for this submission if updating
    this.state.scores = this.state.scores.filter(
      s => !(s.judgeId === payload.judgeId && s.submissionId === payload.submissionId)
    );

    this.state.scores.push(newScore);

    // Recalibrate all scores for this judge to update Z-scores dynamically
    this.state.scores = recalibrateJudgeScores(this.state.scores, payload.judgeId);

    // Re-fetch updated score with recalibrated Z-score
    const updatedScore = this.state.scores.find(s => s.id === newScore.id) || newScore;

    // Check if score magnitude exceeds 1.5 Z-score threshold for outlier flagging
    if (Math.abs(updatedScore.zScore) > 1.5) {
      updatedScore.isOutlier = true;
      if (!updatedScore.outlierNote) {
        updatedScore.outlierNote = `Notable outlier (${updatedScore.zScore > 0 ? '+' : ''}${updatedScore.zScore} Z-Score) relative to judge panel baseline.`;
      }
    }

    // Update submission status to Judged
    const submission = this.state.submissions.find(s => s.id === payload.submissionId);
    if (submission) {
      submission.status = 'Judged';
    }

    const team = this.state.teams.find(t => t.id === payload.teamId);

    const mutationEvent: GraphEvent = {
      id: `evt-${Date.now()}`,
      type: 'SCORE_SUBMITTED',
      entityType: 'Score',
      entityId: updatedScore.id,
      description: `Blind Score submitted for ${team?.code || 'Team'} by Judge → Panel Z-Score updated instantly (${updatedScore.zScore > 0 ? '+' : ''}${updatedScore.zScore}).${updatedScore.isOutlier ? ' [⚠️ AI OUTLIER FLAGGED]' : ''}`,
      timestamp: Date.now(),
    };

    this.state.events.unshift(mutationEvent);
    this.saveToStorage();
    this.notify(mutationEvent);

    return updatedScore;
  }

  public createAnnouncement(payload: {
    text: string;
    bulletPoints?: string;
    urgent: boolean;
    targetRole: 'all' | 'participant' | 'judge';
    author?: string;
  }) {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      text: payload.text,
      bulletPoints: payload.bulletPoints,
      urgent: payload.urgent,
      targetRole: payload.targetRole,
      timestamp: Date.now(),
      author: payload.author || 'Organizer Command',
    };

    this.state.announcements.unshift(newAnn);

    const mutationEvent: GraphEvent = {
      id: `evt-${Date.now()}`,
      type: 'ANNOUNCEMENT_MUTATED',
      entityType: 'Announcement',
      entityId: newAnn.id,
      description: `Broadcast published: "${newAnn.text.substring(0, 45)}..." [${newAnn.urgent ? 'URGENT' : 'NORMAL'}]`,
      timestamp: Date.now(),
    };

    this.state.events.unshift(mutationEvent);
    this.saveToStorage();
    this.notify(mutationEvent);
  }

  public updateSubmission(payload: {
    submissionId?: string;
    teamId: string;
    projectTitle: string;
    description: string;
    demoUrl: string;
    githubUrl: string;
  }) {
    let sub = this.state.submissions.find(s => s.teamId === payload.teamId);
    const team = this.state.teams.find(t => t.id === payload.teamId);

    if (sub) {
      sub.projectTitle = payload.projectTitle;
      sub.description = payload.description;
      sub.demoUrl = payload.demoUrl;
      sub.githubUrl = payload.githubUrl;
      sub.status = 'Submitted';
      sub.submittedAt = Date.now();
    } else {
      sub = {
        id: `sub-${Date.now()}`,
        teamId: payload.teamId,
        teamCode: team?.code || 'TEAM-XX',
        projectTitle: payload.projectTitle,
        description: payload.description,
        demoUrl: payload.demoUrl,
        githubUrl: payload.githubUrl,
        status: 'Submitted',
        submittedAt: Date.now(),
      };
      this.state.submissions.push(sub);
      if (team) {
        team.submissionId = sub.id;
      }
    }

    const mutationEvent: GraphEvent = {
      id: `evt-${Date.now()}`,
      type: 'SUBMISSION_UPDATED',
      entityType: 'Submission',
      entityId: sub.id,
      description: `Submission updated for ${team?.code || 'Team'}: "${sub.projectTitle}".`,
      timestamp: Date.now(),
    };

    this.state.events.unshift(mutationEvent);
    this.saveToStorage();
    this.notify(mutationEvent);
  }

  public resetStore() {
    this.state = {
      attendees: INITIAL_ATTENDEES,
      teams: INITIAL_TEAMS,
      submissions: INITIAL_SUBMISSIONS,
      scores: INITIAL_SCORES,
      announcements: INITIAL_ANNOUNCEMENTS,
      events: INITIAL_EVENTS,
      joinRequests: [],
      currentUserId: 'att-1',
      activeRole: 'participant',
    };
    this.saveToStorage();
    this.notify({
      id: `evt-${Date.now()}`,
      type: 'SYSTEM_RESET',
      entityType: 'System',
      entityId: 'system',
      description: 'Event Graph state reset to seed baseline.',
      timestamp: Date.now(),
    });
  }

  // --- COMPUTED VIEW HELPERS ---

  public getLeaderboard(): LeaderboardEntry[] {
    const teams = this.state.teams;
    const submissions = this.state.submissions;
    const scores = this.state.scores;

    const entries: LeaderboardEntry[] = teams
      .map(team => {
        const sub = submissions.find(s => s.teamId === team.id);
        const teamScores = scores.filter(s => s.teamId === team.id);

        let rawAvg = 0;
        let zAvg = 0;

        if (teamScores.length > 0) {
          const rawSum = teamScores.reduce((acc, s) => acc + s.rawTotal, 0);
          const zSum = teamScores.reduce((acc, s) => acc + s.zScore, 0);
          rawAvg = Number((rawSum / teamScores.length).toFixed(1));
          zAvg = Number((zSum / teamScores.length).toFixed(3));
        }

        const latestSummary = teamScores.find(s => s.aiSummary)?.aiSummary;

        return {
          rank: 0,
          prevRank: 0,
          teamId: team.id,
          teamCode: team.code,
          teamName: team.name,
          projectTitle: sub?.projectTitle || 'No submission yet',
          rawAverage: rawAvg,
          zScoreAverage: zAvg,
          judgeCount: teamScores.length,
          scores: teamScores,
          aiSummary: latestSummary,
          momentum: 'same',
        };
      })
      .sort((a, b) => {
        if (b.zScoreAverage !== a.zScoreAverage) {
          return b.zScoreAverage - a.zScoreAverage;
        }
        return b.rawAverage - a.rawAverage;
      })
      .map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
        momentum: idx === 0 ? 'up' : 'same',
      }));

    return entries;
  }
}

export const eventGraphStore = new EventGraphStore();
