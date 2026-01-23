'use client';

import { Card } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/cards';

interface HandDisplayProps {
  cards: Card[];
  onClear: () => void;
}

function CardDisplay({ card }: { card: Card }) {
  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div className="w-12 h-16 rounded bg-white shadow flex flex-col items-center justify-center border border-gray-300 sm:w-10 sm:h-14">
      <span className={`text-lg font-bold ${isRed ? 'text-red-500' : 'text-gray-800'} sm:text-base`}>
        {card.rank}
      </span>
      <span className={`text-xl ${isRed ? 'text-red-500' : 'text-gray-800'} sm:text-lg`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="w-12 h-16 rounded bg-gray-700 border border-dashed border-gray-500 flex items-center justify-center sm:w-10 sm:h-14">
      <span className="text-gray-500 text-xl sm:text-lg">?</span>
    </div>
  );
}

export default function HandDisplay({ cards, onClear }: HandDisplayProps) {
  const hasCards = cards.length > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-white">Hand</h3>
        <button
          onClick={onClear}
          className={`px-2.5 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded ${
            hasCards ? '' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!hasCards}
          tabIndex={hasCards ? 0 : -1}
        >
          Clear
        </button>
      </div>
      <div className="flex gap-1 justify-center">
        {cards[0] ? <CardDisplay card={cards[0]} /> : <EmptyCard />}
        {cards[1] ? <CardDisplay card={cards[1]} /> : <EmptyCard />}
      </div>
    </div>
  );
}
