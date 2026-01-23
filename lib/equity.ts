import { Card, EquityResult, Position, HoleCards } from './types';
import { createDeck, removeCards, shuffleDeck, getAllCombos } from './cards';
import { evaluateHand, getHandRankValue } from './handStrength';
import { getRangeForPosition, getHandAction } from './ranges';

const DEFAULT_ITERATIONS = 1000;

export function calculateEquityVsRange(
  heroCards: HoleCards,
  board: Card[],
  villainPosition: Position,
  iterations: number = DEFAULT_ITERATIONS
): EquityResult {
  if (!heroCards) {
    return { equity: 0, win: 0, tie: 0, samples: 0 };
  }

  const villainRange = getRangeForPosition(villainPosition);
  const usedCards = [...heroCards, ...board];
  const remainingDeck = removeCards(createDeck(), usedCards);

  // Get all villain hand combos that are in range and don't use blocked cards
  const villainCombos: Card[][] = [];

  for (const hand of Object.keys(villainRange)) {
    const action = getHandAction(villainPosition, hand);
    if (action.raise === 0 && action.call === 0) continue;

    const combos = getAllCombos(hand);
    for (const combo of combos) {
      // Check if combo is blocked by hero cards or board
      const isBlocked = combo.some(c =>
        usedCards.some(used => used.rank === c.rank && used.suit === c.suit)
      );
      if (!isBlocked) {
        villainCombos.push(combo);
      }
    }
  }

  if (villainCombos.length === 0) {
    return { equity: 100, win: 100, tie: 0, samples: 0 };
  }

  let wins = 0;
  let ties = 0;
  let samples = 0;

  for (let i = 0; i < iterations; i++) {
    // Pick random villain hand
    const villainHand = villainCombos[Math.floor(Math.random() * villainCombos.length)];

    // Remove villain cards from deck
    const deckWithoutVillain = removeCards(remainingDeck, villainHand);

    // Run out remaining board cards
    const cardsNeeded = 5 - board.length;
    const shuffled = shuffleDeck(deckWithoutVillain);
    const runout = shuffled.slice(0, cardsNeeded);
    const finalBoard = [...board, ...runout];

    // Evaluate hands
    const heroStrength = evaluateHand(heroCards, finalBoard);
    const villainStrength = evaluateHand(villainHand, finalBoard);

    const heroScore = getHandRankValue(heroStrength.rank);
    const villainScore = getHandRankValue(villainStrength.rank);

    if (heroScore > villainScore) {
      wins++;
    } else if (heroScore === villainScore) {
      // Compare kickers for same rank
      const comparison = compareKickers(heroStrength.kickers, villainStrength.kickers);
      if (comparison > 0) {
        wins++;
      } else if (comparison === 0) {
        ties++;
      }
    }
    samples++;
  }

  const winRate = (wins / samples) * 100;
  const tieRate = (ties / samples) * 100;
  const equity = winRate + (tieRate / 2);

  return {
    equity: Math.round(equity * 10) / 10,
    win: Math.round(winRate * 10) / 10,
    tie: Math.round(tieRate * 10) / 10,
    samples,
  };
}

function compareKickers(heroKickers: string[], villainKickers: string[]): number {
  const RANK_VALUES: Record<string, number> = {
    'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
  };

  for (let i = 0; i < Math.min(heroKickers.length, villainKickers.length); i++) {
    const heroValue = RANK_VALUES[heroKickers[i]] || 0;
    const villainValue = RANK_VALUES[villainKickers[i]] || 0;
    if (heroValue > villainValue) return 1;
    if (heroValue < villainValue) return -1;
  }
  return 0;
}

export function calculatePrelopEquity(
  heroCards: HoleCards,
  villainPosition: Position,
  iterations: number = DEFAULT_ITERATIONS
): EquityResult {
  return calculateEquityVsRange(heroCards, [], villainPosition, iterations);
}

export function estimateEV(
  equity: number,
  potSize: number,
  betSize: number
): { callEV: number; raiseEV: number; foldEV: number } {
  const equityDecimal = equity / 100;

  // EV of calling = (equity * pot after call) - (1 - equity) * call amount
  const potAfterCall = potSize + betSize;
  const callEV = (equityDecimal * potAfterCall) - ((1 - equityDecimal) * betSize);

  // Simplified raise EV estimate
  // Assumes villain folds some % and calls some %
  const foldEquity = 0.3; // Assume villain folds 30%
  const raiseAmount = betSize * 3;
  const raiseEV = (foldEquity * potSize) + ((1 - foldEquity) * ((equityDecimal * (potSize + raiseAmount * 2)) - raiseAmount));

  // Fold EV is always 0
  const foldEV = 0;

  return {
    callEV: Math.round(callEV * 100) / 100,
    raiseEV: Math.round(raiseEV * 100) / 100,
    foldEV,
  };
}
