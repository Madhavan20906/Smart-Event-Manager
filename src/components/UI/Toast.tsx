import React, { useEffect, useState } from 'react';
import { GraphEvent } from '../../types';
import { Radio, X } from 'lucide-react';

interface ToastProps {
  event: GraphEvent | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ event, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [event, onClose]);

  if (!event || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm"
    >
      <div className="bg-surface/95 border border-primary/50 shadow-glow-primary backdrop-blur-md rounded-2xl p-4 flex items-start space-x-3 text-white">
        <div className="p-2 rounded-xl bg-primary/20 text-primary flex-shrink-0">
          <Radio className="w-5 h-5 animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
              {event.type}
            </span>
            <button
              onClick={() => {
                setVisible(false);
                onClose();
              }}
              aria-label="Close real-time mutation toast notification"
              title="Close notification"
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-gray-200 font-sans leading-relaxed">
            {event.description}
          </p>
          <span className="text-[10px] font-mono text-gray-400 mt-1 block">
            Node mutated @ {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
