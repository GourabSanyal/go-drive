import { storage } from './mmkv';

export interface SolanaWalletData {
  address: string;
  publicKey: string;
  authToken: string;
  username?: string;
  profilePicUrl?: string;
  attachmentData?: any;
}

export interface AuthState {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  provider: 'phone' | 'google' | 'solana' | 'mwa' | null;
  user: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    walletAddress?: string;
    profilePicUrl?: string;
    username?: string;
  } | null;
}

export const authStorage = {
  // Store Solana wallet authentication data
  setSolanaWalletAuth: (walletData: SolanaWalletData) => {
    try {
      // Store authentication data
      storage.set("provider", "mwa");
      storage.set("address", walletData.address);
      storage.set("publicKey", walletData.publicKey);
      storage.set("isLoggedIn", true);
      storage.set("isLoggingIn", false);
      
      // Store user profile data
      storage.set("username", walletData.username || walletData.address.substring(0, 6));
      storage.set("profilePicUrl", walletData.profilePicUrl || "");
      storage.set("attachmentData", JSON.stringify(walletData.attachmentData || {}));
      
      // Store wallet-specific tokens
      storage.set("walletAuthToken", walletData.authToken);
      
      // Clear any previous auth tokens from other providers
      storage.delete("idToken");
      storage.delete("userId");
      storage.delete("name");
      storage.delete("email");
      storage.delete("phone");
      
      console.log("✅ Solana wallet auth data stored successfully");
      return true;
    } catch (error) {
      console.error("❌ Error storing Solana wallet auth data:", error);
      return false;
    }
  },

  // Get current authentication state
  getAuthState: (): AuthState => {
    const isLoggedIn = storage.getBoolean('isLoggedIn') || false;
    const provider = storage.getString('provider') as AuthState['provider'] || null;
    const isLoggingIn = storage.getBoolean('isLoggingIn') || false;
    
    let user = null;
    if (isLoggedIn) {
      user = {
        id: storage.getString('userId') || undefined,
        name: storage.getString('name') || undefined,
        email: storage.getString('email') || undefined,
        phone: storage.getString('phone') || undefined,
        walletAddress: storage.getString('address') || undefined,
        profilePicUrl: storage.getString('profilePicUrl') || undefined,
        username: storage.getString('username') || undefined,
      };
    }

    return {
      isLoggedIn,
      isLoggingIn,
      provider,
      user,
    };
  },

  // Clear all authentication data
  clearAuth: () => {
    try {
      const keysToDelete = [
        'isLoggedIn',
        'isLoggingIn',
        'provider',
        'userId',
        'name',
        'email',
        'phone',
        'address',
        'publicKey',
        'username',
        'profilePicUrl',
        'attachmentData',
        'idToken',
        'walletAuthToken'
      ];
      
      keysToDelete.forEach(key => storage.delete(key));
      console.log("✅ Auth data cleared successfully");
      return true;
    } catch (error) {
      console.error("❌ Error clearing auth data:", error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return storage.getBoolean('isLoggedIn') || false;
  },

  // Get current provider
  getProvider: (): AuthState['provider'] => {
    return storage.getString('provider') as AuthState['provider'] || null;
  },
  
  // Get wallet auth token for deauthorization
  getWalletAuthToken: (): string | null => {
    return storage.getString('walletAuthToken') || null;
  }
};
