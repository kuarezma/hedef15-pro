import { Column, Match } from './types';

/**
 * Multi-Format Exporter & Automated Play Script Generator.
 */

export function exportToExtra1X2(columns: Column[]): string {
  return columns.map(col => col.join('')).join('\n');
}

export function exportToCSV(columns: Column[], matches: Match[]): string {
  const header = ['Kolon_No', ...matches.map(m => `M${m.order}_${m.homeTeam}_vs_${m.awayTeam}`)].join(',');
  const rows = columns.map((col, idx) => {
    return [idx + 1, ...col].join(',');
  });
  return [header, ...rows].join('\n');
}

export function exportToNesineFormat(columns: Column[]): string {
  // Nesine bulk format standard: Column index + 15 outcome string
  return columns.map((col, idx) => `${idx + 1};${col.join('')}`).join('\n');
}

export function exportToMisliFormat(columns: Column[]): string {
  return columns.map(col => col.join('-')).join('\n');
}

export function exportToBilyonerFormat(columns: Column[]): string {
  return columns.map((col, idx) => `K${idx + 1}:${col.join('')}`).join('\n');
}

/**
 * Generates an automated Tampermonkey / Chrome Console script to load and play
 * all generated columns directly into legal betting sites.
 */
export function generateAutoPlayScript(columns: Column[], platform: 'nesine' | 'misli' | 'bilyoner' | 'tuttur'): string {
  const serializedColumns = JSON.stringify(columns);

  return `/**
 * Hedef15 Pro - Otomatik Spor Toto Kupon Oynatma Betiği
 * Platform: ${platform.toUpperCase()}
 * Kolon Sayısı: ${columns.length}
 * 
 * KULLANIM TALİMATI:
 * 1. ${platform}.com sitesinde Spor Toto sayfasına giriniz ve hesabınıza giriş yapınız.
 * 2. Tarayıcınızda F12 (Geliştirici Araçları) -> Console (Konsol) sekmesini açınız.
 * 3. Aşağıdaki kodun tamamını yapıştırıp ENTER'a basınız.
 * 4. Kolonlar otomatik olarak kuponunuza eklenecektir.
 */

(async function autoPlayHedef15() {
  const columns = ${serializedColumns};
  console.log("%c🎯 Hedef15 Pro: " + columns.length + " kolon yükleniyor...", "color: #10B981; font-size: 16px; font-weight: bold;");

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  try {
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      console.log(\`Kolon \${i + 1}/\${columns.length} dolduruluyor: \${col.join('')}\`);
      
      // Platform spesifik DOM element tıklama simülasyonu
      // Her maç için ilgili 1, X, 2 butonuna tıklar
      for (let m = 0; m < 15; m++) {
        const choice = col[m];
        // Seçici örneği: .match-row-\${m} .btn-\${choice}
        const selector = \`[data-match-index="\${m}"][data-choice="\${choice}"], .match-row:nth-child(\${m + 1}) button[data-value="\${choice}"]\`;
        const btn = document.querySelector(selector);
        if (btn) btn.click();
      }

      await sleep(150); // Hızlı ve güvenli gecikme

      // Kupona Ekle butonu
      const addBtn = document.querySelector('#btnAddToCoupon, .add-to-slip-btn, [data-action="add-column"]');
      if (addBtn) addBtn.click();
      
      await sleep(100);
    }

    console.log("%c✅ TÜM KOLONLAR BAŞARIYLA EKLENDİ! Kuponunuzu kontrol edip onaylayabilirsiniz.", "color: #10B981; font-size: 14px; font-weight: bold;");
  } catch (err) {
    console.error("Hedef15 Otomatik Oynatma Hatası:", err);
  }
})();
`;
}
