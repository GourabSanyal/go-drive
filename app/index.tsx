import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import Logo from '@/assets/images/logo.svg';
import { useRouter } from 'expo-router';
import CustomText from '@/components/ui/CustomText';
import { StatusBar } from 'expo-status-bar';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { FirebaseAuthTypes, getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { storage } from '@/src/utils/storage/mmkv';
import { authStorage } from '@/src/utils/storage/authStorage';

GoogleSignin.configure({
    webClientId: '958848343136-qvt997jbeo3o4j2cv50j8cn7msjc76tu.apps.googleusercontent.com',
});

export default function Index() {
    const router = useRouter();

    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

    // Handle user state changes
    function handleAuthStateChanged(user: any) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
        return subscriber;
    }, []);

    useEffect(() => {
        if (initializing) return

        // Check authentication using the auth storage utility
        const authState = authStorage.getAuthState();
        const hasIdToken = storage.getString("idToken");
        
        // Check if user is authenticated via Firebase OR Solana wallet
        if ((user && hasIdToken) || authState.isLoggedIn) {
            console.log("User authenticated, navigating to home");
            router.replace("/driver/home");
        } else {
            console.log("User not authenticated, navigating to login");
            router.replace("/auth/login");
        }
    }, [user, initializing])

    // useEffect(() => {
    //     setTimeout(() => {
    //         // router.replace("/driver/home"); // DELETE THIS AND ↓
    //         router.replace("/auth/signup"); // COMMENT THIS OUT
    //     }, 1000);
    // });

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#000022' style='light' />
            <Logo />
            <CustomText
                fontFamily='MontserratExtraBoldItalic'
                variant='h0'
                style={styles.text}>
                let's go
            </CustomText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#0d0e22",
    },
    image: {
        width: 200,
        height: 114
    },
    text: {
        marginTop: 20
    },
});
