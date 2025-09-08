import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { usePhantomConnection } from './usePhantomConnection';

export const useSessionNavigation = () => {
  const router = useRouter();
  const { getSession } = usePhantomConnection();

  useEffect(() => {
    const checkSessionAndNavigate = () => {
      const session = getSession();
      
      if (session) {
        console.log('✅ Session found, redirecting to home:', session.publicKey);
        router.replace('/driver/home');
      } else {
        console.log('❌ No session found, staying on current page');
      }
    };

    // Check session on mount
    checkSessionAndNavigate();
  }, [getSession, router]);

  return {
    checkSession: () => {
      const session = getSession();
      return session;
    }
  };
};
