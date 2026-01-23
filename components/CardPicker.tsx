'use client';

import { memo, useMemo } from 'react';
import { Card, Suit } from '@/lib/types';
import { RANKS, SUITS, SUIT_SYMBOLS } from '@/lib/cards';
import { cn } from '@/lib/utils';

interface CardPickerProps {
  selectedCards: Card[];
  disabledCards: Card[];
  maxCards: number;
  onCardSelect: (card: Card) => void;
  onCardDeselect: (card: Card) => void;
}

const SUIT_COLORS: Record<Suit, string> = {
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-600',
  s: 'text-gray-800',
};

// Memoized card button to prevent unnecessary re-renders
const CardButton = memo(function CardButton({
  card,
  selected,
  disabled,
  onClick,
}: {
  card: Card;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-sm text-[10px] sm:text-sm lg:text-base font-bold',
        'flex flex-col items-center justify-center',
        'transition-all duration-100 border-2',
        'aspect-[1/1.3] sm:aspect-auto sm:h-full',
        'touch-manipulation',
        disabled && 'bg-muted/50 cursor-not-allowed border-transparent',
        selected && 'bg-yellow-400 border-yellow-300',
        !disabled && !selected && 'bg-white hover:bg-gray-100 cursor-pointer border-transparent hover:border-primary/50'
      )}
    >
      <span className={cn(
        selected ? 'text-gray-800' : suitColor,
        disabled && 'text-muted-foreground/40'
      )}>
        {card.rank}
      </span>
      <span className={cn(
        'text-xs lg:text-xl',
        selected ? 'text-gray-800' : suitColor,
        disabled && 'text-muted-foreground/40'
      )}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </button>
  );
});

function CardPicker({
  selectedCards,
  disabledCards,
  maxCards,
  onCardSelect,
  onCardDeselect,
}: CardPickerProps) {
  // Use Set for O(1) lookups instead of O(n) array searches
  const selectedSet = useMemo(
    () => new Set(selectedCards.map(c => `${c.rank}${c.suit}`)),
    [selectedCards]
  );

  const disabledSet = useMemo(
    () => new Set(disabledCards.map(c => `${c.rank}${c.suit}`)),
    [disabledCards]
  );

  const canSelectMore = selectedCards.length < maxCards;

  const handleCardClick = (card: Card) => {
    const cardKey = `${card.rank}${card.suit}`;
    const isSelected = selectedSet.has(cardKey);
    const isDisabled = disabledSet.has(cardKey) && !isSelected;

    if (isDisabled) return;

    if (isSelected) {
      onCardDeselect(card);
    } else if (canSelectMore) {
      onCardSelect(card);
    }
  };

  return (
    <div className="grid grid-cols-13 gap-0.5 select-none h-full">
      {SUITS.map((suit) =>
        RANKS.map((rank) => {
          const card: Card = { rank, suit };
          const cardKey = `${rank}${suit}`;
          const selected = selectedSet.has(cardKey);
          const disabled = disabledSet.has(cardKey) && !selected;

          return (
            <CardButton
              key={cardKey}
              card={card}
              selected={selected}
              disabled={disabled}
              onClick={() => handleCardClick(card)}
            />
          );
        })
      )}
    </div>
  );
}

export default memo(CardPicker);
