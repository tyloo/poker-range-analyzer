'use client';

import { Card, HoleCards, Position, ActionRecommendation } from '@/lib/types';
import { classifyHoleCards } from '@/lib/cards';
import { evaluateHand, getHandRankValue } from '@/lib/handStrength';
import { calculateEquityVsRange } from '@/lib/equity';
import { getHandAction } from '@/lib/ranges';
import { useMemo, useTransition, useEffect, useState, useRef } from 'react';

interface ActionAdviceProps {
  holeCards: HoleCards;
  board: Card[];
  heroPosition: Position;
  villainPosition: Position;
}

function getActionRecommendation(
  holeCards: HoleCards,
  board: Card[],
  heroPosition: Position,
  equity: number
): ActionRecommendation {
  if (!holeCards) {
    return { action: 'fold', confidence: 'low', reasoning: 'No cards' };
  }

  const classification = classifyHoleCards(holeCards);
  const rangeAction = classification ? getHandAction(heroPosition, classification.hand) : null;

  if (board.length === 0) {
    if (!rangeAction || rangeAction.fold === 100) {
      return { action: 'fold', confidence: 'high', reasoning: `${classification?.hand} not in range` };
    }
    if (rangeAction.raise >= 75) {
      return { action: 'raise', sizing: '2.5-3x', confidence: 'high', reasoning: 'Strong open' };
    }
    if (rangeAction.raise > 0) {
      return { action: 'raise', sizing: '2.5x', confidence: 'medium', reasoning: `Mixed (${rangeAction.raise}%)` };
    }
    return { action: 'call', confidence: 'medium', reasoning: 'Calling range' };
  }

  const handStrength = evaluateHand(holeCards, board);
  const handValue = getHandRankValue(handStrength.rank);

  if (handValue >= 7) {
    return { action: 'raise', sizing: '75-100%', confidence: 'high', reasoning: handStrength.description };
  }
  if (handValue >= 5) {
    return { action: 'raise', sizing: '50-75%', confidence: 'high', reasoning: handStrength.description };
  }
  if (equity >= 60) {
    return { action: 'raise', sizing: '50-66%', confidence: 'medium', reasoning: `${equity.toFixed(0)}% equity` };
  }
  if (equity >= 45) {
    return handValue >= 3
      ? { action: 'call', confidence: 'medium', reasoning: `${equity.toFixed(0)}% equity` }
      : { action: 'check', confidence: 'medium', reasoning: 'Pot control' };
  }
  if (equity >= 30) {
    return { action: 'call', confidence: 'low', reasoning: 'Draw potential' };
  }
  return { action: 'fold', confidence: equity < 25 ? 'high' : 'medium', reasoning: `Low equity (${equity.toFixed(0)}%)` };
}

const ACTION_COLORS = {
  raise: 'bg-green-600',
  call: 'bg-blue-600',
  check: 'bg-yellow-600',
  fold: 'bg-red-600',
};

export default function ActionAdvice({ holeCards, board, heroPosition, villainPosition }: ActionAdviceProps) {
  const [, startTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<ActionRecommendation | null>(null);
  const prevInputsRef = useRef<string>('');

  // Compute a stable key for the current inputs
  const inputsKey = useMemo(() => {
    if (!holeCards) return '';
    return `${holeCards[0].rank}${holeCards[0].suit}-${holeCards[1].rank}${holeCards[1].suit}-${board.map(c => `${c.rank}${c.suit}`).join('-')}-${heroPosition}-${villainPosition}`;
  }, [holeCards, board, heroPosition, villainPosition]);

  // Update recommendation when inputs change, using transition for non-blocking updates
  useEffect(() => {
    // Early return if no hole cards - recommendation will be stale but component won't render
    if (!holeCards) {
      prevInputsRef.current = '';
      return;
    }

    // Only recalculate if inputs actually changed
    if (inputsKey === prevInputsRef.current) {
      return;
    }
    prevInputsRef.current = inputsKey;

    // Use transition so the UI remains responsive during calculation
    startTransition(() => {
      const equity = calculateEquityVsRange(holeCards, board, villainPosition, 500);
      const rec = getActionRecommendation(holeCards, board, heroPosition, equity.equity);
      setRecommendation(rec);
    });
  }, [holeCards, board, heroPosition, villainPosition, inputsKey]);

  // Don't render if no cards - no need to setState to null
  if (!holeCards || !recommendation) {
    return null;
  }

  return (
    <div className={`rounded-lg p-2 sm:p-3 ${ACTION_COLORS[recommendation.action]}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white uppercase">
          {recommendation.action}
        </span>
        {recommendation.sizing && (
          <span className="text-base text-white opacity-80">{recommendation.sizing}</span>
        )}
      </div>
      <p className="text-xs text-white opacity-80">{recommendation.reasoning}</p>
    </div>
  );
}
