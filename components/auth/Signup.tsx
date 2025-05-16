import { TouchableOpacity, View } from 'react-native';
import { CheckBox, Input, Text } from '@ui-kitten/components';
import { styles } from './styles';
import Margin from '@/components/ui/Margin';
import GoogleIcon from '@/assets/images/auth/google.svg';
import FacebookIcon from '@/assets/images/auth/facebook.svg';
import AppleIcon from '@/assets/images/auth/apple.svg';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/theme/colors';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const Signup = () => {
    const router = useRouter()
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(true);

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>
                Welcome Back
            </Text>
            <Text style={styles.h2}>
                Start your eco-friendly journey {'\n'} with us!
            </Text>
            <Input
                placeholder="Phone Number"
                size="large"
                value={value}
                style={styles.input}
                onChangeText={nextValue => setValue(nextValue)}
            />
            <View style={{ marginTop: 30 }}>
                <CheckBox
                    checked={checked}
                    onChange={nextChecked => setChecked(nextChecked)}
                >
                    <Text>
                        <Text style={styles.checkbox} >By signing up. you agree to the</Text> <Text style={[styles.checkbox, { textDecorationLine: 'underline', color: Colors.primary }]}>Terms of service</Text> and <Text style={[styles.checkbox, { textDecorationLine: 'underline', color: Colors.primary }]}>Privacy policy</Text>.
                    </Text>
                </CheckBox>
            </View>
            <Margin margin={30} />
            <CustomButton
                onPress={() => router.push("/auth/otp")}
                status="primary">
                Signup
            </CustomButton>
            <View style={styles.orContainer}>
                <View style={styles.orDivider} />
                <Text style={[styles.h2_bold, { marginBottom: 0 }]}>
                    Or
                </Text>
                <View style={styles.orDivider} />
            </View>
            <Text style={[styles.h2_bold, { color: Colors.primary }]}>
                Sign Up with
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
                    onPress={() => router.push("/auth/login")}
                    style={[styles.h2_bold, styles.underline]}>
                    Log In
                </Text>
            </Text>
            {/* onPress={() => navigation.navigate('OnboardingScreens', { screen: 'Screen1' })} */}
        </View >
    );
};

export default Signup;

