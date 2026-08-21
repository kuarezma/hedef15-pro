/**
 * Otomatik Spor Toto Haftalık Bülten & Canlı Fikstür Çekici
 * GitHub Actions cron ve elle çalıştırma: bu haftanın 15 maçını yazar.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const result = spawnSync('npx', ['vite-node', 'scripts/updateBulletin.ts'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status === null ? 1 : result.status);
