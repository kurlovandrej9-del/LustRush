import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Lock, UserCircle2, ArrowRight, KeyRound, ShieldCheck, Loader2, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register } = useData();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [personalPassword, setPersonalPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isRegistering) {
            if (!username || !personalPassword || !accessCode) {
                setError('Заполните все поля');
                setLoading(false);
                return;
            }
            const result = await register(username, personalPassword, accessCode);
            if (!result.success) {
                setError(result.message || 'Ошибка регистрации');
            }
        } else {
            if (!username || !personalPassword) {
                setError('Заполните все поля');
                setLoading(false);
                return;
            }
            const result = await login(username, personalPassword);
            if (!result.success) {
                setError(result.message || 'Ошибка входа');
            }
        }
    } catch (e) {
        setError('Произошла ошибка сети');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-800 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-900/40 mb-5 transform rotate-3 hover:rotate-6 transition-transform">
             <Zap className="text-white" size={40} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide italic uppercase">
            Lust Rush <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Team</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            {isRegistering ? 'Присоединяйся к элите' : 'Добро пожаловать домой'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              Telegram Никнейм
            </label>
            <div className="relative group">
              <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.replace('@', ''))}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-medium"
                placeholder="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              {isRegistering ? 'Придумайте пароль' : 'Пароль'}
            </label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="password"
                value={personalPassword}
                onChange={e => setPersonalPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                Код доступа
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="password"
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-medium"
                  placeholder="Введите код"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-pulse font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? (
                <Loader2 className="animate-spin" />
            ) : (
                <>
                {isRegistering ? 'Создать аккаунт' : 'Войти в систему'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setAccessCode('');
              setPersonalPassword('');
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-gray-500 pb-0.5"
          >
            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
          </button>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
           Lust Rush Team &copy; 2024
        </div>
      </div>
    </div>
  );
};