import React from 'react';
import { Role } from '../../types';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface RoleGuardBannerProps {
  userRole?: Role;
  requiredRole: Role;
  onElevateRole?: (newRole: Role) => void;
}

export const RoleGuardBanner: React.FC<RoleGuardBannerProps> = ({
  userRole = 'participant',
  requiredRole,
  onElevateRole,
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
    <div className="bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-amber-950/70 border border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-amber-200 animate-slide-up mb-6">
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-white text-sm font-sans tracking-tight">
              🔒 READ-ONLY MODE — Authorization Guard
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
              Logged in: {roleLabels[userRole] || userRole}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 font-bold uppercase">
              Requires: {roleLabels[requiredRole] || requiredRole}
            </span>
          </div>
          <p className="text-xs text-amber-200/90 font-mono leading-relaxed">
            You are currently authenticated as a <strong className="text-white">{roleLabels[userRole]}</strong>. This view is visible for browsing, but write/mutation privileges are restricted to <strong className="text-white">{roleLabels[requiredRole]}</strong> accounts.
          </p>
        </div>
      </div>

      {onElevateRole && (
        <button
          type="button"
          onClick={() => onElevateRole(requiredRole)}
          aria-label={`Switch authorized role to ${roleLabels[requiredRole]}`}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs font-mono transition-all shadow-md shrink-0 flex items-center space-x-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>Authorize as {roleLabels[requiredRole]}</span>
          <ArrowRight className="w-3.5 h-3.5 text-black" />
        </button>
      )}
    </div>
  );
};
