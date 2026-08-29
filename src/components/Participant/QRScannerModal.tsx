import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize HTML5 Camera Scanner
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 220, height: 220 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (error) => {
        // Soft camera scan warning
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn('QR scanner clear error:', err));
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-white">Live Camera Entry Scanner</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close QR Scanner Modal"
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Render Div */}
        <div className="bg-surface rounded-2xl p-2 border border-border overflow-hidden">
          <div id="qr-reader-container" className="w-full text-white text-xs"></div>
        </div>

        {/* Manual Fallback Option */}
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-2 border-t border-border/60">
          <label htmlFor="manual-qr-code-input" className="block text-xs font-mono text-gray-400">
            Fallback: Enter Code Manually
          </label>
          <div className="flex space-x-2">
            <input
              id="manual-qr-code-input"
              type="text"
              placeholder="e.g. EVTP-ATT-1-ALEX-CHEN-2026"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              aria-label="Submit manual check-in QR code"
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
