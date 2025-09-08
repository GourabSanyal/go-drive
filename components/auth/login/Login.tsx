import { View, Alert } from 'react-native';
import { CheckBox, Input, Text } from '@ui-kitten/components';
import { styles } from '../styles';
import Margin from '@/components/ui/Margin';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/theme/colors';
import { useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import {
    GoogleAuthProvider,
    getAuth,
    signInWithCredential,
    signInWithPhoneNumber
} from '@react-native-firebase/auth';
import {
    getFirestore,
} from '@react-native-firebase/firestore';
import { storage } from '@/src/utils/storage/mmkv';
import { authStorage } from '@/src/utils/storage/authStorage';
import PhantomConnect from './PhantomConnect';

const Login = () => {
    const router = useRouter()
    const segments = useSegments()
    const db = getFirestore()
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(true);
    const [confirm, setConfirm] = useState<any | null>(null);
    const [code, setCode] = useState('');

    async function handleSignInWithPhoneNumber(phoneNumber: string) {
        try {
            const confirmation = await signInWithPhoneNumber(getAuth(), `+91${phoneNumber}`);
            setConfirm(confirmation);
        } catch (error) {
            console.error(error)
        }
    }

    async function confirmCode() {
        try {
            await confirm!.confirm(code);
        } catch (error) {
            console.error('Invalid code');
        }
    }

    // Simplified callback that only handles navigation after successful login
    const handleLoginSuccess = () => {
        console.log("✅ Login successful, navigating to home");
        router.replace("/driver/home");
    };

    // async function onGoogleButtonPress() {
    //     try {
    //         // Check if your device supports Google Play
    //         await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    //         // Get the users ID token
    //         const signInResult = await GoogleSignin.signIn();
    //         const email = signInResult.data?.user.email
    //         const photo = signInResult.data?.user.photo
    //         const name = signInResult.data?.user.name
    //         const userId = signInResult.data?.user.id
    //         // Try the new style of google-sign in result, from v13+ of that module
    //         let idToken = signInResult.data?.idToken;
    //         if (!idToken) {
    //             // if you are using older versions of google-signin, try old style result
    //             idToken = signInResult.data?.idToken;
    //         }
    //         if (!idToken || !name || !userId) {
    //             throw new Error('No ID token & name found');
    //         }

    //         storage.set("idToken", idToken)
    //         storage.set("name", name)
    //         storage.set("userId", userId)

    //         const existingUser = await getDocs(
    //             query(
    //                 collection(db, 'drivers'),
    //                 where('email', '==', email)
    //             )
    //         )
    //         // Create user if not exists
    //         if (!existingUser.docs[0]) {
    //             await addDoc(collection(db, 'drivers'), { userId, name, email, photo })
    //         }
    //         // Create a Google credential with the token
    //         const googleCredential = GoogleAuthProvider.credential(signInResult.data!.idToken);
    //         // Sign-in the user with the credential
    //         return signInWithCredential(getAuth(), googleCredential);
    //     } catch (error) {
    //         console.error(error)
    //         throw error
    //     }
    // }
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
                onChangeText={(nextValue: string) => setValue(nextValue)}
            />
            <View style={{ marginTop: 30 }}>
                <CheckBox
                    checked={checked}
                    onChange={(nextChecked: boolean) => setChecked(nextChecked)}
                >
                    <Text>
                        <Text style={styles.checkbox} >By signing up. you agree to the</Text> <Text style={[styles.checkbox, { textDecorationLine: 'underline', color: Colors.primary }]}>Terms of service</Text> and <Text style={[styles.checkbox, { textDecorationLine: 'underline', color: Colors.primary }]}>Privacy policy</Text>.
                    </Text>
                </CheckBox>
            </View>
            <Margin margin={30} />
            <CustomButton
                // disabled={!value || value.length == 0}
                onPress={() => {
                    router.push("/auth/otp")
                    handleSignInWithPhoneNumber(value)
                }
                }
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
                <PhantomConnect onLoginSuccess={handleLoginSuccess} />
            </View>
            <Text style={styles.h2_bold}>
                Don't have an account?
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

