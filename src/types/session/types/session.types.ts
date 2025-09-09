import { WalletSession } from '../../wallet/types/wallet.types';

export interface SessionManager {
  saveSession: (session: WalletSession) => void;
  getSession: () => WalletSession | null;
  clearSession: () => void;
  saveSessionWithAuth: (session: WalletSession) => Promise<boolean>;
  isAuthenticated: () => boolean;
}

export interface SessionStorage {
  save: (key: string, data: WalletSession) => void;
  get: (key: string) => WalletSession | null;
  delete: (key: string) => void;
}
