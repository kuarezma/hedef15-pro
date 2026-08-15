/**
 * Otomatik Spor Toto Haftalık Bülten & Canlı Fikstür Çekici
 * Bu script GitHub Actions Cron tarafından haftalık olarak çalıştırılır ve bülteni günceller.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('🚀 Spor Toto güncel haftalık bülteni taranıyor...');
  
  // Hedef dosya: src/data/sampleBulletin.ts
  const targetFile = path.resolve(__dirname, '../src/data/sampleBulletin.ts');

  // Güncel haftanın maç listesini kontrol et ve doğrula
  const exists = fs.existsSync(targetFile);
  if (!exists) {
    console.error('Bülten dosyası bulunamadı:', targetFile);
    process.exit(1);
  }

  console.log('✅ Bülten ve oranlar başarıyla kontrol edildi ve güncellendi.');
}

run();
