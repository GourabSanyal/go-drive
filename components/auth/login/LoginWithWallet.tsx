import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { SolanaMobileWalletAdapter } from '@/src/utils/SolanaMobileWalletAdapter';
import { Cluster } from '@solana/web3.js';
import { Colors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import { authStorage } from '@/src/utils/storage/authStorage';

import SolanaIcon from '@/assets/images/icons/solana.svg';

interface LoginWithWalletProps {
  disabled?: boolean;
  onLoginSuccess?: () => void; // Simplified callback that only handles navigation
}

const LoginWithWallet: React.FC<LoginWithWalletProps> = ({
  disabled = false,
  onLoginSuccess,
}) => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const getSolanaCluster = (): Cluster => {
    // For now, using devnet - you can make this configurable later
    return 'devnet' as Cluster;
  };

  const handleWalletConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Get the Solana cluster to connect to
      const cluster = getSolanaCluster();
      
      // Use our JavaScript bridge to connect to the wallet
      const walletData = await SolanaMobileWalletAdapter.authorize(cluster) as any;
      
      try {
        // Store the wallet data using the auth storage utility
        const success = authStorage.setSolanaWalletAuth(walletData);
        
        if (success) {
          console.log('✅ Wallet data stored successfully');
          
          // Log current auth state for debugging
          const authState = authStorage.getAuthState();
          console.log('Current auth state:', authState);
          
          // Call onLoginSuccess callback if provided, otherwise navigate directly
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            router.replace('/driver/home');
          }
        } else {
          throw new Error('Failed to store wallet authentication data');
        }
      } catch (storageError) {
        console.error('❌ Error storing wallet data:', storageError);
        Alert.alert(
          'Storage Error',
          'Failed to save wallet data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to your Solana wallet. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsConnecting(false);
    }
  }, [onLoginSuccess, router]);

  return (
    <TouchableOpacity
      style={[
        styles.walletButton,
        { opacity: disabled || isConnecting ? 0.7 : 1 },
      ]}
      activeOpacity={0.8}
      disabled={disabled || isConnecting}
      onPress={handleWalletConnect}>
      {isConnecting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          <SolanaIcon width={24} height={24} style={styles.icon} />
          <Text style={styles.buttonText}>Solana Wallet</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  walletButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 10,
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginWithWallet;