'use client';

import { Card, Suit } from '@/lib/types';
import { RANKS, SUITS, SUIT_SYMBOLS, cardsContain } from '@/lib/cards';

interface CardPickerProps {
  selectedCards: Card[];
  disabledCards: Card[];
  maxCards: number;
  onCardSelect: (card: Card) => void;
  onCardDeselect: (card: Card) => void;
  compact?: boolean;
  tight?: boolean;
}

export default function CardPicker({
  selectedCards,
  disabledCards,
  maxCards,
  onCardSelect,
  onCardDeselect,
  compact = false,
  tight = false,
}: CardPickerProps) {
  const isSelected = (card: Card) => cardsContain(selectedCards, card);
  const isDisabled = (card: Card) => cardsContain(disabledCards, card);
  const canSelectMore = selectedCards.length < maxCards;

  const handleCardClick = (card: Card) => {
    if (isDisabled(card) && !isSelected(card)) return;

    if (isSelected(card)) {
      onCardDeselect(card);
    } else if (canSelectMore) {
      onCardSelect(card);
    }
  };

  const getSuitColor = (suit: Suit) => {
    return suit === 'h' ? 'text-red-500' : suit === 'd' ? 'text-blue-500' : suit === 'c' ? 'text-green-500' : 'text-gray-800';
  };

  return (
    <div className="grid grid-cols-13 gap-0.5 select-none h-full">
      {SUITS.map((suit) => (
        RANKS.map((rank) => {
          const card: Card = { rank, suit };
          const selected = isSelected(card);
          const disabled = isDisabled(card) && !selected;

          return (
            <button
              key={`${rank}${suit}`}
              onClick={() => handleCardClick(card)}
              disabled={disabled}
              className={`
                card-cell
                ${compact ? 'card-cell-compact' : ''}
                ${tight ? 'card-cell-tight' : ''}
                touch-manipulation
                ${disabled
                  ? 'bg-gray-600 opacity-25 cursor-not-allowed'
                  : selected
                    ? 'bg-yellow-400 border-yellow-300'
                    : 'bg-white hover:bg-gray-100 cursor-pointer hover:border-gray-300'
                }
              `}
            >
              <span className={selected ? 'text-gray-800' : getSuitColor(suit)}>
                {rank}
              </span>
              <span className={`text-[8px] sm:text-[10px] ${selected ? 'text-gray-800' : getSuitColor(suit)}`}>
                {SUIT_SYMBOLS[suit]}
              </span>
            </button>
          );
        })
      ))}
    </div>
  );
}
