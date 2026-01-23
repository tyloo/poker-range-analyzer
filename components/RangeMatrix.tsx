'use client';

import { memo, useMemo } from 'react';
import { Position, HoleCards, RangeAction } from '@/lib/types';
import { RANKS, classifyHoleCards } from '@/lib/cards';
import { getHandAction } from '@/lib/ranges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RangeMatrixProps {
  position: Position;
  selectedHand: HoleCards;
}

// Pure function - moved to module scope
const getHandFromMatrix = (row: number, col: number): { hand: string; type: 'pair' | 'suited' | 'offsuit' } => {
  const rank1 = RANKS[row];
  const rank2 = RANKS[col];

  if (row === col) {
    return { hand: `${rank1}${rank2}`, type: 'pair' };
  } else if (row < col) {
    return { hand: `${rank1}${rank2}s`, type: 'suited' };
  } else {
    return { hand: `${rank2}${rank1}o`, type: 'offsuit' };
  }
};

// Pure function - moved to module scope
const getCellColor = (action: RangeAction): string => {
  const raiseFreq = action.raise;
  const callFreq = action.call;
  const totalFreq = raiseFreq + callFreq;

  if (totalFreq === 0) {
    return 'bg-muted text-muted-foreground';
  }

  if (raiseFreq >= 100) {
    return 'bg-green-500 text-white';
  } else if (raiseFreq > 0 && callFreq === 0) {
    return raiseFreq >= 50 ? 'bg-green-400 text-gray-900' : 'bg-green-300 text-gray-900';
  } else if (callFreq >= 100) {
    return 'bg-blue-500 text-white';
  } else if (callFreq > 0 && raiseFreq === 0) {
    return callFreq >= 50 ? 'bg-blue-400 text-white' : 'bg-blue-300 text-gray-900';
  } else {
    return raiseFreq >= callFreq ? 'bg-yellow-400 text-gray-900' : 'bg-orange-400 text-gray-900';
  }
};

// Static legend item component
const LegendItem = memo(function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn('w-2.5 h-2.5 rounded-sm', color)} />
      <span>{label}</span>
    </span>
  );
});

// Memoized cell component to prevent re-renders
const MatrixCell = memo(function MatrixCell({
  hand,
  type,
  action,
  isHighlighted,
}: {
  hand: string;
  type: 'pair' | 'suited' | 'offsuit';
  action: RangeAction;
  isHighlighted: boolean;
}) {
  const cellColor = getCellColor(action);

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          'aspect-square w-full',
          'text-[9px] sm:text-[10px] lg:text-[11px] font-semibold',
          'flex items-center justify-center rounded-sm cursor-pointer',
          'border-2 hover:border-foreground',
          cellColor,
          isHighlighted ? 'border-red-500' : 'border-transparent',
          type === 'pair' && 'font-bold'
        )}
      >
        {hand.replace('o', '').replace('s', '')}
        {type === 'suited' && <sup className="text-[5px]">s</sup>}
        {type === 'offsuit' && <sup className="text-[5px]">o</sup>}
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-semibold">{hand}</p>
        <p>Raise: {action.raise}%</p>
        <p>Call: {action.call}%</p>
        <p>Fold: {action.fold}%</p>
      </TooltipContent>
    </Tooltip>
  );
});

function RangeMatrix({ position, selectedHand }: RangeMatrixProps) {
  const classification = useMemo(
    () => (selectedHand ? classifyHoleCards(selectedHand) : null),
    [selectedHand]
  );

  return (
    <Card className="h-full flex flex-col py-2">
      <CardHeader className="px-3 pb-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">{position} Range</CardTitle>
          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            <LegendItem color="bg-green-500" label="Raise" />
            <LegendItem color="bg-blue-500" label="Call" />
            <LegendItem color="bg-yellow-400" label="Mixed" />
            <LegendItem color="bg-muted" label="Fold" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 flex-1">
        <div className="grid grid-cols-13 gap-0.5 w-full">
          {RANKS.map((_, rowIndex) =>
            RANKS.map((_, colIndex) => {
              const { hand, type } = getHandFromMatrix(rowIndex, colIndex);
              const action = getHandAction(position, hand);
              const isHighlighted = classification?.hand === hand;

              return (
                <MatrixCell
                  key={`${rowIndex}-${colIndex}`}
                  hand={hand}
                  type={type}
                  action={action}
                  isHighlighted={isHighlighted}
                />
              );
            })
          )}
        </div>
      </CardContent>

      <div className="px-3 pt-1 text-[10px] text-muted-foreground">
        Diagonal: Pairs | Above: Suited | Below: Offsuit
      </div>
    </Card>
  );
}

export default memo(RangeMatrix);
