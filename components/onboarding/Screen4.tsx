import { Image, TouchableOpacity, View } from 'react-native';
import { commonOnboardStyles } from './styles';
import NextIcon from '@/assets/images/onboarding/4-next-button.svg'
import CustomText from '../ui/CustomText';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Screen4 = () => {
    const router = useRouter()

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={commonOnboardStyles.root}>
            <View style={commonOnboardStyles.imageContainer}>
                <Image
                    source={require('@/assets/images/onboarding/screen4.png')}
                    style={commonOnboardStyles.image}
                />
            </View>
            <View style={commonOnboardStyles.body}>
                <CustomText style={commonOnboardStyles.h1}>
                    Multiple  Payments
                </CustomText>
                <CustomText style={commonOnboardStyles.h2}>
                    Pay securely using crypto wallets, {'\n'} cards, or UPI
                </CustomText>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => router.replace("/auth/signup")}>
                    <NextIcon style={commonOnboardStyles.nextBtn} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default Screen4;

