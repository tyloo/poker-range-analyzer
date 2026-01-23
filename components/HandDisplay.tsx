'use client';

import { memo } from 'react';
import { Card } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/cards';
import { Card as CardContainer, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HandDisplayProps {
  cards: Card[];
  onClear: () => void;
}

// Memoized card display component
const CardDisplay = memo(function CardDisplay({ card }: { card: Card }) {
  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div className="w-12 h-16 sm:w-10 sm:h-14 rounded-md bg-white shadow-sm flex flex-col items-center justify-center border border-border">
      <span className={`text-lg sm:text-base font-bold ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        {card.rank}
      </span>
      <span className={`text-xl sm:text-lg ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
});

// Static empty card - hoisted outside component
const EmptyCard = (
  <div className="w-12 h-16 sm:w-10 sm:h-14 rounded-md bg-muted border border-dashed border-muted-foreground/30 flex items-center justify-center">
    <span className="text-muted-foreground text-xl sm:text-lg">?</span>
  </div>
);

function HandDisplay({ cards, onClear }: HandDisplayProps) {
  const hasCards = cards.length > 0;

  return (
    <CardContainer size="sm" className="py-2">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-sm">Hand</CardTitle>
        <CardAction>
          {hasCards ? (
            <Button variant="destructive" size="xs" onClick={onClear}>
              Clear
            </Button>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="px-3 pt-1">
        <div className="flex gap-1 justify-center">
          {cards[0] ? <CardDisplay card={cards[0]} /> : EmptyCard}
          {cards[1] ? <CardDisplay card={cards[1]} /> : EmptyCard}
        </div>
      </CardContent>
    </CardContainer>
  );
}

export default memo(HandDisplay);
