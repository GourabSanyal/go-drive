import CustomText from '@/components/ui/CustomText'
import { ScrollView, TouchableOpacity } from 'react-native'
import { settingsMenuStyles as styles } from './styles'
import { LogOut } from 'lucide-react-native'
import { Colors } from '@/theme/colors'
import Check from "@/assets/images/profile/check.svg"
import Settings from "@/assets/images/profile/settings.svg"
import Wallet from "@/assets/images/profile/wallet.svg"
import FAQ from "@/assets/images/profile/faq.svg"
import Note from "@/assets/images/profile/note.svg"
import Manage from "@/assets/images/profile/manage.svg"

export default function SettingsMenu() {

    const SETTINGS = [
        {
            icon: <Check width={24} height={24} />,
            title: "2-Step Verification"
        },
        {
            icon: <Settings width={24} height={24} />,
            title: "Settings"
        },
        {
            icon: <Manage width={24} height={24} />,
            title: "Manage your account"
        },
        {
            icon: <Wallet width={26} height={26} />,
            title: "Payments methods"
        },
        {
            icon: <FAQ width={28} height={28} />,
            title: "FAQs"
        },
        {
            icon: <Note width={24} height={24} />,
            title: "Privacy Policy"
        },
        {
            icon: <Note width={24} height={24} />,
            title: "Terms and condition"
        },
        {
            icon: <LogOut color={Colors.primary} />,
            title: "Logout"
        },

    ]

    return (
        <ScrollView style={styles.settingsCardContainer}>
            {SETTINGS.map((item, i) => {
                return (
                    <TouchableOpacity activeOpacity={1} key={i} style={styles.settingsCard}>
                        {item.icon}
                        <CustomText>{item.title}</CustomText>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}