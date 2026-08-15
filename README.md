# Hedef15 Pro 🎯

> **Yeni Nesil Akıllı Spor Toto Formül, Analiz, Değer Radarı ve Canlı İkramiye Platformu**

Hedef15 Pro; klasik Spor Toto sitelerindeki eski ve hantal sistemleri modernleştiren, tarayıcı üzerinde saniyeler içinde yüz binlerce kombinasyonu işleyebilen, yapay zeka destekli değer (value) analizi sunan ve canlı maç skorlarıyla kupon derecelerini anlık hesaplayan yeni nesil bir platformdur.

---

## 🚀 Özellikler (Features)

1. **Kombinatoryal İndirgeme Motoru (Hamming Covering Codes)**
   - **Garantili Özel Sistem:** 14, 13 veya 12 Garanti matematiksel kapsama algoritmalarıyla kupon maliyetini %85'e varan oranda düşürür.
   - **9 Kolonlu Garantili Formül:** 4 kapalı maçı 81 kolon yerine 9 kolona indirgeyen klasik optimal matrisler.
   - **% Yüzdesel Formülü (Monte Carlo):** Her maça atanan yüzde dağılımına göre hedeflenen bütçede kolon üretimi.
   - **Süper Yedili & AI Site İdeal:** Değer odaklı stratejik kupon şablonları.

2. **Gelişmiş Filtreleme Sistemi**
   - Toplam "1", "X", "2" sonuç adedi sınırları.
   - Sürpriz ve Plase adedi filtreleme.
   - Peş peşe (ardışık) aynı sonucun gelme sınırları.
   - Dalgalanma / Sonuç değişim sayısı sınırları.
   - Lig ve özel grup (blok) filtreleri.

3. **Yapay Zeka Değer (Value) Radarı**
   - Piyasa/Bahis oranlarının ima ettiği olasılıklar ($P_{\text{true}}$) ile Spor Toto halk dağılımını ($P_{\text{public}}$) kıyaslar.
   - Beklenen Değeri (+EV) yüksek olan gizli sürprizleri bularak büyük ikramiye şansını maksimize eder.
   - Aşırı şişirilmiş "Halk Tuzakları"nı tespit eder.

4. **Resmi İkramiye & Havuz Simülatörü**
   - Toplam hasılat, devir eden tutar ve yasal dağıtım oranına (%50) göre 15, 14, 13 ve 12 bilenlerin havuzlarını ve kişi başı tahmini ikramiyelerini hesaplar.

5. **Canlı Hafta Sonu Skor & Derece Radarı**
   - Hafta sonu maçlar oynandıkça veya simülasyon modunda tüm kolonların anlık derecesini ($15, 14, 13, 12$) ısı haritasıyla takip eder.

6. **Çoklu Dışa Aktarım & Otomatik Oynatma**
   - **Extra1X2 TXT:** Standart 15 karakterlik format (`.txt`).
   - **Excel / CSV:** Detaylı tablo formatı (`.csv`).
   - **Nesine / Misli / Bilyoner / Tuttur Otomatik Oynatıcı:** Konsol betiği ve hazır Chrome Uzantısı (Manifest V3).

7. **Ortak Kupon (Syndicate / Havuz)**
   - Arkadaş grupları veya topluluklar için paylı kupon oluşturma, link paylaşımı ve canlı kazanç takibi.

---

## 🛠️ Kurulum ve Çalıştırma (Installation & Usage)

### Gereksinimler
- Node.js (v18+)
- npm / pnpm / yarn

### Adımlar

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirici sunucusunu başlatın
npm run dev

# Testleri çalıştırın
npm run test

# Üretim derlemesi (Build) alın
npm run build
```

---

## 🧪 Testler

```bash
npm run test
```

Platform aşağıdaki birim testlerle korunmaktadır:
- `combinatorics.test.ts`: Kombinasyon üretimi ve Hamming uzaklığı hesaplamaları.
- `filters.test.ts`: 1-X-2 adetleri, sürprizler, ardışıklık ve grup filtreleri doğrulaması.
- `reduction.test.ts`: 14 ve 13 Garanti set kapsama matematik testi.
- `valueEngine.test.ts`: İma edilen piyasa olasılığı ve değer çarpanı testi.
- `prizeEngine.test.ts`: Resmi havuz dağılımı ve devir mekanizması testi.

---

## 📦 Proje Yapısı

```
├── src/
│   ├── core/           # Matematiksel çekirdek (Kombinasyon, Filtreler, İndirgeme, AI, Havuz)
│   ├── components/     # Modern UI bileşenleri (Header, Formül, Maçlar, Filtreler, Canlı Radar)
│   ├── hooks/          # React State ve Simülatör kancaları (useTotoEngine, useLiveSimulator)
│   ├── data/           # Örnek 15 maçlık bülten verisi
│   ├── App.tsx         # Ana uygulama görünümü
│   └── main.tsx        # React DOM başlangıç noktası
├── extension/          # Chrome Extension Manifest V3 kaynak kodları
├── tests/              # Vitest otomatik test paketi
└── .github/workflows/  # CI / CD hattı
```

---

## 📝 Değişiklik Günlüğü (Changelog)

### [1.0.0] - 2026-08-15
- **İlk Sürüm:** Tüm formül ve filtreleme motoru, AI Değer Radarı, Canlı Maç Radarı, İkramiye Hesaplayıcı, Chrome Uzantısı ve Ortak Kupon altyapısı eksiksiz olarak tamamlandı.
