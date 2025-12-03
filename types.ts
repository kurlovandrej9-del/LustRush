
export type UserRole = 'Worker' | 'Manager' | 'Analyst' | 'Admin';

export interface User {
  id: string; // UUID in Supabase
  username: string;
  fullName: string;
  role: UserRole;
  dateJoined: string;
  // Computed fields (not in DB profile table)
  balance: number;
  totalEarned: number;
  isAdmin: boolean;
}

export interface Client {
  id: number;
  workerId: string; // UUID
  name: string;
  status: 'Active' | 'Inactive';
  totalSqueezed: number; // Computed on frontend
}

export interface Profit {
  id: number;
  workerId: string; // UUID
  clientId: number;
  amount: number;
  workerShare: number;
  direction: string;
  stage: string;
  percent: number;
  timestamp: string;
  clientName?: string;
}

export interface Payout {
  id: number;
  workerId: string; // UUID
  checkCode: string;
  amount: number;
  isReceived: boolean; 
  timestamp: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
}