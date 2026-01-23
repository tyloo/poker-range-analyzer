'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, Position, HoleCards } from '@/lib/types';
import { isSameCard } from '@/lib/cards';
import PositionSelector from '@/components/PositionSelector';
import CardPicker from '@/components/CardPicker';
import HandDisplay from '@/components/HandDisplay';
import BoardDisplay from '@/components/BoardDisplay';
import RangeMatrix from '@/components/RangeMatrix';
import AnalysisSummary from '@/components/AnalysisSummary';
import RangeSheet from '@/components/RangeSheet';
import { Button } from '@/components/ui/button';
import { Card as CardContainer, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronUp } from 'lucide-react';

type SelectionMode = 'hand' | 'board';

export default function Home() {
  const [heroPosition, setHeroPosition] = useState<Position>('BTN');
  const [handCards, setHandCards] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('hand');
  const [rangeSheetOpen, setRangeSheetOpen] = useState(false);
  const villainPosition: Position = 'BB';

  // Memoize card lookup sets for O(1) lookups
  const handCardSet = useMemo(
    () => new Set(handCards.map(c => `${c.rank}${c.suit}`)),
    [handCards]
  );
  const boardCardSet = useMemo(
    () => new Set(board.map(c => `${c.rank}${c.suit}`)),
    [board]
  );

  // Memoized callbacks to prevent child re-renders
  const handleCardSelect = useCallback((card: Card) => {
    const cardKey = `${card.rank}${card.suit}`;
    const inHand = handCardSet.has(cardKey);
    const inBoard = boardCardSet.has(cardKey);

    if (inHand) {
      setHandCards(prev => prev.filter(c => !isSameCard(c, card)));
      return;
    }
    if (inBoard) {
      setBoard(prev => prev.filter(c => !isSameCard(c, card)));
      return;
    }

    if (selectionMode === 'hand') {
      setHandCards(prev => prev.length < 2 ? [...prev, card] : prev);
    } else {
      setBoard(prev => prev.length < 5 ? [...prev, card] : prev);
    }
  }, [handCardSet, boardCardSet, selectionMode]);

  const clearHoleCards = useCallback(() => setHandCards([]), []);
  const clearBoard = useCallback(() => setBoard([]), []);
  const clearAll = useCallback(() => {
    setHandCards([]);
    setBoard([]);
    setSelectionMode('hand');
  }, []);

  const openRangeSheet = useCallback(() => setRangeSheetOpen(true), []);
  const closeRangeSheet = useCallback(() => setRangeSheetOpen(false), []);

  const handleTabChange = useCallback(
    (value: string) => setSelectionMode(value as SelectionMode),
    []
  );

  // Memoize derived values
  const currentHoleCards: HoleCards = useMemo(
    () => handCards.length === 2 ? [handCards[0], handCards[1]] : null,
    [handCards]
  );

  const usedCards = useMemo(
    () => [...handCards, ...board],
    [handCards, board]
  );

  const currentSelected = selectionMode === 'hand' ? handCards : board;
  const maxCards = selectionMode === 'hand' ? 2 : 5;

  return (
    <>
      <main className="h-dvh w-full p-2 sm:p-3 flex flex-col overflow-hidden">
        <div className="w-full flex-1 flex flex-col gap-2 sm:gap-3 min-h-0">
          {/* Header */}
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Poker Range Analyzer</h1>
              <p className="hidden sm:block text-sm text-muted-foreground">
                GTO preflop ranges for 6-max NLH
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <PositionSelector
                selectedPosition={heroPosition}
                onPositionChange={setHeroPosition}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAll}
                className="hidden sm:inline-flex"
              >
                Clear all
              </Button>
            </div>
          </header>

          {/* Mobile fixed Clear All button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={clearAll}
            className="sm:hidden fixed top-2 right-2 z-50"
          >
            Clear all
          </Button>

          {/* Mobile Layout */}
          <div className="sm:hidden flex-1 overflow-y-auto space-y-2 pb-14">
            <CardContainer className="flex-1 min-h-0 py-3">
              <CardContent className="px-3 h-full flex flex-col gap-3">
                <Tabs value={selectionMode} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="hand" className="flex-1 data-active:!bg-primary data-active:!text-primary-foreground">
                      Hand ({handCards.length}/2)
                    </TabsTrigger>
                    <TabsTrigger value="board" className="flex-1 data-active:!bg-primary data-active:!text-primary-foreground">
                      Board ({board.length}/5)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex-1 min-h-0 h-[clamp(200px,35vh,400px)]">
                  <CardPicker
                    selectedCards={currentSelected}
                    disabledCards={usedCards}
                    maxCards={maxCards}
                    onCardSelect={handleCardSelect}
                    onCardDeselect={handleCardSelect}
                  />
                </div>
              </CardContent>
            </CardContainer>

            <div className="grid grid-cols-2 gap-2">
              <HandDisplay cards={handCards} onClear={clearHoleCards} />
              <BoardDisplay board={board} onClear={clearBoard} />
            </div>

            <AnalysisSummary
              holeCards={currentHoleCards}
              board={board}
              heroPosition={heroPosition}
              villainPosition={villainPosition}
            />
          </div>

          {/* Mobile bottom bar to open Range */}
          <button
            onClick={openRangeSheet}
            className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 flex flex-col items-center justify-center z-40 active:bg-accent"
            aria-label="View Range"
          >
            <ChevronUp className="w-5 h-5 text-muted-foreground mb-0.5" />
            <span className="text-xs font-semibold">{heroPosition} Range</span>
          </button>

          {/* Desktop Layout */}
          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 flex-1 min-h-0">
            <div className="lg:col-span-8 flex flex-col gap-2 sm:gap-3 min-h-0">
              <CardContainer className="flex-1 min-h-0 py-3">
                <CardContent className="px-3 h-full flex flex-col gap-3">
                  <Tabs value={selectionMode} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="hand" className="flex-1 data-active:!bg-primary data-active:!text-primary-foreground">
                        Hand ({handCards.length}/2)
                      </TabsTrigger>
                      <TabsTrigger value="board" className="flex-1 data-active:!bg-primary data-active:!text-primary-foreground">
                        Board ({board.length}/5)
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex-1 min-h-0 h-[clamp(240px,38vh,460px)]">
                    <CardPicker
                      selectedCards={currentSelected}
                      disabledCards={usedCards}
                      maxCards={maxCards}
                      onCardSelect={handleCardSelect}
                      onCardDeselect={handleCardSelect}
                    />
                  </div>
                </CardContent>
              </CardContainer>

              <div className="grid grid-cols-2 gap-2">
                <HandDisplay cards={handCards} onClear={clearHoleCards} />
                <BoardDisplay board={board} onClear={clearBoard} />
              </div>

              <AnalysisSummary
                holeCards={currentHoleCards}
                board={board}
                heroPosition={heroPosition}
                villainPosition={villainPosition}
              />
            </div>

            <div className="lg:col-span-4 min-h-0">
              <RangeMatrix position={heroPosition} selectedHand={currentHoleCards} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Range Sheet */}
      <RangeSheet
        isOpen={rangeSheetOpen}
        onClose={closeRangeSheet}
        position={heroPosition}
        selectedHand={currentHoleCards}
      />
    </>
  );
}
