import React, { useState, useMemo } from 'react';
import { useData, DealParticipant } from '../services/dataContext';
import { ShieldCheck, PlusCircle, DollarSign, Users, X, ChevronRight, Check, Briefcase, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

export const AdminPanel: React.FC = () => {
  const { users, addDeal, processPayout, updateUserRole } = useData();
  const [view, setView] = useState<'home' | 'profit' | 'payout' | 'users'>('home');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- STATE FOR PROFIT ENTRY ---
  const [profitStep, setProfitStep] = useState(1);
  const [dealData, setDealData] = useState({
    mainWorkerId: '',
    managerId: '',
    analystId: '',
    clientName: '',
    amount: '',
    direction: 'BTC',
    stage: 'Deposit',
    workerPercent: '',
    managerPercent: '',
    analystPercent: '',
  });

  // --- STATE FOR USER MANAGEMENT ---
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<string | null>(null);

  // --- STATE FOR PAYOUT ---
  const [payStep, setPayStep] = useState(1);
  const [payForm, setPayForm] = useState({ workerId: '', checkCode: '' });

  const totalTurnover = useMemo(() => users.reduce((acc, u) => acc + u.totalEarned, 0), [users]);
  const totalDebt = useMemo(() => users.reduce((acc, u) => acc + u.balance, 0), [users]);

  // --- ROLE CAPABILITY HELPERS ---
  const canActAsWorker = (role: UserRole) => ['Worker', 'Manager', 'Analyst', 'Admin'].includes(role);
  const canActAsManager = (role: UserRole) => ['Manager', 'Analyst', 'Admin'].includes(role);
  const canActAsAnalyst = (role: UserRole) => ['Analyst', 'Admin'].includes(role);

  // --- HANDLERS ---
  
  const handleAddDeal = async () => {
    if (!dealData.amount || !dealData.mainWorkerId) return;
    setIsLoading(true);
    
    const participants: DealParticipant[] = [];
    
    // Add Worker
    if (dealData.workerPercent) {
      participants.push({ userId: dealData.mainWorkerId, role: 'Worker', percent: parseFloat(dealData.workerPercent) });
    }
    // Add Manager
    if (dealData.managerId && dealData.managerPercent) {
      participants.push({ userId: dealData.managerId, role: 'Manager', percent: parseFloat(dealData.managerPercent) });
    }
    // Add Analyst
    if (dealData.analystId && dealData.analystPercent) {
      participants.push({ userId: dealData.analystId, role: 'Analyst', percent: parseFloat(dealData.analystPercent) });
    }

    await addDeal(
      dealData.mainWorkerId,
      dealData.clientName,
      parseFloat(dealData.amount),
      dealData.direction,
      dealData.stage,
      participants
    );

    setIsLoading(false);
    setView('home');
    resetProfitForm();
  };

  const resetProfitForm = () => {
    setProfitStep(1);
    setDealData({
      mainWorkerId: '',
      managerId: '',
      analystId: '',
      clientName: '',
      amount: '',
      direction: 'BTC',
      stage: 'Deposit',
      workerPercent: '',
      managerPercent: '',
      analystPercent: '',
    });
  };

  const handlePayout = async () => {
    if (!payForm.checkCode) return;
    setIsLoading(true);
    await processPayout(payForm.workerId, payForm.checkCode);
    setIsLoading(false);
    setView('home');
    resetPayForm();
  };

  const resetPayForm = () => {
    setPayStep(1);
    setPayForm({ workerId: '', checkCode: '' });
  };

  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    await updateUserRole(userId, role);
  };

  // --- VIEW: PROFIT ENTRY ---

  if (view === 'profit') {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl pb-20">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="text-green-400" /> Новый Профит
          </h2>
          <button onClick={() => {setView('home'); resetProfitForm();}} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        {profitStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-gray-300 mb-2 font-medium">1. Выберите Воркера (Обязательно)</h3>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {users
                .filter(u => canActAsWorker(u.role))
                .map(u => (
                <button 
                  key={u.id}
                  onClick={() => { setDealData({...dealData, mainWorkerId: u.id}); setProfitStep(2); }}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition text-left"
                >
                  <span className="font-medium text-white">{u.fullName} <span className="text-xs text-gray-400">({u.role})</span></span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {profitStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Имя Мамонта / Логин</label>
              <input 
                value={dealData.clientName}
                onChange={e => setDealData({...dealData, clientName: e.target.value})}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="@username"
              />
            </div>
            <div>
               <label className="block text-sm text-gray-400 mb-1">Сумма ($)</label>
               <input 
                 type="number"
                 value={dealData.amount}
                 onChange={e => setDealData({...dealData, amount: e.target.value})}
                 className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="1000"
               />
             </div>
            <button 
              disabled={!dealData.clientName || !dealData.amount}
              onClick={() => setProfitStep(3)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-500"
            >
              Далее
            </button>
          </div>
        )}

        {profitStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-gray-300 font-medium border-b border-gray-700 pb-2">Распределение (от 95%)</h3>
            <p className="text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
               ⚠️ Админ автоматически получает 5% от общей суммы. Указывайте проценты от оставшихся 95%.
            </p>
            
            {/* Main Worker - Always Present */}
            <div>
               <label className="block text-sm text-white mb-1">Воркер: {users.find(u => u.id === dealData.mainWorkerId)?.fullName}</label>
               <input 
                 type="number"
                 value={dealData.workerPercent}
                 onChange={e => setDealData({...dealData, workerPercent: e.target.value})}
                 className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2"
                 placeholder="Например: 50"
               />
            </div>

            {/* Optional Manager */}
            <div className="bg-gray-700/50 p-3 rounded-lg">
               <label className="block text-sm text-gray-400 mb-1">Менеджер (Опционально)</label>
               <select 
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 mb-2 text-sm"
                  onChange={e => setDealData({...dealData, managerId: e.target.value})}
                  value={dealData.managerId}
               >
                 <option value="">Не выбран</option>
                 {users
                   .filter(u => canActAsManager(u.role) && u.id !== dealData.mainWorkerId)
                   .map(u => (
                   <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                 ))}
               </select>
               {dealData.managerId && (
                 <input 
                  type="number"
                  value={dealData.managerPercent}
                  onChange={e => setDealData({...dealData, managerPercent: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2"
                  placeholder="Процент %"
                 />
               )}
            </div>

            {/* Optional Analyst */}
            <div className="bg-gray-700/50 p-3 rounded-lg">
               <label className="block text-sm text-gray-400 mb-1">Аналитик (Опционально)</label>
               <select 
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2 mb-2 text-sm"
                  onChange={e => setDealData({...dealData, analystId: e.target.value})}
                  value={dealData.analystId}
               >
                 <option value="">Не выбран</option>
                 {users
                   .filter(u => canActAsAnalyst(u.role) && u.id !== dealData.mainWorkerId && u.id !== dealData.managerId)
                   .map(u => (
                   <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                 ))}
               </select>
               {dealData.analystId && (
                 <input 
                  type="number"
                  value={dealData.analystPercent}
                  onChange={e => setDealData({...dealData, analystPercent: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2"
                  placeholder="Процент %"
                 />
               )}
            </div>

             <button 
               disabled={!dealData.workerPercent}
               onClick={() => setProfitStep(4)}
               className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-500"
             >
               Проверить
             </button>
          </div>
        )}

        {profitStep === 4 && (
          <div className="space-y-4">
             <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Общая сумма:</span>
                  <span className="text-green-400 font-bold text-lg">${dealData.amount}</span>
                </div>

                {/* Calculation Logic for Preview */}
                {(() => {
                    const total = parseFloat(dealData.amount);
                    const adminCut = total * 0.05;
                    const remainder = total * 0.95;
                    
                    return (
                        <div className="space-y-2">
                           <div className="flex justify-between text-yellow-500">
                                <span>Комиссия системы (5%)</span>
                                <span>${adminCut.toFixed(2)}</span>
                           </div>
                           <div className="border-t border-gray-800 my-1"></div>
                           
                           <div className="flex justify-between">
                             <span className="text-white">Воркер ({dealData.workerPercent}%)</span>
                             <span className="text-green-400">${(remainder * parseFloat(dealData.workerPercent) / 100).toFixed(2)}</span>
                           </div>
                           
                           {dealData.managerId && (
                             <div className="flex justify-between">
                               <span className="text-white">Менеджер ({dealData.managerPercent}%)</span>
                               <span className="text-green-400">${(remainder * parseFloat(dealData.managerPercent) / 100).toFixed(2)}</span>
                             </div>
                           )}
                           
                           {dealData.analystId && (
                             <div className="flex justify-between">
                               <span className="text-white">Аналитик ({dealData.analystPercent}%)</span>
                               <span className="text-green-400">${(remainder * parseFloat(dealData.analystPercent) / 100).toFixed(2)}</span>
                             </div>
                           )}
                        </div>
                    );
                })()}
             </div>

             <div className="space-y-2">
                <label className="block text-sm text-gray-400">Направление</label>
                <div className="flex gap-2">
                  {['BTC', 'USDT', 'Card'].map(d => (
                    <button 
                      key={d} 
                      onClick={() => setDealData({...dealData, direction: d})}
                      className={`flex-1 py-2 text-xs rounded-lg border ${dealData.direction === d ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
             </div>

             <button 
              disabled={isLoading}
              onClick={handleAddDeal}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Check size={20} />} 
              Подтвердить
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: PAYOUT ---

  if (view === 'payout') {
    const payUsers = users.filter(u => u.balance > 0).sort((a,b) => b.balance - a.balance);
    const selectedUser = users.find(u => u.id === payForm.workerId);

    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl pb-20">
         <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-blue-400" /> Выплатить ЗП
          </h2>
          <button onClick={() => {setView('home'); resetPayForm();}} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><X size={20} /></button>
        </div>

        {payStep === 1 && (
          <>
            {payUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Все выплачено! 🎉</p>
            ) : (
              <div className="space-y-3">
                 <p className="text-gray-400 text-sm">Выберите кому платить:</p>
                 {payUsers.map(u => (
                    <button 
                    key={u.id}
                    onClick={() => { setPayForm({...payForm, workerId: u.id}); setPayStep(2); }}
                    className="w-full flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition"
                  >
                    <div>
                      <span className="block font-medium text-white">{u.fullName}</span>
                      <span className="text-xs text-gray-400">{u.role}</span>
                    </div>
                    <span className="font-mono text-green-400 font-bold">${u.balance.toFixed(2)}</span>
                  </button>
                 ))}
              </div>
            )}
          </>
        )}

        {payStep === 2 && selectedUser && (
           <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-xs">Получатель ({selectedUser.role})</p>
                <h3 className="text-xl font-bold text-white">{selectedUser.fullName}</h3>
                <p className="text-3xl font-bold text-green-400 mt-2">${selectedUser.balance.toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Код чека / Хэш</label>
                <input 
                  value={payForm.checkCode}
                  onChange={e => setPayForm({...payForm, checkCode: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  placeholder="Вставьте ссылку на чек или код..."
                />
              </div>

              <button 
                disabled={!payForm.checkCode || isLoading}
                onClick={handlePayout}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-green-500 flex items-center justify-center gap-2"
              >
                 {isLoading ? <Loader2 className="animate-spin" /> : <Check size={20} />} 
                 Пометить как выплачено
              </button>
           </div>
        )}
      </div>
    );
  }

  // --- VIEW: USERS LIST (MODAL) ---
  const userToEdit = users.find(u => u.id === selectedUserForEdit);

  const UserModal = () => {
    if (!userToEdit) return null;

    const roles: {id: UserRole, label: string}[] = [
      { id: 'Worker', label: 'Воркер' },
      { id: 'Manager', label: 'Менеджер' },
      { id: 'Analyst', label: 'Аналитик' },
      { id: 'Admin', label: 'Админ' }
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUserForEdit(null)}>
        <div 
          className="bg-gray-800 w-full max-w-lg h-[85vh] rounded-t-2xl p-6 overflow-y-auto flex flex-col transition-all duration-300" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center mb-4 sticky top-0 bg-gray-800 pb-2 z-10" onClick={() => setSelectedUserForEdit(null)}>
            <div className="w-12 h-1.5 bg-gray-600 rounded-full cursor-pointer"></div>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg border-2 border-blue-500/30">
              {userToEdit.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-white">{userToEdit.fullName}</h2>
            <p className="text-gray-400 text-sm">@{userToEdit.username}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-700/50 p-4 rounded-xl text-center border border-gray-600">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Баланс</span>
              <p className="text-green-400 font-bold text-xl mt-1">${userToEdit.balance.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl text-center border border-gray-600">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Всего</span>
              <p className="text-blue-400 font-bold text-xl mt-1">${userToEdit.totalEarned.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-6 flex-1">
             <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4 flex items-center gap-2">
               <Briefcase size={16} /> Управление Ролью
             </h3>
             <div className="grid grid-cols-1 gap-3">
                {roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleUpdate(userToEdit.id, r.id)}
                    className={`p-4 rounded-xl text-left font-medium transition-all border flex items-center justify-between group ${
                      userToEdit.role === r.id 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                      : 'bg-gray-700/50 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {userToEdit.role === r.id && <Check size={20} className="text-white" />}
                  </button>
                ))}
             </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-700">
             <button onClick={() => setSelectedUserForEdit(null)} className="w-full py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 font-bold">Закрыть</button>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'users') {
    return (
      <>
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden pb-20">
           <div className="p-4 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
             <h3 className="font-bold text-white flex items-center gap-2"><Briefcase size={20} className="text-blue-400"/> Сотрудники</h3>
             <button onClick={() => setView('home')} className="text-xs text-gray-400 hover:text-white">Закрыть</button>
           </div>
           <div className="divide-y divide-gray-700">
              {users.map((u, i) => (
                <button 
                  key={u.id} 
                  onClick={() => setSelectedUserForEdit(u.id)}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-700/50 transition"
                >
                   <div className="flex items-center gap-3 text-left">
                     <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-sm font-bold">
                       {i+1}
                     </div>
                     <div>
                       <p className="text-white font-medium">{u.fullName}</p>
                       <span className="text-xs bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                          {u.role === 'Worker' && 'Воркер'}
                          {u.role === 'Manager' && 'Менеджер'}
                          {u.role === 'Analyst' && 'Аналитик'}
                          {u.role === 'Admin' && 'Админ'}
                       </span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-green-400 font-bold">${u.balance.toFixed(0)}</p>
                   </div>
                </button>
              ))}
           </div>
        </div>
        {selectedUserForEdit && <UserModal />}
      </>
    );
  }

  // --- HOME VIEW ---
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="text-purple-500" size={28} />
        <h1 className="text-2xl font-bold text-white">Админ Панель</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
           <p className="text-gray-400 text-xs mb-1">Оборот Команды</p>
           <h3 className="text-2xl font-bold text-white">${totalTurnover.toFixed(2)}</h3>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
           <p className="text-gray-400 text-xs mb-1">Долг по ЗП</p>
           <h3 className="text-2xl font-bold text-red-400">${totalDebt.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={() => setView('profit')}
          className="w-full bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg active:scale-95"
        >
          <PlusCircle size={24} /> Внести Профит
        </button>
        <button 
          onClick={() => setView('payout')}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all shadow-lg active:scale-95"
        >
          <DollarSign size={24} /> Выплатить ЗП
        </button>
        <button 
          onClick={() => setView('users')}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all active:scale-95"
        >
          <Users size={24} /> Сотрудники
        </button>
      </div>
    </div>
  );
};