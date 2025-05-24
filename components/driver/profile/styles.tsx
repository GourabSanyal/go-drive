import { Colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
    container: {
        width: "90%",
        alignSelf: "center"
    }
})

export const userCardStyles = StyleSheet.create({
    userCardContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        paddingVertical: 10
    },
    userImage: {
        borderRadius: 20
    },
    star: {
        fontSize: 22,
        marginRight: 2,
    }
})

export const vehicleDetailsStyles = StyleSheet.create({
    vehicleDetailsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10
    },
    numberPlate: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
    },
    editContainer: {
        gap: 20,
        justifyContent: "center"
    },
    editIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between"
    },
})

export const balanceCardStyles = StyleSheet.create({
    card: {
        borderRadius: 20,
        paddingVertical: 20,
        maxWidth: 550,
        borderWidth: 1,
        borderColor: '#fff',
        marginVertical: 20,
        alignSelf: "center"

    },
    balanceContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    balanceLabel: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 10,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        alignItems: 'center',
        width: '30%',
    },
    iconContainer: {
        backgroundColor: '#1f2937',
        width: 50,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
})

export const settingsMenuStyles = StyleSheet.create({
    settingsCardContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    settingsCard: {
        flexDirection: "row",
        gap: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        paddingHorizontal: 10
    }
})