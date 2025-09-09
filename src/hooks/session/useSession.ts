import { useCallback } from 'react';
import { storage } from '@/src/utils/storage/mmkv';
import { authStorage } from '@/src/utils/storage/authStorage';
import { WalletSession, WalletAuthData } from '@/src/types';

const SESSION_KEY = 'wallet_session';

export const useSession = () => {
  const saveSession = useCallback((session: WalletSession) => {
    try {
      storage.set(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, []);

  const getSession = useCallback((): WalletSession | null => {
    try {
      const sessionStr = storage.getString(SESSION_KEY);
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      if (session) {
        console.log('📖 Retrieved session from storage:', session);
      }
      return session;
    } catch (error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      storage.delete(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }, []);

  const saveSessionWithAuth = useCallback(async (session: WalletSession) => {
    try {
      console.log('💾 Saving session to storage:', session);
      saveSession(session);
      
      const walletData: WalletAuthData = {
        address: session.publicKey,
        publicKey: session.publicKey,
        authToken: session.sessionToken,
        username: `${session.walletType}_${session.publicKey.substring(0, 6)}`,
      };
      
      console.log('🔐 Saving wallet data to auth storage:', walletData);
      const success = await authStorage.setSolanaWalletAuth(walletData);
      
      if (success) {
        return true;
      } else {
        throw new Error('Failed to store wallet data');
      }
    } catch (error) {
      console.error('Error saving session with auth:', error);
      return false;
    }
  }, [saveSession]);

  const isAuthenticated = useCallback((): boolean => {
    const session = getSession();
    return session !== null;
  }, [getSession]);

  return {
    saveSession,
    getSession,
    clearSession,
    saveSessionWithAuth,
    isAuthenticated,
  };
};
