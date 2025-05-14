import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { PaperProvider } from 'react-native-paper';

export default function _layout() {

    const [loaded, error] = useFonts({
        "MontserratBlack": require("../assets/fonts/Montserrat-Black.ttf"),
        "MontserratBlackItalic": require("../assets/fonts/Montserrat-BlackItalic.ttf"),
        "MontserratBold": require("../assets/fonts/Montserrat-Bold.ttf"),
        "MontserratBoldItalic": require("../assets/fonts/Montserrat-BoldItalic.ttf"),
        "MontserratExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
        "MontserratExtraBoldItalic": require("../assets/fonts/Montserrat-ExtraBoldItalic.ttf"),
        "MontserratExtraLight": require("../assets/fonts/Montserrat-ExtraLight.ttf"),
        "MontserratExtraLightItalic": require("../assets/fonts/Montserrat-ExtraLightItalic.ttf"),
        "MontserratItalic": require("../assets/fonts/Montserrat-Italic.ttf"),
        "MontserratLight": require("../assets/fonts/Montserrat-Light.ttf"),
        "MontserratLightItalic": require("../assets/fonts/Montserrat-LightItalic.ttf"),
        "MontserratMedium": require("../assets/fonts/Montserrat-Medium.ttf"),
        "MontserratMediumItalic": require("../assets/fonts/Montserrat-MediumItalic.ttf"),
        "MontserratRegular": require("../assets/fonts/Montserrat-Regular.ttf"),
        "MontserratSemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
        "MontserratSemiBoldItalic": require("../assets/fonts/Montserrat-SemiBoldItalic.ttf"),
        "MontserratThin": require("../assets/fonts/Montserrat-Thin.ttf"),
        "MontserratThinItalic": require("../assets/fonts/Montserrat-ThinItalic.ttf"),
    });


    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <ApplicationProvider {...eva} theme={eva.light}>
            <PaperProvider>
                <StatusBar
                    translucent
                    style='light'
                />
                <Stack
                    screenOptions={{
                        contentStyle: {
                            backgroundColor: '#fff'
                        },
                        headerShown: false
                    }}
                />
            </PaperProvider>
        </ApplicationProvider>
    )
}