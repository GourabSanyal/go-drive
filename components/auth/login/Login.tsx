import { TouchableOpacity, View } from 'react-native';
import { CheckBox, Input, Text } from '@ui-kitten/components';
import { styles } from '../styles';
import Margin from '@/components/ui/Margin';
import GoogleIcon from '@/assets/images/auth/google.svg';
import FacebookIcon from '@/assets/images/auth/facebook.svg';
import AppleIcon from '@/assets/images/auth/apple.svg';
import CustomButton from '@/components/ui/CustomButton';
import { Colors } from '@/theme/colors';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import {
    GoogleAuthProvider,
    getAuth,
    signInWithCredential,
    signInWithPhoneNumber
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    query,
    where
} from '@react-native-firebase/firestore';
import { storage } from '@/src/utils/storage/mmkv';

const Login = () => {
    const router = useRouter()
    const segments = useSegments()
    const db = getFirestore()
    const [value, setValue] = useState('');
    const [checked, setChecked] = useState(true);
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState<any | null>(null);
    // verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');
    // Set an initializing state whilst Firebase connects

    // Handle the button press
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

    async function onGoogleButtonPress() {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const signInResult = await GoogleSignin.signIn();
            const email = signInResult.data?.user.email
            const photo = signInResult.data?.user.photo
            const name = signInResult.data?.user.name
            const userId = signInResult.data?.user.id
            // Try the new style of google-sign in result, from v13+ of that module
            let idToken = signInResult.data?.idToken;
            if (!idToken) {
                // if you are using older versions of google-signin, try old style result
                idToken = signInResult.data?.idToken;
            }
            if (!idToken || !name || !userId) {
                throw new Error('No ID token & name found');
            }

            storage.set("idToken", idToken)
            storage.set("name", name)
            storage.set("userId", userId)

            const existingUser = await getDocs(
                query(
                    collection(db, 'drivers'),
                    where('email', '==', email)
                )
            )
            // Create user if not exists
            if (!existingUser.docs[0]) {
                await addDoc(collection(db, 'drivers'), { userId, name, email, photo })
            }
            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(signInResult.data!.idToken);
            // Sign-in the user with the credential
            return signInWithCredential(getAuth(), googleCredential);
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    // async function onFacebookButtonPress() {
    //     // Attempt login with permissions
    //     const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    //     if (result.isCancelled) {
    //         throw 'User cancelled the login process';
    //     }
    //     // Once signed in, get the users AccessToken
    //     const data = await AccessToken.getCurrentAccessToken();

    //     if (!data) {
    //         throw 'Something went wrong obtaining access token';
    //     }

    //     // Create a Firebase credential with the AccessToken
    //     const facebookCredential = FacebookAuthProvider.credential(data.accessToken);

    //     // Sign-in the user with the credential
    //     return signInWithCredential(getAuth(), facebookCredential);
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
                <TouchableOpacity
                    onPress={() => onGoogleButtonPress().then(() => router.replace("/driver/home"))}
                    activeOpacity={0.95}>
                    <GoogleIcon width={50} height={50} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.95}>
                    <FacebookIcon width={50} height={50} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.95}>
                    <AppleIcon width={50} height={50} />
                </TouchableOpacity>
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

