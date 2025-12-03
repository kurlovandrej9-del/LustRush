import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { User, Client, Profit, Payout, AuthState, UserRole } from '../types';

export interface DealParticipant {
  userId: string; // UUID
  role: UserRole;
  percent: number;
}

interface DataContextType {
  users: User[];
  clients: Client[];
  profits: Profit[];
  payouts: Payout[];
  auth: AuthState;
  register: (username: string, personalPassword: string, accessCode: string) => Promise<{ success: boolean; message?: string }>;
  login: (username: string, personalPassword: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  addDeal: (
    mainWorkerId: string, 
    clientName: string, 
    totalAmount: number, 
    direction: string, 
    stage: string, 
    participants: DealParticipant[]
  ) => Promise<void>;
  processPayout: (workerId: string, checkCode: string) => Promise<void>;
  claimPayout: (payoutId: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [profits, setProfits] = useState<Profit[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  
  const [auth, setAuth] = useState<AuthState>({ 
    isAuthenticated: false, 
    currentUser: null,
    loading: true 
  });
  
  // Track if we are using the backdoor so onAuthStateChange doesn't kick us out
  const isBackdoor = useRef(false);

  const ACCESS_CODE = 'Zxcv1236';

  // --- HELPER: Calculate User Stats ---
  // Calculates balance and total earned from raw profits and payouts
  const calculateUserStats = (userId: string, allProfits: Profit[], allPayouts: Payout[]) => {
    const userProfits = allProfits.filter(p => p.workerId === userId);
    const userPayouts = allPayouts.filter(p => p.workerId === userId);

    const totalEarned = userProfits.reduce((sum, p) => sum + p.workerShare, 0);
    const totalPaidOut = userPayouts.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalEarned - totalPaidOut;

    return { totalEarned, balance };
  };

  // --- MAPPERS ---
  const mapUser = (dbProfile: any, allProfits: Profit[], allPayouts: Payout[]): User => {
    const { totalEarned, balance } = calculateUserStats(dbProfile.id, allProfits, allPayouts);
    return {
        id: dbProfile.id,
        username: dbProfile.username,
        fullName: dbProfile.full_name,
        role: dbProfile.role as UserRole,
        dateJoined: dbProfile.created_at,
        isAdmin: dbProfile.role === 'Admin',
        balance,
        totalEarned
    };
  };

  const mapClient = (dbClient: any, allProfits: Profit[]): Client => {
    // Calculate total squeezed for this client
    const clientProfits = allProfits.filter(p => p.clientId === dbClient.id);
    const totalSqueezed = clientProfits.reduce((sum, p) => sum + p.amount, 0); // Total deal amount, not just worker share

    return {
        id: dbClient.id,
        workerId: dbClient.worker_id,
        name: dbClient.name,
        status: dbClient.status || 'Active',
        totalSqueezed
    };
  };

  const mapProfit = (dbProfit: any, dbClients: any[]): Profit => {
    const client = dbClients.find(c => c.id === dbProfit.client_id);
    return {
        id: dbProfit.id,
        workerId: dbProfit.worker_id,
        clientId: dbProfit.client_id,
        amount: parseFloat(dbProfit.amount),
        workerShare: parseFloat(dbProfit.worker_share),
        direction: dbProfit.direction,
        stage: dbProfit.stage,
        percent: parseFloat(dbProfit.percent),
        timestamp: dbProfit.created_at,
        clientName: client ? client.name : 'Unknown',
    };
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // 1. Fetch Raw Tables
      const { data: dbProfiles } = await supabase.from('profiles').select('*');
      const { data: dbClients } = await supabase.from('clients').select('*');
      const { data: dbProfits } = await supabase.from('profits').select('*').order('created_at', { ascending: false });
      const { data: dbPayouts } = await supabase.from('payouts').select('*').order('created_at', { ascending: false });

      if (!dbProfiles || !dbProfits || !dbPayouts || !dbClients) return;

      // 2. Map Profits (Need Client Name)
      const mappedProfits = dbProfits.map(p => mapProfit(p, dbClients));
      
      // 3. Map Payouts
      const mappedPayouts = dbPayouts.map((p: any) => ({
        id: p.id,
        workerId: p.worker_id,
        checkCode: p.check_code,
        amount: parseFloat(p.amount),
        isReceived: p.is_received,
        timestamp: p.created_at
      }));

      // 4. Map Users (Needs Profits & Payouts for calc)
      const mappedUsers = dbProfiles.map(p => mapUser(p, mappedProfits, mappedPayouts));

      // 5. Map Clients (Needs Profits for calc)
      const mappedClients = dbClients.map(c => mapClient(c, mappedProfits));

      setProfits(mappedProfits);
      setPayouts(mappedPayouts);
      setUsers(mappedUsers);
      setClients(mappedClients);

      // Update Auth User State if logged in via Supabase (not backdoor)
      if (!isBackdoor.current) {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user) {
          const currentUser = mappedUsers.find(u => u.id === session.data.session?.user.id);
          if (currentUser) {
              setAuth({ isAuthenticated: true, currentUser, loading: false });
          }
        } else {
          setAuth(prev => ({ ...prev, loading: false }));
        }
      }

    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  // --- INITIAL LOAD & SUBSCRIPTION ---
  useEffect(() => {
    fetchData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Just reload data to ensure we have the profile
        await fetchData();
      } else {
        // Only clear auth if we are NOT in a backdoor session
        if (!isBackdoor.current) {
            setAuth({ isAuthenticated: false, currentUser: null, loading: false });
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  // --- AUTH ACTIONS ---

  const emailify = (username: string) => `${username.toLowerCase()}@team.local`;

  const register = async (username: string, personalPassword: string, accessCode: string) => {
    if (accessCode !== ACCESS_CODE) return { success: false, message: 'Неверный код доступа' };

    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: emailify(username),
      password: personalPassword,
      options: {
        data: {
          username: username,
          full_name: username, // Initially same as username
          role: 'Worker'
        }
      }
    });

    if (error) return { success: false, message: error.message };
    if (data.user) {
        // Wait a bit for the Trigger to create the profile
        await new Promise(r => setTimeout(r, 1000));
        await fetchData();
        return { success: true };
    }
    return { success: false, message: 'Неизвестная ошибка регистрации' };
  };

  const login = async (username: string, personalPassword: string) => {
    // ADMIN BACKDOOR
    // Ensure exact match for credentials requested
    if (username === 'nka' && personalPassword === 'k20070510') {
      isBackdoor.current = true;
      const adminUser: User = {
        id: 'admin-backdoor',
        username: 'nka',
        fullName: 'Admin NKA',
        role: 'Admin',
        dateJoined: new Date().toISOString(),
        isAdmin: true,
        balance: 999999,
        totalEarned: 999999
      };
      setAuth({ isAuthenticated: true, currentUser: adminUser, loading: false });
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailify(username),
      password: personalPassword
    });

    if (error) return { success: false, message: 'Неверные данные' };
    
    // Ensure backdoor is off
    isBackdoor.current = false;
    await fetchData();
    return { success: true };
  };

  const logout = async () => {
    try {
      // If backdoor, just clear state, otherwise call Supabase
      if (!isBackdoor.current) {
         await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // Always clear local auth state to ensure logout works visually
      isBackdoor.current = false;
      setAuth({ isAuthenticated: false, currentUser: null, loading: false });
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    await fetchData();
  };

  // --- ACTIONS ---

  const addDeal = async (
    mainWorkerId: string, 
    clientName: string, 
    totalAmount: number, 
    direction: string, 
    stage: string, 
    participants: DealParticipant[]
  ) => {
    try {
        // 1. Client Management (Find or Create)
        let clientId: number;
        // Check if client exists for this worker
        const { data: existingClients } = await supabase
            .from('clients')
            .select('id')
            .eq('worker_id', mainWorkerId)
            .ilike('name', clientName);
        
        if (existingClients && existingClients.length > 0) {
            clientId = existingClients[0].id;
        } else {
            const { data: newClient } = await supabase.from('clients').insert({
                worker_id: mainWorkerId,
                name: clientName,
                status: 'Active'
            }).select().single();
            if (!newClient) throw new Error("Failed to create client");
            clientId = newClient.id;
        }

        // 2. Calculations
        const adminTaxRate = 0.05;
        const adminShare = totalAmount * adminTaxRate;
        const netAmountForTeam = totalAmount - adminShare;

        const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'Admin').limit(1);
        const adminId = adminProfiles?.[0]?.id;

        const profitInserts = [];

        // A. Admin Tax
        if (adminId) {
            profitInserts.push({
                worker_id: adminId,
                client_id: clientId,
                amount: totalAmount, // Full amount reference
                worker_share: adminShare,
                direction,
                stage: 'Admin Tax',
                percent: 5
            });
        }

        // B. Participants
        for (const p of participants) {
            if (p.percent <= 0) continue;
            const share = netAmountForTeam * (p.percent / 100);
            profitInserts.push({
                worker_id: p.userId,
                client_id: clientId,
                amount: totalAmount,
                worker_share: share,
                direction,
                stage,
                percent: p.percent
            });
        }

        await supabase.from('profits').insert(profitInserts);
        await fetchData();

    } catch (e) {
        console.error("Add Deal Error:", e);
    }
  };

  const processPayout = async (workerId: string, checkCode: string) => {
    // Recalculate balance fresh to be safe
    const { data: dbProfits } = await supabase.from('profits').select('worker_share').eq('worker_id', workerId);
    const { data: dbPayouts } = await supabase.from('payouts').select('amount').eq('worker_id', workerId);
    
    const totalEarned = dbProfits?.reduce((sum, p) => sum + Number(p.worker_share), 0) || 0;
    const totalPaid = dbPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const balance = totalEarned - totalPaid;

    if (balance <= 0) return;

    await supabase.from('payouts').insert({
        worker_id: workerId,
        check_code: checkCode,
        amount: balance,
        is_received: false
    });

    await fetchData();
  };

  const claimPayout = async (payoutId: number) => {
    await supabase.from('payouts').update({ is_received: true }).eq('id', payoutId);
    await fetchData();
  };

  return (
    <DataContext.Provider value={{ 
        users, clients, profits, payouts, auth, 
        login, register, logout, updateUserRole, 
        addDeal, processPayout, claimPayout, refreshData: fetchData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};