import { View, Text, TextInput, NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'
import { LocationPickerStyles as styles } from './styles'
import { CommonStyles } from '../styles'
import CustomButton from '../../ui/CustomButton'
import { Info, Spline } from 'lucide-react-native'
import { Colors } from '@/theme/colors'
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated'
import CustomText from '../../ui/CustomText'
import { useState } from 'react'
import { useRouter } from 'expo-router'

export default function LocationPicker() {
    const router = useRouter()
    const [enRouteLocation, setEnRouteLocation] = useState("")
    const [destination, setDestination] = useState("")

    const handleEnRouteLocation = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setEnRouteLocation(e.nativeEvent.text)
    }
    const handleDestination = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setDestination(e.nativeEvent.text)
    }

    const keyboard = useAnimatedKeyboard()
    const animatedKeyboardStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -keyboard.height.value }]
    }))

    return (
        <Animated.View style={[styles.container, styles.border, animatedKeyboardStyle]}>
            <View style={[styles.enterLocationContainer, styles.border]}>
                <View style={styles.iconContainer}>
                    <Spline
                        size={36}
                        color={Colors.primary}
                        style={CommonStyles.spline}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChange={handleEnRouteLocation}
                        placeholderTextColor="#fff"
                        placeholder='Enter en-route location'
                        style={styles.input}
                    />
                    <TextInput
                        onChange={handleDestination}
                        placeholderTextColor="#fff"
                        placeholder='Enter destination'
                        style={styles.input}
                    />
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <CustomButton
                    // TODO: Delete later
                    onPress={() => router.push("/driver/(home)/search-location")}
                    size='small'
                    variant='h8'>
                    push alert for en-route
                    <CustomText>→</CustomText>
                </CustomButton>
                <Info color={Colors.primary} />
            </View>
        </Animated.View>
    )
}