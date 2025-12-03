import React, { useMemo } from 'react';
import { useData } from '../services/dataContext';
import { TrendingUp, Wallet, User, Calendar, Award, Crown, Zap, Shield, Rocket } from 'lucide-react';

export const WorkerDashboard: React.FC = () => {
  const { auth, clients, profits } = useData();
  const user = auth.currentUser!;

  // Calculations
  const activeClients = clients.filter(c => c.workerId === user.id && c.status === 'Active').length;
  
  const currentMonthProfit = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return profits
      .filter(p => p.workerId === user.id && new Date(p.timestamp) >= startOfMonth)
      .reduce((sum, p) => sum + p.workerShare, 0);
  }, [profits, user.id]);

  // Ranks Logic
  let rank = "Новичок 🐣";
  let nextRank = "Бывалый 👊";
  let nextTarget = 10000;
  let progress = 0;

  const ranks = [
    { name: "Новичок 🐣", limit: 0 },
    { name: "Бывалый 👊", limit: 10000 },
    { name: "Хищник 🦈", limit: 50000 },
    { name: "Машина 🤖", limit: 100000 },
    { name: "Босс 💼", limit: 300000 },
    { name: "Элита 💎", limit: 500000 },
    { name: "Король 👑", limit: 1000000 },
    { name: "Император 🏛️", limit: 5000000 },
    { name: "Бог ⚡", limit: 10000000 }
  ];

  // Determine current rank and progress
  for (let i = 0; i < ranks.length; i++) {
    if (user.totalEarned >= ranks[i].limit) {
      rank = ranks[i].name;
      if (i < ranks.length - 1) {
        nextRank = ranks[i+1].name;
        nextTarget = ranks[i+1].limit;
      } else {
        nextRank = "Максимум";
        nextTarget = user.totalEarned;
      }
    }
  }

  // Calculate Progress Percentage
  if (nextRank !== "Максимум") {
    // Find previous limit to make bar accurate for current level
    const currentLevelBase = ranks.find(r => r.name === rank)?.limit || 0;
    const range = nextTarget - currentLevelBase;
    const earnedInLevel = user.totalEarned - currentLevelBase;
    progress = Math.min((earnedInLevel / range) * 100, 100);
  } else {
    progress = 100;
  }


  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'Admin': return 'Администратор';
      case 'Manager': return 'Менеджер';
      case 'Analyst': return 'Аналитик';
      default: return 'Воркер';
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, gradient }: any) => (
    <div className="relative overflow-hidden bg-gray-800/60 backdrop-blur-md p-5 rounded-2xl border border-gray-700/50 shadow-lg flex items-center gap-4 group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${gradient} blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      <div className={`p-3 rounded-xl ${gradient} bg-opacity-10 relative z-10`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="relative z-10">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-3xl border border-gray-700 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="h-20 w-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-gray-800">
             {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {user.fullName || user.username}
              {user.role === 'Admin' && <Shield size={18} className="text-blue-400" />}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-gray-700/50 backdrop-blur text-gray-300 text-xs rounded-lg border border-gray-600 font-medium">
                {getRoleLabel(user.role)}
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/20 font-medium flex items-center gap-1">
                <Crown size={12} /> {rank}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 relative z-10">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span className="flex items-center gap-1"><Rocket size={12}/> Прогресс уровня</span>
              <span className="text-white font-mono">{Math.floor(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-gray-600/30">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                <span>${user.totalEarned.toLocaleString()}</span>
                <span>${nextTarget.toLocaleString()} ({nextRank})</span>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard 
          icon={Wallet} 
          label="К выплате" 
          value={`$${user.balance.toFixed(2)}`} 
          gradient="bg-gradient-to-br from-green-500 to-emerald-700"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Всего заработано" 
          value={`$${user.totalEarned.toFixed(2)}`} 
          gradient="bg-gradient-to-br from-blue-500 to-indigo-700"
        />
        <StatCard 
          icon={Calendar} 
          label="Профит за месяц" 
          value={`$${currentMonthProfit.toFixed(2)}`} 
          gradient="bg-gradient-to-br from-purple-500 to-pink-700"
        />
        <StatCard 
          icon={User} 
          label="Активных мамонтов" 
          value={activeClients} 
          gradient="bg-gradient-to-br from-orange-500 to-red-700"
        />
      </div>

      <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <Zap className="mx-auto text-yellow-400 mb-3" size={32} />
        <h3 className="text-lg font-bold text-white mb-2">Lust Rush Team</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Мы создаем будущее. Твой успех зависит только от твоих действий.
        </p>
      </div>
    </div>
  );
};