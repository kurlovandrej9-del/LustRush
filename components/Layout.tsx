import React from 'react';
import { useData } from '../services/dataContext';
import { LayoutDashboard, Users, History, Settings, LogOut, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { auth, logout } = useData();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`relative flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${
        activeTab === id ? 'text-blue-400 scale-105' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`absolute -top-1 w-8 h-1 bg-blue-500 rounded-full blur-sm transition-opacity duration-300 ${activeTab === id ? 'opacity-100' : 'opacity-0'}`}></div>
      <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* Mobile/Desktop Content Wrapper */}
      <main className="flex-1 overflow-y-auto h-screen pb-24 md:pb-0 md:pl-64 scroll-smooth">
        <div className="max-w-4xl mx-auto p-4 pt-6">
           {children}
        </div>
      </main>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 fixed h-full inset-y-0 left-0 shadow-2xl">
        <div className="p-8">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-wider flex items-center gap-2 italic">
            <Zap className="text-blue-400 fill-blue-400/20" />
            LUST RUSH
          </h1>
          <p className="text-gray-500 text-xs mt-2 pl-9 font-medium tracking-widest uppercase">Team Workspace</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" /> Главная
           </button>
           <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === 'clients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Users size={20} className="group-hover:scale-110 transition-transform" /> Мамонты
           </button>
           <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <History size={20} className="group-hover:scale-110 transition-transform" /> История
           </button>
           {auth.currentUser?.isAdmin && (
             <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Админка
             </button>
           )}
        </nav>
        
        <div className="p-4 m-4 border-t border-gray-700/50">
           <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-500">Система активна</span>
           </div>
          <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors">
            <LogOut size={20} /> Выход
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-lg border-t border-gray-800 flex justify-around items-center pb-safe pt-1 z-50 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <NavItem id="dashboard" icon={LayoutDashboard} label="Главная" />
        <NavItem id="clients" icon={Users} label="Мамонты" />
        <NavItem id="history" icon={History} label="История" />
        {auth.currentUser?.isAdmin && <NavItem id="admin" icon={Settings} label="Админ" />}
        <button type="button" onClick={handleLogout} className="flex flex-col items-center justify-center w-full py-2 text-red-400 active:text-red-300">
           <LogOut size={24} />
           <span className="text-[10px] mt-1 font-medium">Выход</span>
        </button>
      </div>
    </div>
  );
};