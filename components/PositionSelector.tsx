'use client';

import { Position } from '@/lib/types';

interface PositionSelectorProps {
  selectedPosition: Position;
  onPositionChange: (position: Position) => void;
}

const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const POSITION_COLORS: Record<Position, string> = {
  UTG: 'bg-red-600 hover:bg-red-500',
  MP: 'bg-orange-600 hover:bg-orange-500',
  CO: 'bg-yellow-600 hover:bg-yellow-500',
  BTN: 'bg-green-600 hover:bg-green-500',
  SB: 'bg-blue-600 hover:bg-blue-500',
  BB: 'bg-purple-600 hover:bg-purple-500',
};

export default function PositionSelector({
  selectedPosition,
  onPositionChange,
}: PositionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {POSITIONS.map((position) => (
        <button
          key={position}
          onClick={() => onPositionChange(position)}
          className={`
            min-w-[44px] h-9 px-2.5 rounded font-bold text-white text-sm transition-all
            ${POSITION_COLORS[position]}
            ${selectedPosition !== position && 'opacity-40'
            }
          `}
        >
          {position}
        </button>
      ))}
    </div>
  );
}
