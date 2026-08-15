document.getElementById('btnPlay').addEventListener('click', async () => {
  const text = document.getElementById('txtColumns').value.trim();
  const statusDiv = document.getElementById('status');

  if (!text) {
    statusDiv.textContent = 'Lütfen en az 1 kolon yapıştırın!';
    statusDiv.style.color = '#EF4444';
    return;
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length === 15);
  if (lines.length === 0) {
    statusDiv.textContent = 'Geçerli 15 maçlık kolon bulunamadı!';
    statusDiv.style.color = '#EF4444';
    return;
  }

  statusDiv.textContent = `${lines.length} kolon aktarılıyor...`;
  statusDiv.style.color = '#10B981';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    statusDiv.textContent = 'Aktif sekme bulunamadı.';
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: 'FILL_COLUMNS', columns: lines }, (response) => {
    if (chrome.runtime.lastError) {
      statusDiv.textContent = 'Sekmeye bağlanılamadı. Sayfayı yenileyip tekrar deneyin.';
      statusDiv.style.color = '#EF4444';
    } else if (response && response.success) {
      statusDiv.textContent = '✅ Kolonlar başarıyla kupona aktarıldı!';
    }
  });
});
