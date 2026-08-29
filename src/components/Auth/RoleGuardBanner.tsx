import React from 'react';
import { Role } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleGuardBannerProps {
  userRole?: Role;
  requiredRole: Role;
  onRedirectToMyDashboard?: () => void;
}

export const RoleGuardBanner: React.FC<RoleGuardBannerProps> = ({
  userRole = 'participant',
  requiredRole,
  onRedirectToMyDashboard,
}) => {
  if (userRole === requiredRole || userRole === 'demo') {
    return null;
  }

  const roleLabels: Record<Role, string> = {
    participant: 'Participant',
    judge: 'Blind Judge',
    organizer: 'Organizer',
    demo: 'Demo Split',
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-card border border-red-500/50 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 shadow-glow-primary">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 inline-block">
            403 ACCESS RESTRICTED
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Not Authorized for This View
          </h2>
          <p className="text-xs text-gray-300 font-mono leading-relaxed">
            Your account is authenticated as <strong className="text-white">{roleLabels[userRole] || userRole}</strong>. 
            Cross-role browsing is restricted to enforce strict blind judging standards and data isolation.
          </p>
        </div>

        <div className="bg-surface p-3 rounded-xl border border-border text-left text-xs font-mono space-y-1">
          <div className="text-gray-400">
            Authenticated Role: <span className="text-white font-bold">{roleLabels[userRole]}</span>
          </div>
          <div className="text-gray-400">
            Requested Category: <span className="text-red-400 font-bold">{roleLabels[requiredRole]}</span>
          </div>
        </div>

        {onRedirectToMyDashboard && (
          <button
            type="button"
            onClick={onRedirectToMyDashboard}
            className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs font-mono transition-all shadow-glow-primary flex items-center justify-center space-x-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Authorized Dashboard ({roleLabels[userRole]})</span>
          </button>
        )}
      </div>
    </div>
  );
};

