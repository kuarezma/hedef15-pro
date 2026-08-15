export interface MatchDetailInfo {
  matchId: number;
  homeStandings: { rank: number; played: number; points: number; goalDiff: number };
  awayStandings: { rank: number; played: number; points: number; goalDiff: number };
  homeForm: ('W' | 'D' | 'L')[];
  awayForm: ('W' | 'D' | 'L')[];
  h2hMatches: { date: string; home: string; away: string; score: string; winner: '1' | 'X' | '2' }[];
  injuriesAndSuspensions: { team: string; player: string; reason: string; type: 'injured' | 'suspended' }[];
  expertCommentary: {
    author: string;
    role: string;
    title: string;
    text: string;
    recommendedPick: '1' | 'X' | '2' | '1-X' | 'X-2' | '1-2' | '1-X-2';
    confidence: number; // 1-100
  };
  keyStats: {
    homePossessionAvg: number;
    awayPossessionAvg: number;
    homeAvgGoalsScored: number;
    awayAvgGoalsScored: number;
    homeCleanSheetPercent: number;
    awayCleanSheetPercent: number;
  };
}

export const MATCH_DETAILS_DATA: Record<number, MatchDetailInfo> = {
  1: {
    matchId: 1,
    homeStandings: { rank: 1, played: 1, points: 3, goalDiff: 3 },
    awayStandings: { rank: 14, played: 1, points: 0, goalDiff: -2 },
    homeForm: ['W', 'W', 'W', 'D', 'W'],
    awayForm: ['L', 'D', 'W', 'L', 'L'],
    h2hMatches: [
      { date: '18.01.2024', home: 'Galatasaray', away: 'Çorum FK', score: '3 - 1', winner: '1' },
      { date: '22.09.2021', home: 'Çorum FK', away: 'Galatasaray', score: '0 - 2', winner: '2' }
    ],
    injuriesAndSuspensions: [
      { team: 'Galatasaray', player: 'Davinson Sanchez', reason: 'Hafif Sakatlık (Şüpheli)', type: 'injured' },
      { team: 'Çorum FK', player: 'Ahmet İlhan', reason: 'Kırmızı Kart Cezalısı', type: 'suspended' }
    ],
    expertCommentary: {
      author: 'Uğur Meleke',
      role: 'Baş Futbol Analisti',
      title: 'Galatasaray Kendi Evinde Hata Yapmaz',
      text: 'Galatasaray iç sahada müthiş bir baskıyla başlıyor. Çorum FK savunması güçlü forvet hattına karşı direnmekte zorlanacaktır. Kuponlarda banko 1 olarak değerlendirilmeli.',
      recommendedPick: '1',
      confidence: 94
    },
    keyStats: {
      homePossessionAvg: 64,
      awayPossessionAvg: 41,
      homeAvgGoalsScored: 2.6,
      awayAvgGoalsScored: 0.9,
      homeCleanSheetPercent: 55,
      awayCleanSheetPercent: 20
    }
  },
  2: {
    matchId: 2,
    homeStandings: { rank: 9, played: 1, points: 1, goalDiff: 0 },
    awayStandings: { rank: 4, played: 1, points: 3, goalDiff: 2 },
    homeForm: ['D', 'W', 'L', 'D', 'W'],
    awayForm: ['W', 'W', 'D', 'W', 'L'],
    h2hMatches: [
      { date: '12.04.2024', home: 'Kasımpaşa', away: 'Trabzonspor', score: '1 - 2', winner: '2' },
      { date: '01.11.2023', home: 'Trabzonspor', away: 'Kasımpaşa', score: '2 - 3', winner: '2' },
      { date: '08.04.2023', home: 'Kasımpaşa', away: 'Trabzonspor', score: '2 - 0', winner: '1' }
    ],
    injuriesAndSuspensions: [
      { team: 'Trabzonspor', player: 'Nwakaeme', reason: 'Kas Yırtığı', type: 'injured' },
      { team: 'Kasımpaşa', player: 'Sadiku', reason: 'Sarı Kart Sınırı', type: 'suspended' }
    ],
    expertCommentary: {
      author: 'Rıdvan Dilmen',
      role: 'Süper Lig Uzmanı',
      title: 'Gollü ve Çekişmeli Bir Karşılaşma',
      text: 'Kasımpaşa iç sahada her takıma gol atabilen tehlikeli bir ekip. Trabzonspor deplasmanlarda kontrollü oyunu tercih ediyor. Çifte şans X-2 veya 1-2 kapatılmaya değer.',
      recommendedPick: 'X-2',
      confidence: 82
    },
    keyStats: {
      homePossessionAvg: 48,
      awayPossessionAvg: 54,
      homeAvgGoalsScored: 1.8,
      awayAvgGoalsScored: 2.1,
      homeCleanSheetPercent: 25,
      awayCleanSheetPercent: 40
    }
  },
  3: {
    matchId: 3,
    homeStandings: { rank: 11, played: 1, points: 1, goalDiff: 0 },
    awayStandings: { rank: 7, played: 1, points: 3, goalDiff: 1 },
    homeForm: ['D', 'L', 'W', 'D', 'L'],
    awayForm: ['W', 'D', 'W', 'L', 'W'],
    h2hMatches: [
      { date: '03.02.2024', home: 'Çaykur Rizespor', away: 'Konyaspor', score: '0 - 0', winner: 'X' },
      { date: '16.09.2023', home: 'Konyaspor', away: 'Çaykur Rizespor', score: '1 - 2', winner: '2' }
    ],
    injuriesAndSuspensions: [
      { team: 'Konyaspor', player: 'Cicaldau', reason: 'Diz Burkulması', type: 'injured' }
    ],
    expertCommentary: {
      author: 'Eray Erollu',
      role: 'Spor Toto Stratejisti',
      title: 'Beraberlik İhtimali Çok Yüksek',
      text: 'İki denk kuvvetin mücadelesi. Konyaspor iç saha avantajını kullanmak isteyecektir ancak Rizespor kontra ataklarda çok tehlikeli. 1-X çifte şans en güvenli liman.',
      recommendedPick: '1-X',
      confidence: 78
    },
    keyStats: {
      homePossessionAvg: 51,
      awayPossessionAvg: 49,
      homeAvgGoalsScored: 1.2,
      awayAvgGoalsScored: 1.4,
      homeCleanSheetPercent: 35,
      awayCleanSheetPercent: 30
    }
  },
  4: {
    matchId: 4,
    homeStandings: { rank: 13, played: 1, points: 0, goalDiff: -1 },
    awayStandings: { rank: 8, played: 1, points: 3, goalDiff: 1 },
    homeForm: ['L', 'W', 'D', 'L', 'W'],
    awayForm: ['W', 'L', 'W', 'D', 'D'],
    h2hMatches: [
      { date: '11.02.2024', home: 'Alanyaspor', away: 'Gaziantep FK', score: '0 - 3', winner: '2' },
      { date: '02.09.2023', home: 'Gaziantep FK', away: 'Alanyaspor', score: '0 - 3', winner: '2' }
    ],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Murat Fevzi',
      role: 'İstatistik Editörü',
      title: 'Tüm Sonuçlara Açık Kapalı Maç',
      text: 'Gaziantep sahasında tempolu oynarken Alanyaspor geçiş hücumlarında usta. Bu maç 1-X-2 kapatılarak risk minimize edilmeli.',
      recommendedPick: '1-X-2',
      confidence: 70
    },
    keyStats: {
      homePossessionAvg: 46,
      awayPossessionAvg: 52,
      homeAvgGoalsScored: 1.3,
      awayAvgGoalsScored: 1.5,
      homeCleanSheetPercent: 20,
      awayCleanSheetPercent: 25
    }
  },
  5: {
    matchId: 5,
    homeStandings: { rank: 17, played: 1, points: 0, goalDiff: -2 },
    awayStandings: { rank: 2, played: 1, points: 3, goalDiff: 3 },
    homeForm: ['L', 'L', 'D', 'W', 'L'],
    awayForm: ['W', 'W', 'W', 'W', 'D'],
    h2hMatches: [
      { date: '14.03.2021', home: 'Fenerbahçe', away: 'Gençlerbirliği', score: '1 - 2', winner: '2' },
      { date: '21.11.2020', home: 'Gençlerbirliği', away: 'Fenerbahçe', score: '1 - 5', winner: '2' }
    ],
    injuriesAndSuspensions: [
      { team: 'Fenerbahçe', player: 'Ferdi Kadıoğlu', reason: 'Dinlendiriliyor', type: 'injured' }
    ],
    expertCommentary: {
      author: 'Uğur Meleke',
      role: 'Baş Futbol Analisti',
      title: 'Fenerbahçe Deplasmanda Kalitesini Gösterir',
      text: 'Fenerbahçe hücum varyasyonlarıyla rakip ceza sahasında çok etkili. Gençlerbirliği savunmasının direnemeyeceğini düşünüyoruz. Tek 2 banko.',
      recommendedPick: '2',
      confidence: 91
    },
    keyStats: {
      homePossessionAvg: 42,
      awayPossessionAvg: 62,
      homeAvgGoalsScored: 0.8,
      awayAvgGoalsScored: 2.8,
      homeCleanSheetPercent: 15,
      awayCleanSheetPercent: 60
    }
  },
  6: {
    matchId: 6,
    homeStandings: { rank: 5, played: 1, points: 3, goalDiff: 1 },
    awayStandings: { rank: 15, played: 1, points: 0, goalDiff: -1 },
    homeForm: ['W', 'W', 'L', 'D', 'W'],
    awayForm: ['L', 'W', 'W', 'D', 'L'],
    h2hMatches: [
      { date: '20.08.2022', home: 'Başakşehir FK', away: 'Kocaelispor', score: '2 - 0', winner: '1' }
    ],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Eray Erollu',
      role: 'Spor Toto Stratejisti',
      title: 'Başakşehir Evinde Üstün',
      text: 'Başakşehir topa sahip olan organize bir takım. Kocaelispor deplasmanda savunmaya çekilecektir. 1 ve 1-X tercihleri kuponu kurtarır.',
      recommendedPick: '1-X',
      confidence: 84
    },
    keyStats: {
      homePossessionAvg: 58,
      awayPossessionAvg: 44,
      homeAvgGoalsScored: 1.9,
      awayAvgGoalsScored: 1.1,
      homeCleanSheetPercent: 45,
      awayCleanSheetPercent: 30
    }
  },
  7: {
    matchId: 7,
    homeStandings: { rank: 3, played: 1, points: 3, goalDiff: 2 },
    awayStandings: { rank: 10, played: 1, points: 1, goalDiff: 0 },
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['D', 'L', 'W', 'L', 'D'],
    h2hMatches: [],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Rıdvan Dilmen',
      role: 'Süper Lig Uzmanı',
      title: 'Amed Sportif Sahasında Çok Coşkulu',
      text: 'Diyarbakır atmosferinde Amed Sportif seyirci desteğini arkasına alacaktır. 1-X çifte şans garanti tercihtir.',
      recommendedPick: '1-X',
      confidence: 80
    },
    keyStats: {
      homePossessionAvg: 55,
      awayPossessionAvg: 45,
      homeAvgGoalsScored: 1.7,
      awayAvgGoalsScored: 1.0,
      homeCleanSheetPercent: 40,
      awayCleanSheetPercent: 35
    }
  },
  8: {
    matchId: 8,
    homeStandings: { rank: 3, played: 1, points: 3, goalDiff: 2 },
    awayStandings: { rank: 12, played: 1, points: 0, goalDiff: -1 },
    homeForm: ['W', 'W', 'W', 'D', 'W'],
    awayForm: ['L', 'W', 'D', 'W', 'L'],
    h2hMatches: [
      { date: '16.01.2024', home: 'Beşiktaş', away: 'Eyüpspor', score: '4 - 0', winner: '1' }
    ],
    injuriesAndSuspensions: [
      { team: 'Eyüpspor', player: 'Caner Erkin', reason: 'Kart Cezalısı', type: 'suspended' }
    ],
    expertCommentary: {
      author: 'Uğur Meleke',
      role: 'Baş Futbol Analisti',
      title: 'Dolmabahçe\'de Beşiktaş Fırtınası',
      text: 'Beşiktaş yeni transferleriyle taraftarı önünde çok moralli. Eyüpspor açık futbol oynadığı için Beşiktaş bol pozisyon bulur. Net 1.',
      recommendedPick: '1',
      confidence: 90
    },
    keyStats: {
      homePossessionAvg: 61,
      awayPossessionAvg: 47,
      homeAvgGoalsScored: 2.4,
      awayAvgGoalsScored: 1.2,
      homeCleanSheetPercent: 50,
      awayCleanSheetPercent: 20
    }
  },
  9: {
    matchId: 9,
    homeStandings: { rank: 6, played: 1, points: 3, goalDiff: 1 },
    awayStandings: { rank: 8, played: 1, points: 1, goalDiff: 0 },
    homeForm: ['W', 'L', 'W', 'D', 'W'],
    awayForm: ['D', 'W', 'D', 'W', 'L'],
    h2hMatches: [
      { date: '21.05.2023', home: 'Göztepe', away: 'Samsunspor', score: '1 - 0', winner: '1' },
      { date: '20.12.2022', home: 'Samsunspor', away: 'Göztepe', score: '1 - 0', winner: '1' }
    ],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Eray Erollu',
      role: 'Spor Toto Stratejisti',
      title: 'Pazartesi Kapanışında Zorlu Randevu',
      text: 'Haftanın son maçı büyük sürprizlere gebe. İki takım da ligin diri ekiplerinden. 1-X-2 kapatılması gereken kilit maç.',
      recommendedPick: '1-X-2',
      confidence: 72
    },
    keyStats: {
      homePossessionAvg: 50,
      awayPossessionAvg: 50,
      homeAvgGoalsScored: 1.4,
      awayAvgGoalsScored: 1.3,
      homeCleanSheetPercent: 35,
      awayCleanSheetPercent: 35
    }
  },
  10: {
    matchId: 10,
    homeStandings: { rank: 2, played: 1, points: 3, goalDiff: 2 },
    awayStandings: { rank: 1, played: 1, points: 3, goalDiff: 3 },
    homeForm: ['W', 'W', 'D', 'W', 'W'],
    awayForm: ['W', 'W', 'W', 'D', 'W'],
    h2hMatches: [
      { date: '31.03.2024', home: 'Manchester City', away: 'Arsenal', score: '0 - 0', winner: 'X' },
      { date: '08.10.2023', home: 'Arsenal', away: 'Manchester City', score: '1 - 0', winner: '1' },
      { date: '06.08.2023', home: 'Arsenal', away: 'Manchester City', score: '1 - 1', winner: 'X' }
    ],
    injuriesAndSuspensions: [
      { team: 'Manchester City', player: 'Rodri', reason: 'Hafif Sakatlık (Şüpheli)', type: 'injured' }
    ],
    expertCommentary: {
      author: 'Uğur Meleke',
      role: 'Baş Futbol Analisti',
      title: 'Premier Lig\'in Erken Finali',
      text: 'Arteta ve Guardiola\'nın taktik savaşı. Son karşılaşmalarda savunmalar ön plandaydı. Beraberlik (X) ve 1-X ihtimali ağır basıyor.',
      recommendedPick: '1-X',
      confidence: 77
    },
    keyStats: {
      homePossessionAvg: 59,
      awayPossessionAvg: 65,
      homeAvgGoalsScored: 2.2,
      awayAvgGoalsScored: 2.5,
      homeCleanSheetPercent: 55,
      awayCleanSheetPercent: 50
    }
  },
  11: {
    matchId: 11,
    homeStandings: { rank: 6, played: 1, points: 1, goalDiff: 0 },
    awayStandings: { rank: 1, played: 1, points: 3, goalDiff: 3 },
    homeForm: ['D', 'W', 'L', 'W', 'D'],
    awayForm: ['W', 'W', 'W', 'W', 'W'],
    h2hMatches: [
      { date: '14.01.2024', home: 'RC Lens', away: 'Paris Saint Germain', score: '0 - 2', winner: '2' },
      { date: '26.08.2023', home: 'Paris Saint Germain', away: 'RC Lens', score: '3 - 1', winner: '1' }
    ],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Murat Fevzi',
      role: 'İstatistik Editörü',
      title: 'PSG Kadro Kalitesiyle Önde',
      text: 'Lens evinde sert bir takım olsa da PSG forvetlerinin bitiriciliği fark yaratır. 2 veya X-2 değerlendirilebilir.',
      recommendedPick: '2',
      confidence: 85
    },
    keyStats: {
      homePossessionAvg: 48,
      awayPossessionAvg: 67,
      homeAvgGoalsScored: 1.3,
      awayAvgGoalsScored: 2.7,
      homeCleanSheetPercent: 30,
      awayCleanSheetPercent: 55
    }
  },
  12: {
    matchId: 12,
    homeStandings: { rank: 7, played: 1, points: 3, goalDiff: 1 },
    awayStandings: { rank: 13, played: 1, points: 0, goalDiff: -1 },
    homeForm: ['W', 'D', 'L', 'W', 'W'],
    awayForm: ['L', 'D', 'L', 'W', 'D'],
    h2hMatches: [
      { date: '05.02.2024', home: 'Rayo Vallecano', away: 'Sevilla', score: '1 - 2', winner: '2' },
      { date: '07.10.2023', home: 'Sevilla', away: 'Rayo Vallecano', score: '2 - 2', winner: 'X' }
    ],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Eray Erollu',
      role: 'Spor Toto Stratejisti',
      title: 'Sánchez Pizjuán\'da Sevilla Favori',
      text: 'Sevilla seyircisi önünde maça hızlı başlar. Rayo deplasmanlarda kapanıyor. 1 ve 1-X güven verir.',
      recommendedPick: '1',
      confidence: 81
    },
    keyStats: {
      homePossessionAvg: 56,
      awayPossessionAvg: 47,
      homeAvgGoalsScored: 1.6,
      awayAvgGoalsScored: 1.0,
      homeCleanSheetPercent: 40,
      awayCleanSheetPercent: 25
    }
  },
  13: {
    matchId: 13,
    homeStandings: { rank: 16, played: 1, points: 0, goalDiff: -1 },
    awayStandings: { rank: 5, played: 1, points: 3, goalDiff: 2 },
    homeForm: ['L', 'W', 'L', 'D', 'L'],
    awayForm: ['W', 'W', 'D', 'L', 'W'],
    h2hMatches: [],
    injuriesAndSuspensions: [
      { team: 'Villarreal', player: 'Gerard Moreno', reason: 'Uyluk Gerilmesi', type: 'injured' }
    ],
    expertCommentary: {
      author: 'Rıdvan Dilmen',
      role: 'Süper Lig Uzmanı',
      title: 'Villarreal Sürprize İzin Vermez',
      text: 'Santander La Liga\'ya yeni adapte oluyor. Villarreal\'in deneyimli orta sahası kontrolü elinde tutacaktır. X-2 çifte şans.',
      recommendedPick: 'X-2',
      confidence: 83
    },
    keyStats: {
      homePossessionAvg: 44,
      awayPossessionAvg: 57,
      homeAvgGoalsScored: 1.1,
      awayAvgGoalsScored: 1.9,
      homeCleanSheetPercent: 25,
      awayCleanSheetPercent: 45
    }
  },
  14: {
    matchId: 14,
    homeStandings: { rank: 9, played: 1, points: 1, goalDiff: 0 },
    awayStandings: { rank: 11, played: 1, points: 1, goalDiff: 0 },
    homeForm: ['D', 'W', 'W', 'L', 'D'],
    awayForm: ['D', 'L', 'W', 'D', 'W'],
    h2hMatches: [
      { date: '04.02.2024', home: 'Espanyol', away: 'Levante', score: '2 - 1', winner: '1' }
    ],
    injuriesAndSuspensions: [],
    expertCommentary: {
      author: 'Murat Fevzi',
      role: 'İstatistik Editörü',
      title: 'Espanyol Evinde Avantajlı',
      text: 'Katalan ekibi sahasında çok agresif. Levante deplasmanda puan çıkarmakta zorlanıyor. 1-X mantıklı tercih.',
      recommendedPick: '1-X',
      confidence: 79
    },
    keyStats: {
      homePossessionAvg: 52,
      awayPossessionAvg: 48,
      homeAvgGoalsScored: 1.5,
      awayAvgGoalsScored: 1.2,
      homeCleanSheetPercent: 35,
      awayCleanSheetPercent: 30
    }
  },
  15: {
    matchId: 15,
    homeStandings: { rank: 8, played: 1, points: 3, goalDiff: 1 },
    awayStandings: { rank: 10, played: 1, points: 1, goalDiff: 0 },
    homeForm: ['W', 'D', 'L', 'W', 'D'],
    awayForm: ['D', 'L', 'W', 'D', 'L'],
    h2hMatches: [
      { date: '04.02.2024', home: 'Osasuna', away: 'Celta Vigo', score: '0 - 3', winner: '2' },
      { date: '13.08.2023', home: 'Celta Vigo', away: 'Osasuna', score: '0 - 2', winner: '2' }
    ],
    injuriesAndSuspensions: [
      { team: 'Celta Vigo', player: 'Iago Aspas', reason: 'Kaptan Sahada', type: 'injured' }
    ],
    expertCommentary: {
      author: 'Uğur Meleke',
      role: 'Baş Futbol Analisti',
      title: 'Haftanın Son İspanya Maçında Denge',
      text: 'Celta Vigo ve Osasuna birbirlerini çok iyi tanıyan iki ekip. Gol yollarında zorlanan Osasuna savunmaya öncelik verecektir. 1-X tercih edilmeli.',
      recommendedPick: '1-X',
      confidence: 76
    },
    keyStats: {
      homePossessionAvg: 51,
      awayPossessionAvg: 49,
      homeAvgGoalsScored: 1.4,
      awayAvgGoalsScored: 1.1,
      homeCleanSheetPercent: 35,
      awayCleanSheetPercent: 35
    }
  }
};
