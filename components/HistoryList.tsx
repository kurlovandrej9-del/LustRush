
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Banknote, Clock, CheckCircle2, Gift } from 'lucide-react';

export const HistoryList: React.FC = () => {
  const { auth, payouts, profits, claimPayout } = useData();
  const user = auth.currentUser!;
  const [activeTab, setActiveTab] = useState<'profits' | 'payouts'>('payouts');
  
  // Local state to keep payouts visible in the current session even after claiming
  const [sessionClaimedIds, setSessionClaimedIds] = useState<number[]>([]);

  // Filter payouts: Show if NOT received OR if it was claimed in this session (so user can still copy the link)
  const myVisiblePayouts = payouts
    .filter(p => p.workerId === user.id && (!p.isReceived || sessionClaimedIds.includes(p.id)))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Note: Total Paid calculation should technically include all history, 
  // but if we hide them, maybe we just show what's "processed". 
  // However, usually "Total Paid" implies lifetime. 
  // Let's calculate total lifetime paid regardless of visibility.
  const allMyPayouts = payouts.filter(p => p.workerId === user.id);
  const totalPaid = allMyPayouts.reduce((acc, curr) => acc + curr.amount, 0);

  const myProfits = profits
    .filter(p => p.workerId === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleReceive = (id: number) => {
    setSessionClaimedIds(prev => [...prev, id]);
    claimPayout(id);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex bg-gray-800 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('payouts')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'payouts' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Выплаты
        </button>
        <button 
          onClick={() => setActiveTab('profits')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profits' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Лог Профитов
        </button>
      </div>

      {activeTab === 'payouts' ? (
        <div className="space-y-4">
           <div className="bg-gradient-to-br from-green-900/40 to-gray-800 p-4 rounded-xl border border-green-500/20 mb-4">
             <div className="flex items-center gap-3 mb-1">
               <Banknote className="text-green-400" size={20} />
               <span className="text-green-400 font-medium text-sm">Всего выплачено (LifeTime)</span>
             </div>
             <p className="text-2xl font-bold text-white">${totalPaid.toFixed(2)}</p>
           </div>

           {myVisiblePayouts.length === 0 ? (
             <div className="text-center py-10">
               <Gift className="mx-auto text-gray-600 mb-3" size={48} />
               <p className="text-gray-500">У вас нет новых выплат.</p>
               <p className="text-xs text-gray-600 mt-1">Здесь появятся ваши чеки, когда админ отправит ЗП.</p>
             </div>
           ) : (
             myVisiblePayouts.map(p => {
                const isJustClaimed = sessionClaimedIds.includes(p.id);
                
                return (
                 <div key={p.id} className={`bg-gray-800 p-4 rounded-xl border flex flex-col gap-2 transition-all ${isJustClaimed ? 'border-green-500/50 bg-green-900/10' : 'border-gray-700'}`}>
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="text-white font-bold text-lg">${p.amount.toFixed(2)}</p>
                       <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                         <Clock size={12} />
                         {new Date(p.timestamp).toLocaleDateString('ru-RU')}
                       </div>
                     </div>
                     {!isJustClaimed ? (
                        <button 
                          onClick={() => handleReceive(p.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg animate-pulse"
                        >
                          ПОЛУЧИТЬ
                        </button>
                     ) : (
                        <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                          <CheckCircle2 size={14} /> Получено
                        </span>
                     )}
                   </div>
                   
                   {isJustClaimed && (
                     <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                       <p className="text-xs text-gray-400 mb-1">Ваш чек (CryptoBot / Hash):</p>
                       <div className="bg-gray-900 p-3 rounded-lg border border-green-500/30 flex items-center justify-between gap-2">
                          <code className="text-sm font-mono text-green-400 break-all select-all">
                            {p.checkCode}
                          </code>
                       </div>
                       <p className="text-[10px] text-red-400 mt-2 text-center">
                         ⚠️ Сохраните чек! После обновления страницы он исчезнет.
                       </p>
                     </div>
                   )}
                 </div>
               );
             })
           )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-gray-400 text-sm font-medium">Последняя активность</h3>
          {myProfits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Профитов пока нет.</p>
          ) : (
            myProfits.map(p => (
              <div key={p.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-bold">+${p.workerShare.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{new Date(p.timestamp).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Общий вход:</span>
                      <span className="text-white font-medium">${p.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Мамонт:</span>
                      <span className="text-white font-medium">{p.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-600">{p.direction}</span>
                       <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded border border-gray-600">{p.stage}</span>
                       <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">{p.percent}% доля</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
