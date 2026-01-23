import { Card, Rank, Suit, HoleCards, HandClassification, HandType } from './types';

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS: Suit[] = ['h', 'd', 'c', 's'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

export const SUIT_NAMES: Record<Suit, string> = {
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
  s: 'spades',
};

export const RANK_VALUES: Record<Rank, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
};

export function parseCard(str: string): Card | null {
  if (str.length !== 2) return null;
  const rank = str[0].toUpperCase() as Rank;
  const suit = str[1].toLowerCase() as Suit;
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null;
  return { rank, suit };
}

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function formatCard(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

export function isSameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function cardsContain(cards: Card[], card: Card): boolean {
  return cards.some(c => isSameCard(c, card));
}

export function classifyHoleCards(cards: HoleCards): HandClassification | null {
  if (!cards) return null;

  const [card1, card2] = cards;
  const val1 = RANK_VALUES[card1.rank];
  const val2 = RANK_VALUES[card2.rank];

  const highRank = val1 >= val2 ? card1.rank : card2.rank;
  const lowRank = val1 >= val2 ? card2.rank : card1.rank;

  let type: HandType;
  let hand: string;

  if (card1.rank === card2.rank) {
    type = 'pair';
    hand = `${highRank}${lowRank}`;
  } else if (card1.suit === card2.suit) {
    type = 'suited';
    hand = `${highRank}${lowRank}s`;
  } else {
    type = 'offsuit';
    hand = `${highRank}${lowRank}o`;
  }

  return { hand, type, highRank, lowRank };
}

export function getHandNotation(rank1: Rank, rank2: Rank, type: 'pair' | 'suited' | 'offsuit'): string {
  const val1 = RANK_VALUES[rank1];
  const val2 = RANK_VALUES[rank2];
  const high = val1 >= val2 ? rank1 : rank2;
  const low = val1 >= val2 ? rank2 : rank1;

  if (type === 'pair') return `${high}${low}`;
  if (type === 'suited') return `${high}${low}s`;
  return `${high}${low}o`;
}

export function getAllCombos(hand: string): Card[][] {
  const combos: Card[][] = [];

  if (hand.length === 2) {
    // Pocket pair
    const rank = hand[0] as Rank;
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        combos.push([
          { rank, suit: SUITS[i] },
          { rank, suit: SUITS[j] },
        ]);
      }
    }
  } else if (hand.endsWith('s')) {
    // Suited
    const rank1 = hand[0] as Rank;
    const rank2 = hand[1] as Rank;
    for (const suit of SUITS) {
      combos.push([
        { rank: rank1, suit },
        { rank: rank2, suit },
      ]);
    }
  } else if (hand.endsWith('o')) {
    // Offsuit
    const rank1 = hand[0] as Rank;
    const rank2 = hand[1] as Rank;
    for (const suit1 of SUITS) {
      for (const suit2 of SUITS) {
        if (suit1 !== suit2) {
          combos.push([
            { rank: rank1, suit: suit1 },
            { rank: rank2, suit: suit2 },
          ]);
        }
      }
    }
  }

  return combos;
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function removeCards(deck: Card[], toRemove: Card[]): Card[] {
  return deck.filter(card => !cardsContain(toRemove, card));
}
