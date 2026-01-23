'use client';

import { Card, HoleCards, Position, EquityResult } from '@/lib/types';
import { classifyHoleCards } from '@/lib/cards';
import { evaluateHand, analyzeBoardTexture } from '@/lib/handStrength';
import { calculateEquityVsRange } from '@/lib/equity';
import { getHandAction } from '@/lib/ranges';
import { useEffect, useState } from 'react';

interface HandAnalysisProps {
  holeCards: HoleCards;
  board: Card[];
  heroPosition: Position;
  villainPosition: Position;
}

export default function HandAnalysis({
  holeCards,
  board,
  heroPosition,
  villainPosition,
}: HandAnalysisProps) {
  const [equity, setEquity] = useState<EquityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!holeCards) {
      setEquity(null);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      const result = calculateEquityVsRange(holeCards, board, villainPosition, 1000);
      setEquity(result);
      setIsCalculating(false);
    }, 10);

    return () => clearTimeout(timer);
  }, [holeCards, board, villainPosition]);

  if (!holeCards) {
    return (
      <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
        <p className="text-sm text-gray-400">Select cards to analyze</p>
      </div>
    );
  }

  const classification = classifyHoleCards(holeCards);
  const handStrength = board.length >= 3 ? evaluateHand(holeCards, board) : null;
  const boardTexture = board.length >= 3 ? analyzeBoardTexture(board) : null;
  const rangeAction = classification ? getHandAction(heroPosition, classification.hand) : null;

  return (
    <div className="bg-gray-800 rounded-lg p-2 sm:p-3 space-y-3">
      {/* Hand + Range Status */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-white">{classification?.hand}</span>
          <span className="text-xs text-gray-400 ml-1 capitalize">{classification?.type}</span>
        </div>
        {rangeAction && (
          <div className="flex gap-1">
            {rangeAction.raise > 0 && (
              <span className="px-2 py-0.5 bg-green-600 rounded text-xs text-white">
                R{rangeAction.raise}%
              </span>
            )}
            {rangeAction.call > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 rounded text-xs text-white">
                C{rangeAction.call}%
              </span>
            )}
            {rangeAction.fold === 100 && (
              <span className="px-2 py-0.5 bg-red-600 rounded text-xs text-white">
                Fold
              </span>
            )}
          </div>
        )}
      </div>

      {/* Equity */}
      <div className="bg-gray-700 rounded p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Equity vs {villainPosition}</span>
          {isCalculating ? (
            <span className="text-sm text-gray-400">...</span>
          ) : equity ? (
            <span className="text-2xl font-bold text-white">{equity.equity.toFixed(1)}%</span>
          ) : null}
        </div>
        {equity && !isCalculating && (
          <div className="text-xs text-gray-500">
            Win {equity.win.toFixed(0)}% | Tie {equity.tie.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Made Hand + Board Texture */}
      {(handStrength || boardTexture) && (
        <div className="space-y-1">
          {handStrength && (
            <div className="text-xs">
              <span className="text-gray-400">Made: </span>
              <span className="text-white font-medium">{handStrength.description}</span>
            </div>
          )}
          {boardTexture && (
            <div className="flex flex-wrap gap-1">
              {boardTexture.isPaired && (
                <span className="px-1.5 py-0.5 bg-yellow-600 rounded text-[10px]">Paired</span>
              )}
              {boardTexture.isMonotone && (
                <span className="px-1.5 py-0.5 bg-purple-600 rounded text-[10px]">Mono</span>
              )}
              {boardTexture.isTwoTone && (
                <span className="px-1.5 py-0.5 bg-blue-600 rounded text-[10px]">2-tone</span>
              )}
              {boardTexture.isRainbow && (
                <span className="px-1.5 py-0.5 bg-green-600 rounded text-[10px]">Rainbow</span>
              )}
              <span className="px-1.5 py-0.5 bg-gray-600 rounded text-[10px] capitalize">
                {boardTexture.connectivity}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
