import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'

export default function OnboardingLayout() {
    return (
        <>
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
        </>
    )
}