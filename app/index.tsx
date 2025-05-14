import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import Logo from '@/assets/images/logo.svg';
import { useRouter } from 'expo-router';
import CustomText from '@/components/ui/CustomText';

export default function Index() {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.replace("/onboarding/screen1");
        }, 5000);
    });

    return (
        <View style={styles.container}>
            <Logo />
            <CustomText
                fontFamily='MontserratExtraBoldItalic'
                variant='h0'
                style={styles.text}>
                let’s go
            </CustomText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#0d0e22"
    },
    image: {
        width: 200,
        height: 114
    },
    text: {
        marginTop: 20
    },
});
