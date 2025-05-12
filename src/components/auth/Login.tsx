import { TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Input, Text } from '@ui-kitten/components';
import { styles } from './styles';
import CustomButton from '../ui/CustomButton';
import Margin from '../ui/Margin';
import GoogleIcon from '@/assets/images/icons/google.svg';
import FacebookIcon from '@/assets/images/icons/facebook.svg';
import AppleIcon from '@/assets/images/icons/apple.svg';
import { Colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

const Login = () => {
    const router = useRouter()
    const [value, setValue] = React.useState('');
    return (
        <View style={styles.container}>
            <Text style={styles.h1}>
                Welcome Back
            </Text>
            <Text style={styles.h2}>
                Log in to continue your  journey {'\n'} with us!
            </Text>
            <Input
                placeholder="Phone Number"
                size="large"
                value={value}
                style={styles.input}
                onChangeText={nextValue => setValue(nextValue)}
            />
            <Margin margin={30} />
            <CustomButton
                onPress={() => router.push("/auth/otp")}
                status="primary">
                Login
            </CustomButton>
            <View style={styles.orContainer}>
                <View style={styles.orDivider} />
                <Text style={[styles.h2_bold, { marginBottom: 0 }]}>
                    Or
                </Text>
                <View style={styles.orDivider} />
            </View>
            <Text style={[styles.h2_bold, { color: Colors.primary }]}>
                Log In with
            </Text>
            <View style={styles.social}>
                <TouchableOpacity>
                    <GoogleIcon width={50} height={50} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <FacebookIcon width={50} height={50} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <AppleIcon width={50} height={50} />
                </TouchableOpacity>
            </View>
            <Text style={styles.h2_bold}>
                Don’t have an account?
                <Text
                    onPress={() => router.push("/auth/signup")}
                    style={[styles.h2_bold, styles.underline]}>
                    Sign Up
                </Text>
            </Text>
        </View >
    );
};

export default Login;

