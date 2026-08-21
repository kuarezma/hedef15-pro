/**
 * Writes src/data/sampleBulletin.ts from this weekend's real fixtures.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchWeeklyBulletin } from '../src/core/bulletinService';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function serializeMatch(match: {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchDate: string;
  matchTime: string;
  odds: { '1': number; 'X': number; '2': number };
  group: string;
}): string {
  return `  buildMatch({
    id: ${match.id},
    homeTeam: ${JSON.stringify(match.homeTeam)},
    awayTeam: ${JSON.stringify(match.awayTeam)},
    league: ${JSON.stringify(match.league)},
    matchDate: ${JSON.stringify(match.matchDate)},
    matchTime: ${JSON.stringify(match.matchTime)},
    odds: { '1': ${match.odds['1'].toFixed(2)}, 'X': ${match.odds['X'].toFixed(2)}, '2': ${match.odds['2'].toFixed(2)} },
    group: ${JSON.stringify(match.group)}
  })`;
}

async function run() {
  const live = await fetchWeeklyBulletin();
  if (!live) {
    console.error('Bu haftanın 15 maçlık fikstürü ESPN kaynaklarından tamamlanamadı.');
    process.exit(1);
  }

  const target = path.resolve(__dirname, '../src/data/sampleBulletin.ts');
  const current = fs.readFileSync(target, 'utf8');
  const start = current.indexOf('export const INITIAL_MATCHES');
  const filtersStart = current.indexOf('export const INITIAL_FILTERS');
  if (start < 0 || filtersStart < 0) {
    console.error('sampleBulletin.ts işaretleri bulunamadı.');
    process.exit(1);
  }

  const header = current.slice(0, start);
  const filters = current.slice(filtersStart);
  const matchesBlock = `export const INITIAL_MATCHES: Match[] = [
${live.matches.map(serializeMatch).join(',\n')}
];

export const BULLETIN_META = {
  id: ${JSON.stringify(live.meta.id)},
  season: ${JSON.stringify(live.meta.season)},
  week: ${live.meta.week},
  label: ${JSON.stringify(live.meta.label)}
};

`;

  fs.writeFileSync(target, `${header}${matchesBlock}${filters}`);
  console.log(`✅ Fikstür güncellendi: ${live.meta.label}`);
  for (const match of live.matches) {
    console.log(`${String(match.id).padStart(2)} ${match.matchDate} ${match.matchTime} ${match.homeTeam} - ${match.awayTeam}`);
  }
}

run();
