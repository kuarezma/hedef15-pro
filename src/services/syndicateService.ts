import { Column } from '../core/types';

export interface SyndicatePoolData {
  title: string;
  creatorName: string;
  totalShares: number;
  totalCostTL: number;
  columns: string[];
  createdAt: string;
}

const POOL_STORAGE_PREFIX = 'hedef15_pool_';

export function encodePoolToUrl(pool: SyndicatePoolData, baseUrl?: string): string {
  const json = JSON.stringify(pool);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.href : 'https://hedef15.local/');
  const url = new URL(origin);
  url.searchParams.set('havuz', encoded);
  return url.toString();
}

export function decodePoolFromUrl(search?: string): SyndicatePoolData | null {
  try {
    const query = search ?? (typeof window !== 'undefined' ? window.location.search : '');
    const param = new URLSearchParams(query).get('havuz');
    if (!param) return null;
    const json = decodeURIComponent(escape(atob(param)));
    return JSON.parse(json) as SyndicatePoolData;
  } catch {
    return null;
  }
}

export function savePoolLocally(poolId: string, data: SyndicatePoolData): void {
  try {
    localStorage.setItem(`${POOL_STORAGE_PREFIX}${poolId}`, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadPoolLocally(poolId: string): SyndicatePoolData | null {
  try {
    const raw = localStorage.getItem(`${POOL_STORAGE_PREFIX}${poolId}`);
    return raw ? (JSON.parse(raw) as SyndicatePoolData) : null;
  } catch {
    return null;
  }
}

export function columnsToPoolStrings(columns: Column[]): string[] {
  return columns.map(c => c.join(''));
}

export function poolStringsToColumns(strings: string[]): Column[] {
  return strings.map(s => s.split('') as Column);
}
