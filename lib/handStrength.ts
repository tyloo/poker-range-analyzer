import { Card, Rank, HandStrength, MadeHandRank, BoardTexture } from './types';
import { RANK_VALUES } from './cards';

export function evaluateHand(holeCards: Card[], board: Card[]): HandStrength {
  const allCards = [...holeCards, ...board];

  if (allCards.length < 5) {
    return {
      rank: 'high-card',
      description: 'Incomplete hand',
      kickers: [],
    };
  }

  // Find best 5-card hand from all available cards
  const combos = getCombinations(allCards, 5);
  let bestHand: HandStrength = {
    rank: 'high-card',
    description: 'High card',
    kickers: [],
  };
  let bestScore = 0;

  for (const combo of combos) {
    const hand = evaluateFiveCards(combo);
    const score = getHandScore(hand);
    if (score > bestScore) {
      bestScore = score;
      bestHand = hand;
    }
  }

  return bestHand;
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];

  function combine(start: number, combo: T[]) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return result;
}

function evaluateFiveCards(cards: Card[]): HandStrength {
  const ranks = cards.map(c => c.rank).sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);
  const suits = cards.map(c => c.suit);
  const values = cards.map(c => RANK_VALUES[c.rank]).sort((a, b) => b - a);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(values);
  const rankCounts = getRankCounts(ranks);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // Royal flush
  if (isFlush && isStraight && values[0] === 14) {
    return { rank: 'royal-flush', description: 'Royal Flush', kickers: [] };
  }

  // Straight flush
  if (isFlush && isStraight) {
    return { rank: 'straight-flush', description: `Straight Flush, ${ranks[0]} high`, kickers: [] };
  }

  // Four of a kind
  if (counts[0] === 4) {
    const quadRank = getKeyByValue(rankCounts, 4);
    const kicker = ranks.find(r => r !== quadRank)!;
    return { rank: 'four-of-a-kind', description: `Four of a Kind, ${quadRank}s`, kickers: [kicker] };
  }

  // Full house
  if (counts[0] === 3 && counts[1] === 2) {
    const tripRank = getKeyByValue(rankCounts, 3);
    const pairRank = getKeyByValue(rankCounts, 2);
    return { rank: 'full-house', description: `Full House, ${tripRank}s full of ${pairRank}s`, kickers: [] };
  }

  // Flush
  if (isFlush) {
    return { rank: 'flush', description: `Flush, ${ranks[0]} high`, kickers: ranks.slice(1) as Rank[] };
  }

  // Straight
  if (isStraight) {
    return { rank: 'straight', description: `Straight, ${ranks[0]} high`, kickers: [] };
  }

  // Three of a kind
  if (counts[0] === 3) {
    const tripRank = getKeyByValue(rankCounts, 3);
    const kickers = ranks.filter(r => r !== tripRank).slice(0, 2) as Rank[];
    return { rank: 'three-of-a-kind', description: `Three of a Kind, ${tripRank}s`, kickers };
  }

  // Two pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.entries(rankCounts)
      .filter(([, count]) => count === 2)
      .map(([rank]) => rank as Rank)
      .sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);
    const kicker = ranks.find(r => !pairs.includes(r))!;
    return { rank: 'two-pair', description: `Two Pair, ${pairs[0]}s and ${pairs[1]}s`, kickers: [kicker] };
  }

  // One pair
  if (counts[0] === 2) {
    const pairRank = getKeyByValue(rankCounts, 2);
    const kickers = ranks.filter(r => r !== pairRank).slice(0, 3) as Rank[];
    return { rank: 'pair', description: `Pair of ${pairRank}s`, kickers };
  }

  // High card
  return { rank: 'high-card', description: `${ranks[0]} high`, kickers: ranks.slice(1) as Rank[] };
}

function checkStraight(values: number[]): boolean {
  const sorted = Array.from(new Set(values)).sort((a, b) => b - a);

  // Check regular straight
  if (sorted.length >= 5) {
    for (let i = 0; i <= sorted.length - 5; i++) {
      if (sorted[i] - sorted[i + 4] === 4) {
        return true;
      }
    }
  }

  // Check wheel (A-2-3-4-5)
  if (sorted.includes(14) && sorted.includes(5) && sorted.includes(4) &&
      sorted.includes(3) && sorted.includes(2)) {
    return true;
  }

  return false;
}

function getRankCounts(ranks: Rank[]): Record<Rank, number> {
  const counts = {} as Record<Rank, number>;
  for (const rank of ranks) {
    counts[rank] = (counts[rank] || 0) + 1;
  }
  return counts;
}

function getKeyByValue(obj: Record<Rank, number>, value: number): Rank {
  return Object.entries(obj).find(([, v]) => v === value)?.[0] as Rank;
}

function getHandScore(hand: HandStrength): number {
  const rankScores: Record<MadeHandRank, number> = {
    'high-card': 1,
    'pair': 2,
    'two-pair': 3,
    'three-of-a-kind': 4,
    'straight': 5,
    'flush': 6,
    'full-house': 7,
    'four-of-a-kind': 8,
    'straight-flush': 9,
    'royal-flush': 10,
  };
  return rankScores[hand.rank];
}

export function analyzeBoardTexture(board: Card[]): BoardTexture {
  if (board.length === 0) {
    return {
      isPaired: false,
      isMonotone: false,
      isTwoTone: false,
      isRainbow: false,
      hasFlushDraw: false,
      hasStraightDraw: false,
      highCard: null,
      connectivity: 'disconnected',
    };
  }

  const ranks = board.map(c => c.rank);
  const suits = board.map(c => c.suit);
  const values = board.map(c => RANK_VALUES[c.rank]);

  // Check for paired board
  const rankCounts = getRankCounts(ranks);
  const isPaired = Object.values(rankCounts).some(c => c >= 2);

  // Check suit texture
  const suitCounts: Record<string, number> = {};
  for (const suit of suits) {
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;
  }
  const maxSuitCount = Math.max(...Object.values(suitCounts));

  const isMonotone = maxSuitCount >= 3;
  const isTwoTone = maxSuitCount === 2 && board.length >= 3;
  const isRainbow = maxSuitCount === 1;
  const hasFlushDraw = maxSuitCount >= 2 && board.length < 5;

  // Check connectivity
  const sortedValues = Array.from(new Set(values)).sort((a, b) => a - b);
  let maxConnected = 1;
  let currentConnected = 1;

  for (let i = 1; i < sortedValues.length; i++) {
    const gap = sortedValues[i] - sortedValues[i - 1];
    if (gap <= 2) {
      currentConnected++;
      maxConnected = Math.max(maxConnected, currentConnected);
    } else {
      currentConnected = 1;
    }
  }

  const hasStraightDraw = maxConnected >= 2;
  const connectivity = maxConnected >= 3 ? 'connected' : maxConnected >= 2 ? 'gapped' : 'disconnected';

  // Find high card
  const highCard = ranks.reduce((high, rank) =>
    RANK_VALUES[rank] > RANK_VALUES[high] ? rank : high
  );

  return {
    isPaired,
    isMonotone,
    isTwoTone,
    isRainbow,
    hasFlushDraw,
    hasStraightDraw,
    highCard,
    connectivity,
  };
}

export function getHandRankValue(rank: MadeHandRank): number {
  const values: Record<MadeHandRank, number> = {
    'high-card': 1,
    'pair': 2,
    'two-pair': 3,
    'three-of-a-kind': 4,
    'straight': 5,
    'flush': 6,
    'full-house': 7,
    'four-of-a-kind': 8,
    'straight-flush': 9,
    'royal-flush': 10,
  };
  return values[rank];
}
