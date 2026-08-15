/**
 * Site-specific DOM adapters for Spor Toto auto-fill on legal betting platforms.
 */
(function () {
  'use strict';

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes('nesine.com')) return 'nesine';
    if (host.includes('misli.com')) return 'misli';
    if (host.includes('bilyoner.com')) return 'bilyoner';
    if (host.includes('tuttur.com')) return 'tuttur';
    return 'generic';
  }

  const adapters = {
    nesine: {
      clickOutcome(matchIdx, choice) {
        const selectors = [
          `[data-testid="sportoto-match-${matchIdx}"] [data-outcome="${choice}"]`,
          `.sportoto-row:nth-child(${matchIdx + 1}) .outcome-${choice}`,
          `#st-row-${matchIdx} button[data-val="${choice}"]`,
          `.match-${matchIdx} [data-sign="${choice}"]`
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) { el.click(); return true; }
        }
        return false;
      },
      addColumn() {
        const selectors = ['#btnAddColumn', '.sportoto-add-column', '[data-action="add-column"]', 'button.add-to-slip'];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) { el.click(); return true; }
        }
        return false;
      }
    },
    misli: {
      clickOutcome(matchIdx, choice) {
        const selectors = [
          `.sport-toto-match:nth-child(${matchIdx + 1}) [data-result="${choice}"]`,
          `#match_${matchIdx}_${choice}`,
          `.st-match-row[data-index="${matchIdx}"] .btn-${choice}`
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) { el.click(); return true; }
        }
        return false;
      },
      addColumn() {
        const el = document.querySelector('.btn-kolon-ekle, #addCouponBtn, [data-test="add-column"]');
        if (el) { el.click(); return true; }
        return false;
      }
    },
    bilyoner: {
      clickOutcome(matchIdx, choice) {
        const selectors = [
          `.sportoto__row:nth-child(${matchIdx + 1}) [data-option="${choice}"]`,
          `#sportoto-match-${matchIdx} .option-${choice}`,
          `[data-match-index="${matchIdx}"] [data-pick="${choice}"]`
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) { el.click(); return true; }
        }
        return false;
      },
      addColumn() {
        const el = document.querySelector('.sportoto-add, #sportotoAddBtn, button[aria-label*="Kolon"]');
        if (el) { el.click(); return true; }
        return false;
      }
    },
    tuttur: {
      clickOutcome(matchIdx, choice) {
        const selectors = [
          `.toto-row:nth-child(${matchIdx + 1}) .sign-${choice}`,
          `[data-match="${matchIdx}"] [data-sign="${choice}"]`,
          `#toto_${matchIdx}_${choice}`
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) { el.click(); return true; }
        }
        return false;
      },
      addColumn() {
        const el = document.querySelector('.add-column-btn, #btnKolonEkle');
        if (el) { el.click(); return true; }
        return false;
      }
    },
    generic: {
      clickOutcome(matchIdx, choice) {
        const selectors = [
          `[data-match-idx="${matchIdx}"][data-val="${choice}"]`,
          `.match-row:nth-child(${matchIdx + 1}) button[data-outcome="${choice}"]`,
          `#match_${matchIdx}_${choice}`
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) { el.click(); return true; }
        }
        return false;
      },
      addColumn() {
        const el = document.querySelector('#btnAddToSlip, .btn-add-column, [data-action="add-coupon"]');
        if (el) { el.click(); return true; }
        return false;
      }
    }
  };

  async function fillColumns(columns) {
    const platform = detectPlatform();
    const adapter = adapters[platform] || adapters.generic;
    let filled = 0;

    console.log(`[Hedef15 Pro] Platform: ${platform}, Kolon: ${columns.length}`);

    for (let i = 0; i < columns.length; i++) {
      const colStr = columns[i];
      for (let m = 0; m < 15; m++) {
        const choice = colStr[m];
        adapter.clickOutcome(m, choice);
        await sleep(30);
      }
      await sleep(120);
      adapter.addColumn();
      await sleep(80);
      filled++;
    }

    return { success: true, count: filled, platform };
  }

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'FILL_COLUMNS') {
      fillColumns(request.columns)
        .then(sendResponse)
        .catch((err) => sendResponse({ success: false, error: String(err) }));
      return true;
    }
    if (request.action === 'DETECT_PLATFORM') {
      sendResponse({ platform: detectPlatform() });
      return false;
    }
  });
})();
