import { Colors } from "@/theme/colors"
import { StyleSheet, Platform } from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'

export const HeaderStyles = {
    container: {
        backgroundColor: Colors.background,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? hp(7) : hp(5),
        paddingBottom: 16,
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#353f3b"
    }
}

export const CustomSwitchStyles = StyleSheet.create({
    container: {
        borderWidth: 3,
        borderColor: "#fff",
        height: 21,
        width: 56,
        borderRadius: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 6,
        backgroundColor: Colors.primary
    },
    car: {
        width: 14,
        height: 13
    },
    circle: {
        width: 14,
        height: 14,
        borderWidth: 3,
        borderColor: "#fff",
        borderRadius: "100%",
        backgroundColor: Colors.background
    }
})