import { Colors } from "@/theme/colors";
import { StyleSheet } from "react-native";
import { RFValue } from 'react-native-responsive-fontsize'

export const HomeStyles = StyleSheet.create({
    noRidesContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        marginTop: 20,
        backgroundColor: Colors.background,
        borderRadius: 12,
    },
    noRidesText: {
        textAlign: "center",
        fontSize: 19,
        fontWeight: "600",
        color: Colors.text,
    },
    noRidesSubText: {
        textAlign: "center",
        fontSize: 15,
        color: Colors.text,
        opacity: 0.9,
        marginTop: 8,
    },
})

export const UpcomingRideStyles = StyleSheet.create({
    container: {
        width: "90%",
        flexDirection: "column",
        alignSelf: "center",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#fff",
        overflow: "hidden"
    },
    upper: {
        height: "20%",
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    middle: {
        minHeight: "60%",
        backgroundColor: "#202a26",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    splineContainer: {
        width: "10%"
    },
    location: {
        width: "60%"
    },
    vehicleDetailsContainer: {
        width: "20%",
        alignItems: "center",
        gap: 4
    },
    vehicleType: {
        width: 38,
        height: "30%",
        backgroundColor: "#4a5350",
        borderRadius: 4,
        textAlign: "center"
    },
    bottom: {
        height: "20%",
        backgroundColor: "#202a26",
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 2,
        borderTopColor: "#fff"
    }
})

export const QuickActionGridStyles = StyleSheet.create({
    container: {
        height: "45%"
    },
    gridContainer: {
        flexDirection: "row",
        alignSelf: "center",
        padding: "3%",
        height: "50%"
    }
})

export const QuickActionCardStyles = StyleSheet.create({
    container: {
        width: "30%",
        borderRadius: 8,
        marginHorizontal: "2%",
        paddingHorizontal: 8,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
    },
    imageContainer: {
        overflow: "hidden",
        width: "85%",
        height: "50%",
        borderWidth: 2,
        borderColor: "#fff",
        borderRadius: 8,
        marginBottom: 5,
        backgroundColor: "#007646",
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        width: "90%",
        height: "90%",
        objectFit: "contain"
    },
    text: {
        height: "30%",
        textAlign: "center",
        marginHorizontal: 5,
        textTransform: "capitalize"
    }
})

export const LocationPickerStyles = StyleSheet.create({
    border: {
        borderWidth: 1,
        borderColor: "#676f6c",
        borderRadius: 16
    },
    container: {
        height: "28%",
        width: "90%",
        alignSelf: "center",
        paddingVertical: 10,
        justifyContent: "space-around",
        backgroundColor: Colors.background
    },
    enterLocationContainer: {
        height: "60%",
        width: "90%",
        alignSelf: "center",
        flexDirection: "row"
    },
    iconContainer: {
        width: "10%",
        justifyContent: "center"
    },
    inputContainer: {
        width: "90%",
        justifyContent: "center",
        paddingLeft: 5
    },
    input: {
        fontFamily: "MontserratMedium",
        color: "#fff",
        fontSize: RFValue(14)
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    }
})

export const modalStyles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: "#111",
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fff"
    },
    modalContainer: {
        height: "50%",
        width: "90%",
        alignSelf: "center",
        backgroundColor: "transparent",
    },
    userCardContainer: {
        flexDirection: "row",
        gap: 20,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        paddingVertical: 20
    },
    userImage: {
        borderRadius: 12
    },
    cardDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "gray"
    },
    btnContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingBottom: 40
    }
})

export const RideAcceptStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        position: "relative"
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingVertical: 20
    },
    handle: {
        backgroundColor: Colors.background,
        opacity: 0.9
    },
    buttons: {
        width: "100%",
        position: "absolute",
        backgroundColor: Colors.background,
        bottom: 0,
        zIndex: 10,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: "gray"
    },
    rideDetailsContainer: {
        padding: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: "#1a2521"
    },
    rideDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10
    },
    CallMsgBtnContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "gray"
    },
    CallMsgBtn: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    }
})

export const locationStyles = StyleSheet.create({
    mapContainer: {
        width: "100%",
        height: "100%",
        marginHorizontal: "auto"
    },
    map: {
        width: '100%',
        height: '100%',
    },
})

export const PaymentReceivedStyles = StyleSheet.create({
    container: {
        width: "80%",
        height: 300,
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 8,
        backgroundColor: "#1f2925",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    }
})

export const SearchLocationStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 16
    },
    card: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        overflow: 'hidden',
        flex: 1,
    },
    pillContainer: {
        backgroundColor: '#4CD964',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pillText: {
        color: Colors.background,
        fontWeight: 'bold',
        fontSize: 12,
    },
    searchContainer: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 5,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconContainer: {
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
    },
    inputText: {
        color: '#FFF',
        fontSize: 16,
    },
    placeholderText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginHorizontal: 10,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        color: '#FFF',
        fontSize: 16,
    },
    locationList: {
        flex: 1,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2C'
    },
    locationInfo: {
        marginLeft: 15,
        flex: 1,
    },
    locationName: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 4,
    },
    locationDistance: {
        color: '#8E8E93',
        fontSize: 12,
    },
    noResultsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#4CD964',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginRight: 10,
    },
})