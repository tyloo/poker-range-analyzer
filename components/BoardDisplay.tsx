'use client';

import { Card } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/cards';

interface BoardDisplayProps {
  board: Card[];
  onClear: () => void;
}

function BoardCard({ card }: { card: Card }) {
  const isRed = card.suit === 'h' || card.suit === 'd';

  return (
    <div className="w-9 h-12 rounded bg-white shadow flex flex-col items-center justify-center border border-gray-300 sm:w-8 sm:h-11">
      <span className={`text-base font-bold ${isRed ? 'text-red-500' : 'text-gray-800'} sm:text-sm`}>
        {card.rank}
      </span>
      <span className={`text-base ${isRed ? 'text-red-500' : 'text-gray-800'} sm:text-sm`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

function EmptyBoardCard({ label }: { label: string }) {
  return (
    <div className="w-9 h-12 rounded bg-gray-700 border border-dashed border-gray-500 flex items-center justify-center sm:w-8 sm:h-11">
      <span className="text-gray-500 text-[10px] sm:text-[9px]">{label}</span>
    </div>
  );
}

export default function BoardDisplay({ board, onClear }: BoardDisplayProps) {
  const getStreetLabel = () => {
    if (board.length === 0) return 'Preflop';
    if (board.length <= 3) return 'Flop';
    if (board.length === 4) return 'Turn';
    return 'River';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-white">
          Board <span className="text-xs font-normal text-gray-400">({getStreetLabel()})</span>
        </h3>
        <button
          onClick={onClear}
          className={`px-2.5 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded ${
            board.length > 0 ? '' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={board.length === 0}
          tabIndex={board.length > 0 ? 0 : -1}
        >
          Clear
        </button>
      </div>
      <div className="flex gap-0.5 justify-center">
        {board[0] ? <BoardCard card={board[0]} /> : <EmptyBoardCard label="F" />}
        {board[1] ? <BoardCard card={board[1]} /> : <EmptyBoardCard label="F" />}
        {board[2] ? <BoardCard card={board[2]} /> : <EmptyBoardCard label="F" />}
        <div className="w-0.5" />
        {board[3] ? <BoardCard card={board[3]} /> : <EmptyBoardCard label="T" />}
        <div className="w-0.5" />
        {board[4] ? <BoardCard card={board[4]} /> : <EmptyBoardCard label="R" />}
      </div>
    </div>
  );
}
