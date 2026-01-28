'use client';

import { memo, useCallback } from 'react';
import { Position } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PositionSelectorProps {
  selectedPosition: Position;
  onPositionChange: (position: Position) => void;
}

// Static data - hoisted outside component
const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

const POSITION_COLORS: Record<Position, string> = {
  UTG: 'data-pressed:bg-red-600 data-pressed:text-white hover:bg-red-600/20',
  MP: 'data-pressed:bg-orange-600 data-pressed:text-white hover:bg-orange-600/20',
  CO: 'data-pressed:bg-yellow-600 data-pressed:text-white hover:bg-yellow-600/20',
  BTN: 'data-pressed:bg-green-600 data-pressed:text-white hover:bg-green-600/20',
  SB: 'data-pressed:bg-blue-600 data-pressed:text-white hover:bg-blue-600/20',
  BB: 'data-pressed:bg-purple-600 data-pressed:text-white hover:bg-purple-600/20',
};

function PositionSelector({
  selectedPosition,
  onPositionChange,
}: PositionSelectorProps) {
  const handleValueChange = useCallback(
    (value: string[]) => {
      if (value.length > 0) {
        onPositionChange(value[value.length - 1] as Position);
      }
    },
    [onPositionChange]
  );

  return (
    <ToggleGroup
      value={[selectedPosition]}
      onValueChange={handleValueChange}
      className="flex flex-wrap gap-1"
    >
      {POSITIONS.map((position) => (
        <ToggleGroupItem
          key={position}
          value={position}
          className={`min-w-[44px] h-9 px-2.5 font-bold text-sm ${POSITION_COLORS[position]}`}
        >
          {position}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export default memo(PositionSelector);
