import { Image, TouchableOpacity, View } from 'react-native';
import { commonOnboardStyles as styles } from '@/components/onboarding/styles';
import NextIcon from '@/assets/images/onboarding/1-next-button.svg'
import CustomText from '../ui/CustomText';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Screen1 = () => {
    const router = useRouter();

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.root}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/onboarding/screen1.png')}
                    style={styles.image}
                />
            </View>
            <View style={styles.body}>
                <CustomText style={styles.h1}>
                    Eco-Friendly Rides
                </CustomText>
                <CustomText style={styles.h2}>
                    Choose eco-friendly options for a {'\n'}cleaner future
                </CustomText>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => router.push("/onboarding/screen2")}>
                    <NextIcon style={styles.nextBtn} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => router.push("/auth/signup")}>
                    <CustomText style={styles.link}>
                        Skip
                    </CustomText>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default Screen1;

