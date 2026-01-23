'use client';

import { useEffect } from 'react';
import { Position, HoleCards } from '@/lib/types';
import RangeMatrix from './RangeMatrix';

interface RangeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position;
  selectedHand: HoleCards;
}

export default function RangeSheet({ isOpen, onClose, position, selectedHand }: RangeSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close range sheet"
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <h2 className="text-lg font-semibold text-white">{position} Range</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <RangeMatrix position={position} selectedHand={selectedHand} />
        </div>
      </div>
    </div>
  );
}
