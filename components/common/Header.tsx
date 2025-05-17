import { View } from 'react-native'
import { HeaderStyles as styles } from './styles'
import Logo from "@/assets/images/logo.svg"
import CustomSwitch from './CustomSwitch';

export default function Header() {
    return (
        <View style={styles.container}>
            <Logo
                width={63}
                height={32}
            />
            <CustomSwitch />
        </View>
    )
}