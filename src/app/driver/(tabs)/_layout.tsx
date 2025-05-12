import { StatusBar } from 'expo-status-bar'
import { Tabs } from 'expo-router'
import { Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/theme/colors'
import { Handshake, History, House, User } from 'lucide-react-native'

export default function DriverLayout() {
    return (
        <>
            <StatusBar
                backgroundColor={Colors.background}
                style='light'
            />
            <SafeAreaView style={{ flex: 1 }}>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        tabBarActiveTintColor: Colors.primary,
                        tabBarInactiveTintColor: "#fff",
                        tabBarActiveBackgroundColor: Colors.background,
                        tabBarInactiveBackgroundColor: Colors.background,
                        tabBarButton: (props) => <Pressable
                            {...props}
                            android_disableSound={true}
                            android_ripple={{
                                borderless: false,
                                radius: 0
                            }}
                        />
                    }}>
                    <Tabs.Screen
                        name='home'
                        options={{
                            title: "Home",
                            tabBarIcon: ({ color }) => <House color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name='history'
                        options={{
                            title: "History",
                            tabBarIcon: ({ color }) => <History color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name='community'
                        options={{
                            title: "Community",
                            tabBarIcon: ({ color }) => <Handshake color={color} />
                        }}
                    />
                    <Tabs.Screen
                        name='profile'
                        options={{
                            title: "Profile",
                            tabBarIcon: ({ color }) => <User color={color} />
                        }}
                    />
                </Tabs>
            </SafeAreaView>
        </>
    )
}