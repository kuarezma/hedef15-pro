export type Outcome = '1' | 'X' | '2';

export interface MatchSelection {
  '1': boolean;
  'X': boolean;
  '2': boolean;
}

export interface MatchProbabilities {
  '1': number; // percentage (0-100)
  'X': number;
  '2': number;
}

export interface MatchOdds {
  '1': number;
  'X': number;
  '2': number;
}

export interface Match {
  id: number;
  order: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
  matchTime: string;
  odds: MatchOdds;
  publicPicks: MatchProbabilities; // Toto public distribution %
  aiPicks: MatchProbabilities;     // AI / Statistical calculated %
  userPicks: MatchSelection;       // Active selection
  userPercents: MatchProbabilities;// Custom user % for probabilistic mode
  group?: string;                  // e.g. "Süper Lig", "Premier Lig", "Grup A"
  isBanko?: boolean;
}

export type FormulaType =
  | 'flat'                  // Düz Kupon
  | 'guaranteed_custom'     // Garantili Özel Sistem (14/13/12 Garanti)
  | 'nine_columns'          // 9 Kolonlu Garantili Matris
  | 'probabilistic'         // % Yüzdesel Formül
  | 'comprehensive'         // Kapsamlı Formül
  | 'super_seven'           // Süper Yedili Formülü
  | 'site_ideal'            // Yapay Zeka Site İdeal Formülü
  | 'closed_only'           // Kapalı Formülü (Tüm maçlar 3 ihtimal)
  | 'double_only'           // Çifte Formülü (Tüm maçlar 2 ihtimal)
  | 'chance_come';          // Şans Gele Formülü

export type GuaranteeTier = '15' | '14' | '13' | '12';

export interface FilterConfig {
  enabled: boolean;
  // 1, X, 2 total counts in the column
  count1: [number, number]; // [min, max] (0-15)
  countX: [number, number]; // [min, max] (0-15)
  count2: [number, number]; // [min, max] (0-15)
  
  // Surprise filtering (based on user's primary/secondary/tertiary odds or manual assignment)
  surpriseCount: [number, number]; // [min, max]
  
  // Consecutives (Peş peşe aynı sonucun gelmesi)
  maxConsecutive1: number;
  maxConsecutiveX: number;
  maxConsecutive2: number;
  
  // Sign Changes / Fluctuation (Dalgalanma: 1->X, X->2, 2->1)
  signChanges: [number, number]; // [min, max]
  
  // Group filters
  groupFilters: {
    groupId: string;
    groupName: string;
    matchIds: number[];
    min1: number;
    max1: number;
    minX: number;
    maxX: number;
    min2: number;
    max2: number;
    minSurprise: number;
    maxSurprise: number;
    enabled: boolean;
  }[];
  
  // Interlock / Base Column difference filter
  referenceColumn?: Outcome[];
  minMatchWithRef?: number;
  maxMatchWithRef?: number;
}

export type Column = Outcome[]; // Array of 15 outcomes

export interface ReductionSummary {
  rawCombinations: number;
  filteredCombinations: number;
  reducedColumns: number;
  totalCostTL: number;
  unitPriceTL: number;
  estimatedGuaranteeRatio: {
    '15': number; // percentage chance if picks hold
    '14': number;
    '13': number;
    '12': number;
  };
  durationMs: number;
}

export interface ValueBetAnalysis {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  outcome: Outcome;
  marketImpliedProb: number;
  publicPickProb: number;
  valueRatio: number; // marketProb / publicProb (> 1.0 means positive expected value)
  recommendation: 'STRONG_VALUE' | 'VALUE' | 'FAIR' | 'OVERPRICED';
  rationale: string;
}

export interface PrizeSimulation {
  totalTurnoverTL: number; // Hasılat
  rollover15TL: number;    // Devir eden tutar
  payoutRate: number;      // e.g. 0.50
  pool15: number;
  pool14: number;
  pool13: number;
  pool12: number;
  estimatedWinners: {
    '15': number;
    '14': number;
    '13': number;
    '12': number;
  };
  estimatedPayoutPerWinner: {
    '15': number;
    '14': number;
    '13': number;
    '12': number;
  };
}

export type MatchPlayStatus = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED' | 'POSTPONED';

export interface LiveMatchStatus {
  matchId: number;
  homeScore: number;
  awayScore: number;
  minute: number; // 0-90+, informational only — do not treat 90 as finished
  displayClock: string;
  status: MatchPlayStatus;
  /** 1/X/2 only after kickoff. Null before the match starts (never fake 0-0 as X). */
  currentOutcome: Outcome | null;
  /** Lowest-odds (highest implied probability) 1X2 market pick */
  favoriteOutcome: Outcome;
  favoriteImpliedPct: number;
  marketOdds?: MatchOdds;
  kickoffIso?: string;
  matched: boolean;
}

export interface LiveRadarState {
  currentOutcomes: Array<Outcome | null>;
  columnGrades: {
    column: Column;
    currentHits: number;
    potentialMaxHits: number;
    status: 'ACTIVE_15' | 'ACTIVE_14' | 'ACTIVE_13' | 'ACTIVE_12' | 'LOST';
  }[];
  counts: {
    '15': number;
    '14': number;
    '13': number;
    '12': number;
    lost: number;
  };
}

export interface SyndicateShare {
  id: string;
  title: string;
  totalShares: number;
  pricePerShare: number;
  soldShares: number;
  creatorName: string;
  columnsCount: number;
  totalCostTL: number;
  shareUrl?: string;
}

export interface SavedCoupon {
  id: string;
  name: string;
  createdAt: string;
  formulaType: FormulaType;
  guaranteeTier: GuaranteeTier;
  columnCount: number;
  totalCostTL: number;
  columns: Column[];
  matches: Match[];
  notes?: string;
}
