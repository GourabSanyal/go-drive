import { Colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

export const CommonStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: Colors.background
    },
    spline: {
        transform: [{ rotate: "-45deg" }]
    },
})