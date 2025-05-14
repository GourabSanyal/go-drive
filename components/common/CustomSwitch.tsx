import { Image, TouchableOpacity, View } from 'react-native'
import { CustomSwitchStyles as styles } from './styles'
import Car from "@/assets/images/car.png"
import { useState } from 'react'
import { Colors } from '@/theme/colors'

export default function CustomSwitch() {
    const [toggle, setToggle] = useState(false)

    const handleToggle = () => setToggle(!toggle)

    return (
        <TouchableOpacity
            onPress={handleToggle}
            activeOpacity={0.95}
            style={[styles.container, toggle && { backgroundColor: Colors.background }]}>
            {toggle ?
                <>
                    <View style={styles.circle} />
                    <Image
                        style={styles.car}
                        source={Car}
                    />
                </> :
                <>
                    <Image
                        style={styles.car}
                        source={Car}
                    />
                    <View style={styles.circle} />
                </>}
        </TouchableOpacity>
    )
}