import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { Colors } from '@/theme/colors';

interface LoadingButtonProps {
  onPress: () => void;
  isLoading: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  buttonText: string;
  loadingText?: string;
  icon?: React.ReactNode;
  backgroundColor?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onPress,
  isLoading,
  disabled = false,
  style,
  buttonText,
  loadingText,
  icon,
  backgroundColor = Colors.primary,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, opacity: disabled || isLoading ? 0.7 : 1 },
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          {loadingText && (
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
              {loadingText}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.buttonText}>{buttonText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
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
  loadingContainer: {
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

export default LoadingButton;
