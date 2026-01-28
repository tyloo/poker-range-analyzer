'use client';

import { memo } from 'react';
import { Card } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/cards';
import { Card as CardContainer, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BoardDisplayProps {
  board: Card[];
  onClear: () => void;
}

// Memoized board card component
const BoardCard = memo(function BoardCard({ card }: { card: Card }) {
  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div className="w-9 h-12 sm:w-8 sm:h-11 rounded-md bg-white shadow-sm flex flex-col items-center justify-center border border-border">
      <span className={`text-base sm:text-sm font-bold ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        {card.rank}
      </span>
      <span className={`text-base sm:text-sm ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
});

// Static empty board cards - hoisted outside component
const EmptyFlopCard = (
  <div className="w-9 h-12 sm:w-8 sm:h-11 rounded-md bg-muted border border-dashed border-muted-foreground/30 flex items-center justify-center">
    <span className="text-muted-foreground text-[10px] sm:text-[9px]">F</span>
  </div>
);

const EmptyTurnCard = (
  <div className="w-9 h-12 sm:w-8 sm:h-11 rounded-md bg-muted border border-dashed border-muted-foreground/30 flex items-center justify-center">
    <span className="text-muted-foreground text-[10px] sm:text-[9px]">T</span>
  </div>
);

const EmptyRiverCard = (
  <div className="w-9 h-12 sm:w-8 sm:h-11 rounded-md bg-muted border border-dashed border-muted-foreground/30 flex items-center justify-center">
    <span className="text-muted-foreground text-[10px] sm:text-[9px]">R</span>
  </div>
);

// Static spacer - hoisted outside component
const Spacer = <div className="w-1" />;

// Street label helper - pure function
const getStreetLabel = (boardLength: number): string => {
  if (boardLength === 0) return 'Preflop';
  if (boardLength <= 3) return 'Flop';
  if (boardLength === 4) return 'Turn';
  return 'River';
};

function BoardDisplay({ board, onClear }: BoardDisplayProps) {
  const hasCards = board.length > 0;

  return (
    <CardContainer size="sm" className="py-2">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm flex items-center gap-2">
          Board
          <Badge variant="secondary" className="text-[10px] font-normal">
            {getStreetLabel(board.length)}
          </Badge>
        </CardTitle>
        <CardAction>
          {hasCards ? (
            <Button variant="destructive" size="xs" onClick={onClear}>
              Clear
            </Button>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="px-3 pt-1">
        <div className="flex gap-0.5 justify-center">
          {board[0] ? <BoardCard card={board[0]} /> : EmptyFlopCard}
          {board[1] ? <BoardCard card={board[1]} /> : EmptyFlopCard}
          {board[2] ? <BoardCard card={board[2]} /> : EmptyFlopCard}
          {Spacer}
          {board[3] ? <BoardCard card={board[3]} /> : EmptyTurnCard}
          {Spacer}
          {board[4] ? <BoardCard card={board[4]} /> : EmptyRiverCard}
        </div>
      </CardContent>
    </CardContainer>
  );
}

export default memo(BoardDisplay);
