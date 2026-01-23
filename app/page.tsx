'use client';

import { useState } from 'react';
import { Card, Position, HoleCards } from '@/lib/types';
import { cardsContain, isSameCard } from '@/lib/cards';
import PositionSelector from '@/components/PositionSelector';
import CardPicker from '@/components/CardPicker';
import HandDisplay from '@/components/HandDisplay';
import BoardDisplay from '@/components/BoardDisplay';
import RangeMatrix from '@/components/RangeMatrix';
import AnalysisSummary from '@/components/AnalysisSummary';
import RangeSheet from '@/components/RangeSheet';

type SelectionMode = 'hand' | 'board';

export default function Home() {
  const [heroPosition, setHeroPosition] = useState<Position>('BTN');
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('hand');
  const [rangeSheetOpen, setRangeSheetOpen] = useState(false);
  const villainPosition: Position = 'BB';

  const handleCardSelect = (card: Card) => {
    const inHand = cardsContain(handCards, card);
    const inBoard = cardsContain(board, card);

    if (inHand) {
      setHandCards(handCards.filter(c => !isSameCard(c, card)));
      return;
    }
    if (inBoard) {
      setBoard(board.filter(c => !isSameCard(c, card)));
      return;
    }

    if (selectionMode === 'hand' && handCards.length < 2) {
      setHandCards([...handCards, card]);
    } else if (selectionMode === 'board' && board.length < 5) {
      setBoard([...board, card]);
    }
  };

  const currentHoleCards: HoleCards = handCards.length === 2
    ? [handCards[0], handCards[1]]
    : null;

  const usedCards = [...handCards, ...board];
  const currentSelected = selectionMode === 'hand' ? handCards : board;
  const maxCards = selectionMode === 'hand' ? 2 : 5;
  const useCompactCards = currentHoleCards !== null;
  const useTightCards = board.length > 0;

  const clearHoleCards = () => setHandCards([]);
  const clearBoard = () => setBoard([]);
  const clearAll = () => {
    setHandCards([]);
    setBoard([]);
    setSelectionMode('hand');
  };

  const analysisContent = (
    <AnalysisSummary
      holeCards={currentHoleCards}
      board={board}
      heroPosition={heroPosition}
      villainPosition={villainPosition}
    />
  );

  return (
    <>
      <main className="h-dvh w-full bg-gray-900 text-white p-2 flex flex-col overflow-hidden">
        <div className="w-full flex-1 flex flex-col gap-2 sm:gap-3 min-h-0">
          {/* Header */}
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Poker Range Analyzer</h1>
              <p className="hidden sm:block text-sm text-gray-400">GTO preflop ranges for 6-max NLH</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <PositionSelector
                selectedPosition={heroPosition}
                onPositionChange={setHeroPosition}
              />
              <button
                onClick={clearAll}
                className="self-start sm:self-end px-3 py-1 text-xs sm:py-1.5 sm:text-sm bg-gray-700 hover:bg-gray-600 rounded"
              >
                Clear all
              </button>
            </div>
          </header>

          {/* Mobile Layout - Single scrollable panel */}
          <div className="sm:hidden flex-1 overflow-y-auto space-y-2 pb-14">
            <div className="bg-gray-800 rounded-lg p-2 flex flex-col min-h-0">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setSelectionMode('hand')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${
                    selectionMode === 'hand'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Hand ({handCards.length}/2)
                </button>
                <button
                  onClick={() => setSelectionMode('board')}
                  className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${
                    selectionMode === 'board'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Board ({board.length}/5)
                </button>
              </div>
              <div className="flex-1 min-h-0 card-grid">
                <CardPicker
                  selectedCards={currentSelected}
                  disabledCards={usedCards}
                  maxCards={maxCards}
                  compact={useCompactCards}
                  tight={useTightCards}
                  onCardSelect={handleCardSelect}
                  onCardDeselect={handleCardSelect}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <HandDisplay cards={handCards} onClear={clearHoleCards} />
              <BoardDisplay board={board} onClear={clearBoard} />
            </div>

            {analysisContent}
          </div>

          {/* Mobile bottom bar to open Range */}
          <button
            onClick={() => setRangeSheetOpen(true)}
            className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 py-3 flex flex-col items-center justify-center text-white z-40"
            aria-label="View Range"
          >
            <div className="w-10 h-1 bg-gray-500 rounded-full mb-1" />
            <span className="text-xs font-semibold">{heroPosition} Range</span>
          </button>

          {/* Desktop Layout */}
          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 flex-1 min-h-0">
            <div className="lg:col-span-8 flex flex-col gap-2 sm:gap-3 min-h-0">
              <div className="bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col flex-1 min-h-0">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setSelectionMode('hand')}
                    className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${
                      selectionMode === 'hand'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Hand ({handCards.length}/2)
                  </button>
                  <button
                    onClick={() => setSelectionMode('board')}
                    className={`flex-1 py-2 px-3 rounded text-sm font-semibold transition-all ${
                      selectionMode === 'board'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Board ({board.length}/5)
                  </button>
                </div>
                <div className="flex-1 min-h-0 card-grid">
                  <CardPicker
                    selectedCards={currentSelected}
                    disabledCards={usedCards}
                    maxCards={maxCards}
                    compact={useCompactCards}
                    tight={useTightCards}
                    onCardSelect={handleCardSelect}
                    onCardDeselect={handleCardSelect}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <HandDisplay cards={handCards} onClear={clearHoleCards} />
                <BoardDisplay board={board} onClear={clearBoard} />
              </div>

              {analysisContent}
            </div>

            <div className="lg:col-span-4 min-h-0">
              <RangeMatrix position={heroPosition} selectedHand={currentHoleCards} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Range Sheet - outside main to avoid overflow issues */}
      <RangeSheet
        isOpen={rangeSheetOpen}
        onClose={() => setRangeSheetOpen(false)}
        position={heroPosition}
        selectedHand={currentHoleCards}
      />
    </>
  );
}
