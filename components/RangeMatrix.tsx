'use client';

import { Position, HoleCards, RangeAction } from '@/lib/types';
import { RANKS, classifyHoleCards } from '@/lib/cards';
import { getHandAction } from '@/lib/ranges';

interface RangeMatrixProps {
  position: Position;
  selectedHand: HoleCards;
}

function getHandFromMatrix(row: number, col: number): { hand: string; type: 'pair' | 'suited' | 'offsuit' } {
  const rank1 = RANKS[row];
  const rank2 = RANKS[col];

  if (row === col) {
    return { hand: `${rank1}${rank2}`, type: 'pair' };
  } else if (row < col) {
    return { hand: `${rank1}${rank2}s`, type: 'suited' };
  } else {
    return { hand: `${rank2}${rank1}o`, type: 'offsuit' };
  }
}

function getCellColor(action: RangeAction): string {
  const raiseFreq = action.raise;
  const callFreq = action.call;
  const totalFreq = raiseFreq + callFreq;

  if (totalFreq === 0) {
    return 'bg-gray-600 text-gray-400';
  }

  // Pure raise = green, Pure call = blue, Mixed = yellow/orange gradient
  if (raiseFreq >= 100) {
    return 'bg-green-500 text-white';
  } else if (raiseFreq > 0 && callFreq === 0) {
    // Partial raise only
    return raiseFreq >= 50 ? 'bg-green-400 text-gray-900' : 'bg-green-300 text-gray-900';
  } else if (callFreq >= 100) {
    return 'bg-blue-500 text-white';
  } else if (callFreq > 0 && raiseFreq === 0) {
    // Partial call only
    return callFreq >= 50 ? 'bg-blue-400 text-white' : 'bg-blue-300 text-gray-900';
  } else {
    // Mixed raise + call
    return raiseFreq >= callFreq ? 'bg-yellow-400 text-gray-900' : 'bg-orange-400 text-gray-900';
  }
}

export default function RangeMatrix({ position, selectedHand }: RangeMatrixProps) {
  const classification = selectedHand ? classifyHoleCards(selectedHand) : null;

  return (
    <div className="bg-gray-800 rounded-lg p-2 sm:p-3 lg:p-2 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h3 className="text-sm sm:text-base font-semibold text-white">{position} Range</h3>
        <div className="flex flex-wrap gap-2 text-[10px] sm:text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-green-500 rounded"></span> Raise
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded"></span> Call
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded"></span> Mixed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-gray-600 rounded"></span> Fold
          </span>
        </div>
      </div>

      <div className="overflow-x-auto lg:overflow-hidden -mx-1 px-1 pb-1 flex-1">
        <div className="inline-grid grid-cols-13 gap-px min-w-max lg:min-w-0">
        {RANKS.map((_, rowIndex) => (
          RANKS.map((_, colIndex) => {
            const { hand, type } = getHandFromMatrix(rowIndex, colIndex);
            const action = getHandAction(position, hand);
            const isHighlighted = classification?.hand === hand;
            const cellColor = getCellColor(action);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  matrix-cell
                  ${cellColor}
                  ${isHighlighted ? '!border-red-500' : ''}
                  ${type === 'pair' ? 'font-bold' : ''}
                `}
                title={`${hand}: Raise ${action.raise}%, Call ${action.call}%, Fold ${action.fold}%`}
              >
                {hand.replace('o', '').replace('s', '')}
                {type === 'suited' && <sup className="text-[6px]">s</sup>}
                {type === 'offsuit' && <sup className="text-[6px]">o</sup>}
              </div>
            );
          })
        ))}
        </div>
      </div>

      <div className="mt-1 text-[10px] text-gray-500">
        Diagonal: Pairs | Above: Suited | Below: Offsuit
      </div>
    </div>
  );
}
