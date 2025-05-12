import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { Colors } from '@/theme/colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@/components/common/Header'

export default function HomeLayout() {
    return (
        <>
            <SafeAreaView />
            <Header />
            <StatusBar
                backgroundColor={Colors.background}
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
        </>
    )
}