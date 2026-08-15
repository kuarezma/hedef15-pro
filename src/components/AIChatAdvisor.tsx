import React, { useState } from 'react';
import { Match, FormulaType, GuaranteeTier, Outcome } from '../core/types';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Shield,
  Flame,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  User,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AIChatAdvisorProps {
  matches: Match[];
  onApplyTacticalPicks: (picks: { matchId: number; outcomes: Outcome[] }[], formula?: FormulaType, tier?: GuaranteeTier) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    picks: { matchId: number; outcomes: Outcome[] }[];
    formula?: FormulaType;
    tier?: GuaranteeTier;
  };
}

export const AIChatAdvisor: React.FC<AIChatAdvisorProps> = ({
  matches,
  onApplyTacticalPicks
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: 'Merhaba! Ben Hedef15 Pro AI Taktik Danışmanınızım. 1. Hafta bülteni için oran arbitrajlarını, sakatlıkları ve matematiksel formül kombinasyonlarını analiz ettim. Size nasıl yardımcı olabilirim?',
      timestamp: '12:00'
    }
  ]);

  const [inputVal, setInputVal] = useState<string>('');

  const quickPrompts = [
    '🎯 Bu haftanın en sağlam 3 bankosu hangisi?',
    '🔥 Sürpriz ihtimali en yüksek 2 maç hangisi?',
    '⚖️ 200 TL için en ideal 14 garanti kuponu kur',
    '📊 Arsenal - Man City maçı için yapay zeka tahmini ne?'
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      let reply = '';
      let action: ChatMessage['action'] | undefined = undefined;

      const lower = text.toLowerCase();

      if (lower.includes('banko') || lower.includes('sağlam')) {
        reply = '1. Hafta bülteninde yapay zeka modelimizin en yüksek güvenilirlik verdiği 3 banko maç:\n1. **Galatasaray - Çorum FK**: 1 (Ev sahibi %78 kazanma olasılığı)\n2. **Beşiktaş - Eyüpspor**: 1 (Ev sahibi %69 olasılık)\n3. **Gençlerbirliği - Fenerbahçe**: 2 (Deplasman %74 olasılık)\n\nBu bankoları kuponunuza uygulamak ister misiniz?';
        action = {
          label: 'Bu 3 Bankoyu Kupona Ekle',
          picks: [
            { matchId: 1, outcomes: ['1'] },
            { matchId: 8, outcomes: ['1'] },
            { matchId: 5, outcomes: ['2'] }
          ]
        };
      } else if (lower.includes('sürpriz') || lower.includes('arbitraj')) {
        reply = 'Piyasa oranları ile halk tercihleri arasındaki en yüksek (+EV) değer farkı şu 2 maçta tespit edildi:\n1. **Konyaspor - Rizespor**: Halk %58 ev sahibine yüklenmiş ancak Rizespor form grafiği yüksek (X-2 sürpriz barındırıyor).\n2. **Amed Sportif - Erzurumspor**: 1-X çifte şans yüksek değer taşıyor.';
        action = {
          label: 'Sürpriz Tercihleri Kupona Uygula',
          picks: [
            { matchId: 3, outcomes: ['X', '2'] },
            { matchId: 7, outcomes: ['1', 'X'] }
          ]
        };
      } else if (lower.includes('200') || lower.includes('kupon') || lower.includes('bütçe') || lower.includes('14')) {
        reply = '200 TL bütçe için en optimize strateji: 4 Banko + 6 Çifte Şans + 14 Garanti Hamming indirgemesidir. İsraf kolonlar elenerek 100 kolonda (200 TL) 14 garantisi sağlanır.';
        action = {
          label: '200 TL 14 Garanti Kuponunu Yükle',
          formula: 'guaranteed_custom',
          tier: '14',
          picks: [
            { matchId: 1, outcomes: ['1'] },
            { matchId: 5, outcomes: ['2'] },
            { matchId: 8, outcomes: ['1'] },
            { matchId: 2, outcomes: ['X', '2'] },
            { matchId: 10, outcomes: ['1', 'X'] }
          ]
        };
      } else if (lower.includes('arsenal') || lower.includes('city')) {
        reply = '📊 **Arsenal vs Manchester City Analizi**:\nİki dev arasındaki son 5 maçın 3\'ü beraberlikle bitti. xG oranları başa baş (1.45 vs 1.52). Bu maçta tek tercihten kaçınarak **1-X** veya **1-X-2 kapatma** önerilir.';
        action = {
          label: 'Arsenal - City Maçını 1-X-2 Kapat',
          picks: [{ matchId: 10, outcomes: ['1', 'X', '2'] }]
        };
      } else {
        reply = `Matematiksel analiz motorumuz isteğinizi inceledi. 15 maçlık bülten için oran dengesine göre optimize edilmiş bir strateji hazırladım. Aşağıdaki butondan kuponunuza aktarabilirsiniz.`;
        action = {
          label: 'Önerilen Stratejiyi Kupona Aktar',
          formula: 'guaranteed_custom',
          tier: '14',
          picks: [
            { matchId: 1, outcomes: ['1'] },
            { matchId: 2, outcomes: ['1', '2'] },
            { matchId: 10, outcomes: ['1', 'X'] }
          ]
        };
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        action
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  const handleApplyAction = (act: NonNullable<ChatMessage['action']>) => {
    confetti({ particleCount: 50, spread: 60 });
    onApplyTacticalPicks(act.picks, act.formula, act.tier);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 via-[#0B0F19] to-gray-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl backdrop-blur-md flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
            🤖
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Spor Toto AI Danışmanı</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-gray-400">Canlı Taktik & Matematiksel Asistan</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-none shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.action && (
                <div className="mt-3 pt-2.5 border-t border-gray-800 flex justify-end">
                  <button
                    onClick={() => handleApplyAction(m.action!)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{m.action.label}</span>
                  </button>
                </div>
              )}
            </div>
            <span className="text-[9px] text-gray-500 mt-1 px-1 font-mono">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="pt-2 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-[10px] text-gray-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-2 border-t border-gray-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Yapay zekaya Spor Toto taktiği veya maç analizi sorun..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
          className="flex-1 bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
        />
        <button
          onClick={() => handleSend(inputVal)}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
