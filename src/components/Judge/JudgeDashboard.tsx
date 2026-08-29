import React, { useState } from 'react';
import { Submission, Score, Team, Attendee, Role } from '../../types';
import { calculateZScore } from '../../utils/math';
import { summarizeJudgeFeedbackWithGemini } from '../../services/geminiService';
import { RoleGuardBanner } from '../Auth/RoleGuardBanner';
import {
  Award,
  EyeOff,
  CheckCircle2,
  Sliders,
  Sparkles,
  Send,
  HelpCircle,
  BarChart3,
  Lock,
  MessageSquare,
  Zap
} from 'lucide-react';

interface JudgeDashboardProps {
  currentJudge: Attendee;
  submissions: Submission[];
  scores: Score[];
  teams: Team[];
  userRole?: Role;
  onElevateRole?: (newRole: Role) => void;
  onSubmitScore: (payload: {
    judgeId: string;
    judgeName: string;
    submissionId: string;
    teamId: string;
    rubricScores: { innovation: number; execution: number; impact: number; presentation: number };
    feedback: string;
    aiSummary?: string;
  }) => void;
}

export const JudgeDashboard: React.FC<JudgeDashboardProps> = ({
  currentJudge,
  submissions,
  scores,
  teams,
  userRole = 'judge',
  onElevateRole,
  onSubmitScore,
}) => {
  const isReadOnly = userRole !== 'judge' && userRole !== 'demo';
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    submissions[0]?.id || ''
  );

  const [rubric, setRubric] = useState({
    innovation: 8,
    execution: 8,
    impact: 7,
    presentation: 8,
  });

  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId);
  const selectedTeam = teams.find(t => t.id === selectedSubmission?.teamId);

  // Scores submitted by THIS specific judge to calculate judge baseline mean & stdDev
  const judgeHistoricalScores = scores.filter(s => s.judgeId === currentJudge.id);
  const judgeRawTotals = judgeHistoricalScores.map(s => s.rawTotal);

  const currentRawTotal = rubric.innovation + rubric.execution + rubric.impact + rubric.presentation;
  
  // Simulated Z-score for live preview
  const liveZScore = calculateZScore(currentRawTotal, [...judgeRawTotals, currentRawTotal]);

  const handleSelectSubmission = (subId: string) => {
    setSelectedSubmissionId(subId);
    const existingScore = scores.find(s => s.judgeId === currentJudge.id && s.submissionId === subId);
    if (existingScore) {
      setRubric(existingScore.rubricScores);
      setFeedback(existingScore.feedback);
    } else {
      setRubric({ innovation: 8, execution: 8, impact: 7, presentation: 8 });
      setFeedback('');
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsSubmitting(true);

    let aiSummary = '';
    try {
      aiSummary = await summarizeJudgeFeedbackWithGemini(selectedSubmission.teamCode, [
        { rawTotal: currentRawTotal, feedback: feedback || 'Solid submission with great engineering.' }
      ]);
    } catch (err) {
      console.warn('AI summary error:', err);
    }

    onSubmitScore({
      judgeId: currentJudge.id,
      judgeName: currentJudge.name,
      submissionId: selectedSubmission.id,
      teamId: selectedSubmission.teamId,
      rubricScores: rubric,
      feedback: feedback || 'Evaluated under blind rubric standards.',
      aiSummary,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-slide-up">
      {/* Role Access Authorization Banner */}
      <RoleGuardBanner userRole={userRole} requiredRole="judge" onElevateRole={onElevateRole} />

      {/* Header: Blind Judging Protocol Banner */}
      <div className="bg-gradient-to-r from-card via-surface to-card border border-border/80 rounded-2xl p-6 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-primary/20 text-primary border border-primary/30 shadow-glow-primary">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Blind Evaluation Queue</h2>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-accent/20 text-accent border border-accent/40">
                FAIRNESS PROTOCOL ENFORCED
              </span>
            </div>
            <p className="text-xs text-gray-300 font-mono mt-0.5">
              Team names & participant identities are anonymized to team codes. Raw scores are z-score normalized automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-surface px-4 py-2.5 rounded-xl border border-border">
          <div className="text-right">
            <span className="text-[11px] font-mono text-gray-400 block">Evaluator:</span>
            <span className="text-xs font-bold text-white font-mono">{currentJudge.name}</span>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="text-left">
            <span className="text-[11px] font-mono text-gray-400 block">Evaluated:</span>
            <span className="text-xs font-bold text-accent font-mono">
              {judgeHistoricalScores.length} / {submissions.length} Teams
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Blind Queue Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Blind Queue ({submissions.length})</span>
            <span className="text-[11px] text-gray-500 font-normal">Select code to evaluate</span>
          </h3>

          <div className="space-y-3">
            {submissions.map(sub => {
              const hasJudged = scores.some(s => s.judgeId === currentJudge.id && s.submissionId === sub.id);
              const isSelected = sub.id === selectedSubmissionId;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub.id)}
                  aria-label={`Evaluate submission for team code ${sub.teamCode}`}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-glow-primary'
                      : 'bg-card border-border hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center font-mono font-bold text-primary text-xs">
                      {sub.teamCode}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sub.projectTitle}</h4>
                      <span className="text-[11px] font-mono text-gray-400 block">
                        Submitted {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {hasJudged ? (
                    <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-accent/20 text-accent border border-accent/40">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Judged</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-warning/15 text-warning border border-warning/30">
                      Pending
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Normalization */}
          <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2 text-gray-300">
            <div className="flex items-center space-x-2 text-secondary font-mono font-bold">
              <Zap className="w-4 h-4" />
              <span>How Z-Score Normalization Works</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Every judge has a unique raw scoring bias (harsh vs lenient). EventPulse normalizes raw totals into standard deviation Z-scores (<code className="text-accent">Z = (X - μ) / σ</code>) across your scoring distribution before aggregating the final leaderboard.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Rubric Form */}
        {selectedSubmission ? (
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-glass space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 font-mono font-bold text-xs rounded bg-surface border border-border text-primary">
                    {selectedSubmission.teamCode}
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedSubmission.projectTitle}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">{selectedSubmission.description}</p>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono">
                <a
                  href={selectedSubmission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary text-gray-200"
                >
                  Demo Link ↗
                </a>
                <a
                  href={selectedSubmission.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary text-gray-200"
                >
                  GitHub ↗
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmitScore} className="space-y-6">
              {/* Rubric Criteria Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="rubric-innovation-slider" className="text-xs font-mono text-gray-300 font-semibold">
                      1. Innovation & Novelty (0–10)
                    </label>
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                      {rubric.innovation}/10
                    </span>
                  </div>
                  <input
                    id="rubric-innovation-slider"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={rubric.innovation}
                    onChange={e => setRubric({ ...rubric, innovation: Number(e.target.value) })}
                    aria-label="Innovation and Novelty Rubric Slider (0 to 10)"
                    className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="rubric-execution-slider" className="text-xs font-mono text-gray-300 font-semibold">
                      2. Technical Execution & Architecture (0–10)
                    </label>
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                      {rubric.execution}/10
                    </span>
                  </div>
                  <input
                    id="rubric-execution-slider"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={rubric.execution}
                    onChange={e => setRubric({ ...rubric, execution: Number(e.target.value) })}
                    aria-label="Technical Execution Rubric Slider (0 to 10)"
                    className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="rubric-impact-slider" className="text-xs font-mono text-gray-300 font-semibold">
                      3. Practical Impact & Market Need (0–10)
                    </label>
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                      {rubric.impact}/10
                    </span>
                  </div>
                  <input
                    id="rubric-impact-slider"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={rubric.impact}
                    onChange={e => setRubric({ ...rubric, impact: Number(e.target.value) })}
                    aria-label="Practical Impact Rubric Slider (0 to 10)"
                    className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="rubric-presentation-slider" className="text-xs font-mono text-gray-300 font-semibold">
                      4. Presentation & Pitch Delivery (0–10)
                    </label>
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/20">
                      {rubric.presentation}/10
                    </span>
                  </div>
                  <input
                    id="rubric-presentation-slider"
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={rubric.presentation}
                    onChange={e => setRubric({ ...rubric, presentation: Number(e.target.value) })}
                    aria-label="Presentation Pitch Rubric Slider (0 to 10)"
                    className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label htmlFor="judge-feedback-textarea" className="block text-xs font-mono text-gray-300 mb-1.5 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span>Structured Judge Feedback</span>
                </label>
                <textarea
                  id="judge-feedback-textarea"
                  rows={3}
                  placeholder="Provide objective feedback on strengths, architecture, and improvements..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Live Z-Score Normalization Indicator */}
              <div className="bg-gradient-to-r from-card via-surface to-card p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-gray-400 block">Z-Score Normalization Pipeline:</span>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm font-mono text-gray-200">
                      Raw Total: <strong className="text-white">{currentRawTotal} / 40</strong>
                    </span>
                    <span className="text-sm font-mono text-gray-200">
                      Z-Score: <strong className={liveZScore >= 0 ? 'text-accent' : 'text-warning'}>
                        {liveZScore > 0 ? `+${liveZScore}` : liveZScore}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isReadOnly}
                  title={isReadOnly ? 'Requires Blind Judge role authorization' : undefined}
                  aria-label="Submit score and propagate Z-score normalization"
                  className={`py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-primary ${
                    isReadOnly
                      ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary'
                  }`}
                >
                  {isReadOnly ? (
                    <Lock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {isReadOnly
                      ? 'Submit Score (Requires Judge Authorization)'
                      : isSubmitting
                      ? 'Normalizing Score...'
                      : 'Submit & Propagate to Leaderboard'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center justify-center">
            <Lock className="w-12 h-12 text-gray-600 mb-3" />
            <p>Select a submission from the blind queue on the left to begin rubric scoring.</p>
          </div>
        )}
      </div>
    </div>
  );
};
