'use client';

import { memo, useEffect, useState, useMemo } from 'react';
import { Card as CardType, HoleCards, Position, EquityResult, ActionRecommendation } from '@/lib/types';
import { classifyHoleCards } from '@/lib/cards';
import { analyzeBoardTexture, evaluateHand, getHandRankValue } from '@/lib/handStrength';
import { calculateEquityVsRange } from '@/lib/equity';
import { getHandAction } from '@/lib/ranges';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnalysisSummaryProps {
  holeCards: HoleCards;
  board: CardType[];
  heroPosition: Position;
  villainPosition: Position;
}

const ACTION_VARIANTS = {
  raise: 'bg-green-600 hover:bg-green-600',
  call: 'bg-blue-600 hover:bg-blue-600',
  check: 'bg-yellow-600 hover:bg-yellow-600',
  fold: 'bg-red-600 hover:bg-red-600',
} as const;

// Pure function - moved to module scope
const getActionRecommendation = (
  holeCards: HoleCards,
  board: CardType[],
  heroPosition: Position,
  equity: number
): ActionRecommendation => {
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
};

// Static empty state component - hoisted outside
const EmptyState = (
  <Card size="sm" className="py-2 min-h-[72px]">
    <CardContent className="px-3 flex items-center">
      <p className="text-sm text-muted-foreground">Select cards to analyze</p>
    </CardContent>
  </Card>
);

function AnalysisSummary({
  holeCards,
  board,
  heroPosition,
  villainPosition,
}: AnalysisSummaryProps) {
  const [equity, setEquity] = useState<EquityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [recommendation, setRecommendation] = useState<ActionRecommendation | null>(null);

  useEffect(() => {
    if (!holeCards) {
      setEquity(null);
      setRecommendation(null);
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      const result = calculateEquityVsRange(holeCards, board, villainPosition, 1000);
      setEquity(result);
      setRecommendation(getActionRecommendation(holeCards, board, heroPosition, result.equity));
      setIsCalculating(false);
    }, 10);

    return () => clearTimeout(timer);
  }, [holeCards, board, heroPosition, villainPosition]);

  // Memoize derived values that don't depend on async state
  const classification = useMemo(
    () => (holeCards ? classifyHoleCards(holeCards) : null),
    [holeCards]
  );

  const handStrength = useMemo(
    () => (holeCards && board.length >= 3 ? evaluateHand(holeCards, board) : null),
    [holeCards, board]
  );

  const boardTexture = useMemo(
    () => (board.length >= 3 ? analyzeBoardTexture(board) : null),
    [board]
  );

  const rangeAction = useMemo(
    () => (classification ? getHandAction(heroPosition, classification.hand) : null),
    [classification, heroPosition]
  );

  if (!holeCards) {
    return EmptyState;
  }

  return (
    <Card size="sm" className="py-2 min-h-[72px]">
      <CardContent className="px-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {/* Hand classification */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-semibold">{classification?.hand}</span>
          <span className="text-[11px] text-muted-foreground capitalize">{classification?.type}</span>
          {rangeAction && (
            <div className="flex items-center gap-1">
              {rangeAction.raise > 0 && (
                <Badge className="bg-green-600 hover:bg-green-600 text-[10px]">
                  R{rangeAction.raise}%
                </Badge>
              )}
              {rangeAction.call > 0 && (
                <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px]">
                  C{rangeAction.call}%
                </Badge>
              )}
              {rangeAction.fold === 100 && (
                <Badge variant="destructive" className="text-[10px]">
                  Fold
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Equity */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Equity vs {villainPosition}</span>
          {isCalculating ? (
            <span className="animate-pulse">...</span>
          ) : equity ? (
            <span className="font-semibold text-foreground">{equity.equity.toFixed(1)}%</span>
          ) : (
            <span>--</span>
          )}
          {equity && !isCalculating && (
            <span className="text-[11px]">W {equity.win.toFixed(0)}% | T {equity.tie.toFixed(0)}%</span>
          )}
        </div>

        {/* Action recommendation */}
        {recommendation && (
          <div className="flex items-center gap-2">
            <Badge className={cn('text-[10px] text-white', ACTION_VARIANTS[recommendation.action])}>
              {recommendation.action.toUpperCase()}
            </Badge>
            {recommendation.sizing && (
              <span className="text-muted-foreground">{recommendation.sizing}</span>
            )}
            <span className="text-muted-foreground">
              {recommendation.reasoning}
            </span>
          </div>
        )}

        {/* Made hand & board texture */}
        {(handStrength || boardTexture) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            {handStrength && <span>Made: {handStrength.description}</span>}
            {boardTexture && (
              <span className="flex items-center gap-1 text-[10px]">
                {boardTexture.isPaired && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-yellow-600/20 text-yellow-500">
                    Paired
                  </Badge>
                )}
                {boardTexture.isMonotone && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-purple-600/20 text-purple-400">
                    Mono
                  </Badge>
                )}
                {boardTexture.isTwoTone && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-blue-600/20 text-blue-400">
                    2-tone
                  </Badge>
                )}
                {boardTexture.isRainbow && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-green-600/20 text-green-400">
                    Rainbow
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 capitalize">
                  {boardTexture.connectivity}
                </Badge>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(AnalysisSummary);
