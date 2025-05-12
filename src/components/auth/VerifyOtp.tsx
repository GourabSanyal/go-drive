import { View } from 'react-native';
import React from 'react';
import { Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import OTPInput from './OtpInput';
import CustomButton from '@/components/ui/CustomButton';
import Margin from '@/components/ui/Margin';
import { useRouter } from 'expo-router';

const VerifyOtp = () => {
    const router = useRouter()

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>
                Phone Verification
            </Text>
            <Text style={styles.h2}>
                Enter your OTP code
            </Text>
            <OTPInput />
            <Text style={[styles.h2_bold, { fontSize: 14, marginTop: 20, marginBottom: 50 }]}>
                Didn’t receive code? <Text style={[styles.h2_bold, styles.underline, { fontSize: 14, }]}>Resend again</Text>
            </Text>
            <Margin margin={30} />
            <CustomButton
                onPress={() => router.replace("/driver/home")}
                status="primary"
                size="medium" >
                Verify OTP
            </CustomButton>
        </View >
    );
};

export default VerifyOtp;


