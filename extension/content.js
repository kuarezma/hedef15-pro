// Content script injected into legal betting pages (Nesine, Misli, Bilyoner, Tuttur)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FILL_COLUMNS') {
    const columns = request.columns;
    console.log('[Hedef15 Pro] Alınan kolon sayısı:', columns.length);

    (async () => {
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (let i = 0; i < columns.length; i++) {
        const colStr = columns[i];
        for (let m = 0; m < 15; m++) {
          const choice = colStr[m];
          // Common selector patterns across Nesine/Misli/Bilyoner
          const btn = document.querySelector(
            `[data-match-idx="${m}"][data-val="${choice}"], ` +
            `.match-row:nth-child(${m + 1}) button[data-outcome="${choice}"], ` +
            `#match_${m}_${choice}`
          );
          if (btn) btn.click();
        }
        await sleep(150);

        const addBtn = document.querySelector('#btnAddToSlip, .btn-add-column, [data-action="add-coupon"]');
        if (addBtn) addBtn.click();
        await sleep(100);
      }

      sendResponse({ success: true, count: columns.length });
    })();

    return true; // Keep message channel open for async response
  }
});
