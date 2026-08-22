import { WEEK2_MATCHES } from './officialBulletins';

/**
 * Güncel kupon bülteni = resmi Spor Toto 2. hafta 15'lisi.
 * Skorlar canlı tablodan + yayımlanmış MS yedeklerinden gelir; burada yalnızca fikstür/oran vardır.
 */
export const INITIAL_MATCHES = WEEK2_MATCHES;

export const INITIAL_FILTERS = {
  enabled: true,
  count1: [4, 11] as [number, number],
  countX: [1, 6] as [number, number],
  count2: [1, 6] as [number, number],
  surpriseCount: [1, 7] as [number, number],
  maxConsecutive1: 4,
  maxConsecutiveX: 3,
  maxConsecutive2: 3,
  signChanges: [4, 12] as [number, number],
  groupFilters: [
    {
      groupId: 'super_lig',
      groupName: 'Süper Lig',
      matchIds: [1, 4, 5, 6, 10, 11, 12, 13, 15],
      min1: 3,
      max1: 8,
      minX: 0,
      maxX: 4,
      min2: 0,
      max2: 4,
      minSurprise: 0,
      maxSurprise: 3,
      enabled: false
    },
    {
      groupId: 'avrupa',
      groupName: 'Avrupa (Maç 2, 3, 7-9, 14)',
      matchIds: [2, 3, 7, 8, 9, 14],
      min1: 1,
      max1: 5,
      minX: 0,
      maxX: 3,
      min2: 1,
      max2: 4,
      minSurprise: 0,
      maxSurprise: 3,
      enabled: false
    }
  ]
};
