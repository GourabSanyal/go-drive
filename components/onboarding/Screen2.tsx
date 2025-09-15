import { Image, TouchableOpacity, View } from 'react-native';
import { commonOnboardStyles } from './styles';
import NextIcon from '@/assets/images/onboarding/2-next-button.svg'
import CustomText from '../ui/CustomText';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const Screen2 = () => {
    const router = useRouter()

    return (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={commonOnboardStyles.root}>
            <View style={commonOnboardStyles.imageContainer}>
                <Image
                    source={require('@/assets/images/onboarding/screen2.png')}
                    style={commonOnboardStyles.image}
                />
            </View>
            <View style={commonOnboardStyles.body}>
                <CustomText style={commonOnboardStyles.h1}>
                    Affordable Fares
                </CustomText>
                <CustomText style={commonOnboardStyles.h2}>
                    Enjoy affordable fares with upfront  {'\n'}pricing and no hidden charges
                </CustomText>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => router.push("/onboarding/screen3")}>
                    <NextIcon style={commonOnboardStyles.nextBtn} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => router.push("/auth/login")}>
                    <CustomText style={commonOnboardStyles.link}>
                        Skip
                    </CustomText>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default Screen2;

