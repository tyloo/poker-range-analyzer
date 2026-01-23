export type Suit = 'h' | 'd' | 'c' | 's';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HoleCards = [Card, Card] | null;
export type Board = Card[];

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface RangeAction {
  raise: number;  // 0-100 frequency
  call: number;   // 0-100 frequency
  fold: number;   // 0-100 frequency
}

export type PositionRange = {
  [hand: string]: RangeAction;
};

export type HandType = 'pair' | 'suited' | 'offsuit';

export interface HandClassification {
  hand: string;       // e.g., "AKs", "QQ", "T9o"
  type: HandType;
  highRank: Rank;
  lowRank: Rank;
}

export type MadeHandRank =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush';

export interface HandStrength {
  rank: MadeHandRank;
  description: string;
  kickers: Rank[];
}

export interface EquityResult {
  equity: number;           // 0-100
  win: number;              // win percentage
  tie: number;              // tie percentage
  samples: number;          // iterations run
}

export interface BoardTexture {
  isPaired: boolean;
  isMonotone: boolean;      // 3+ same suit
  isTwoTone: boolean;       // 2 of same suit
  isRainbow: boolean;       // all different suits
  hasFlushDraw: boolean;
  hasStraightDraw: boolean;
  highCard: Rank | null;
  connectivity: 'connected' | 'gapped' | 'disconnected';
}

export interface ActionRecommendation {
  action: 'raise' | 'call' | 'fold' | 'check';
  sizing?: string;          // e.g., "3x", "75% pot"
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}
