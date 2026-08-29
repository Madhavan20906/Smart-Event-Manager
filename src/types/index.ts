export type Role = 'participant' | 'judge' | 'organizer' | 'demo';

export type CheckinStatus = 'Pending' | 'Verified';

export interface Attendee {
  id: string;
  name: string;
  email: string;
  role: Role;
  skills: string[];
  checkinStatus: CheckinStatus;
  qrCode: string;
  teamId?: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  code: string; // Anonymous code e.g. TEAM-04
  name: string;
  tagline: string;
  tag: string;
  memberIds: string[];
  skillGaps: string[];
  submissionId?: string;
}

export interface RubricScores {
  innovation: number;   // 0 - 10
  execution: number;    // 0 - 10
  impact: number;       // 0 - 10
  presentation: number; // 0 - 10
}

export interface Score {
  id: string;
  judgeId: string;
  judgeName: string;
  submissionId: string;
  teamId: string;
  rubricScores: RubricScores;
  rawTotal: number;
  zScore: number;
  feedback: string;
  aiSummary?: string;
  isOutlier?: boolean;
  outlierNote?: string;
  timestamp: number;
}

export interface Submission {
  id: string;
  teamId: string;
  teamCode: string;
  projectTitle: string;
  description: string;
  demoUrl: string;
  githubUrl: string;
  status: 'Draft' | 'Submitted' | 'Judged';
  submittedAt: number;
}

export interface Announcement {
  id: string;
  text: string;
  bulletPoints?: string;
  urgent: boolean;
  targetRole: 'all' | 'participant' | 'judge';
  timestamp: number;
  author: string;
}

export type EventMutationType =
  | 'ATTENDEE_CHECKIN'
  | 'TEAM_FORMED'
  | 'JOIN_REQUEST'
  | 'SUBMISSION_UPDATED'
  | 'SCORE_SUBMITTED'
  | 'ANNOUNCEMENT_MUTATED'
  | 'SYSTEM_RESET';

export interface GraphEvent {
  id: string;
  type: EventMutationType;
  entityType: 'Attendee' | 'Team' | 'Submission' | 'Score' | 'Announcement' | 'System';
  entityId: string;
  description: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export interface LeaderboardEntry {
  rank: number;
  prevRank: number;
  teamId: string;
  teamCode: string;
  teamName: string;
  projectTitle: string;
  rawAverage: number;
  zScoreAverage: number;
  judgeCount: number;
  scores: Score[];
  aiSummary?: string;
  momentum: 'up' | 'down' | 'same' | 'new';
}

export interface JoinRequest {
  id: string;
  teamId: string;
  attendeeId: string;
  attendeeName: string;
  skills: string[];
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}
