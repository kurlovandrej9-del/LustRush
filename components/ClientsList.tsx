
import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

export const ClientsList: React.FC = () => {
  const { auth, clients, profits } = useData();
  const user = auth.currentUser!;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const myClients = clients
    .filter(c => c.workerId === user.id)
    .sort((a, b) => b.totalSqueezed - a.totalSqueezed);

  const getClientHistory = (clientId: number) => {
    return profits
      .filter(p => p.clientId === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  if (myClients.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-gray-600" size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-300">Мамонтов нет</h3>
        <p className="text-gray-500 mt-2">После первого профита здесь появится список клиентов.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-xl font-bold text-white mb-4">Мои Мамонты 🦣 ({myClients.length})</h2>
      {myClients.map(client => {
        const isExpanded = expandedId === client.id;
        const history = getClientHistory(client.id);

        return (
          <div key={client.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all duration-200">
            <button 
              onClick={() => setExpandedId(isExpanded ? null : client.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-200">{client.name}</h3>
                  <p className="text-xs text-gray-500">Всего: <span className="text-green-400 font-mono">${client.totalSqueezed.toFixed(0)}</span></p>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>

            {isExpanded && (
              <div className="bg-gray-900/50 p-4 border-t border-gray-700">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">История транзакций</h4>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map(h => (
                      <div key={h.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-gray-300 font-medium">{h.direction} <span className="text-xs text-gray-500">({h.stage})</span></p>
                          <p className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <span className="font-mono text-green-400">+${h.amount.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Истории нет.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
