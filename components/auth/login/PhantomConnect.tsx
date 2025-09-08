import React, { useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SolanaIcon from '@/assets/images/icons/solana.svg';
import LoadingButton from '@/components/ui/LoadingButton';
import { usePhantomConnection } from '@/src/hooks/wallet';

interface PhantomConnectProps {
  disabled?: boolean;
  onLoginSuccess?: () => void;
}

const PhantomConnect: React.FC<PhantomConnectProps> = ({
  disabled = false,
  onLoginSuccess,
}) => {
  const router = useRouter();
  const { connect, connectionState, getSession } = usePhantomConnection();

  // Handle connection state changes
  useEffect(() => {
    if (connectionState.error) {
      Alert.alert(
        'Connection Error 1',
        connectionState.error,
        [{ text: 'OK' }]
      );
    }

    if (connectionState.isConnected) {
      // Check if session was saved successfully
      const session = getSession();
      if (session) {
        console.log('✅ Session saved successfully, redirecting...');
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          router.replace('/driver/home');
        }
      } else {
        Alert.alert(
          'Connection Error 2',
          'Failed to save session data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [connectionState, onLoginSuccess, router, getSession]);

  return (
    <LoadingButton
      onPress={connect}
      isLoading={connectionState.isConnecting || connectionState.isCheckingConnection}
      disabled={disabled}
      buttonText="Connect with Phantom"
      loadingText="Connecting..."
      icon={<SolanaIcon width={24} height={24} style={styles.icon} />}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 10,
  },
});

export default PhantomConnect;