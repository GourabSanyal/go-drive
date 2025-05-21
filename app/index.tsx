import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Logo from '@/assets/images/logo.svg';
import { useRouter } from 'expo-router';
import CustomText from '@/components/ui/CustomText';
import { StatusBar } from 'expo-status-bar';


export default function Index() {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.replace("/driver/home"); // DELETE THIS AND ↓
            // router.replace("/onboarding/screen1"); // COMMENT THIS OUT
        }, 1000);
    });

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
