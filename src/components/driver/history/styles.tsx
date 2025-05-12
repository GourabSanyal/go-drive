import { Colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

export const HistoryStyles = StyleSheet.create({
    container: {
        height: "78%",
        width: "90%",
        alignSelf: "center",
        paddingVertical: 20,
        paddingHorizontal: 5
    },
    cardContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#353f3b",
        paddingVertical: 10
    },
    rideDetails: {
        width: "72%",
        paddingLeft: 10
    },
    fare: {
        color: Colors.primary,
        width: "17%"
    }
})

export const DATA = [
    { from: "HSR, BLR", to: "Office", vehicleType: "EV Deluxe", time: "2:05 PM, 28 Dec", fare: 132 },
    { from: "Indiranagar, BLR", to: "Airport", vehicleType: "EV Mini", time: "9:30 AM, 15 Jan", fare: 460 },
    { from: "Koramangala, BLR", to: "Mall", vehicleType: "EV SUV", time: "7:15 PM, 22 Jan", fare: 215 },
    { from: "Whitefield, BLR", to: "Tech Park", vehicleType: "EV Deluxe", time: "8:00 AM, 5 Feb", fare: 310 },
    { from: "BTM, BLR", to: "Railway Station", vehicleType: "EV Mini", time: "6:45 AM, 10 Mar", fare: 195 },
    { from: "MG Road, BLR", to: "Home", vehicleType: "EV Sedan", time: "11:50 PM, 11 Mar", fare: 280 },
    { from: "Jayanagar, BLR", to: "Hospital", vehicleType: "EV SUV", time: "1:10 PM, 12 Mar", fare: 340 },
    { from: "Marathahalli, BLR", to: "Hotel", vehicleType: "EV Mini", time: "4:25 PM, 20 Mar", fare: 245 },
    { from: "Bannerghatta, BLR", to: "Zoo", vehicleType: "EV Deluxe", time: "3:15 PM, 25 Mar", fare: 155 },
    { from: "Hebbal, BLR", to: "Airport", vehicleType: "EV Sedan", time: "10:00 AM, 1 Apr", fare: 520 },
    { from: "Rajajinagar, BLR", to: "Stadium", vehicleType: "EV SUV", time: "6:00 PM, 8 Apr", fare: 270 },
    { from: "Yelahanka, BLR", to: "Bus Stand", vehicleType: "EV Mini", time: "5:45 AM, 13 Apr", fare: 180 },
    { from: "HSR, BLR", to: "Friend's Place", vehicleType: "EV Deluxe", time: "9:30 PM, 18 Apr", fare: 200 },
    { from: "Indiranagar, BLR", to: "Cafe", vehicleType: "EV Sedan", time: "2:00 PM, 22 Apr", fare: 150 },
    { from: "Koramangala, BLR", to: "College", vehicleType: "EV Mini", time: "10:45 AM, 26 Apr", fare: 165 },
    { from: "BTM, BLR", to: "Cinema Hall", vehicleType: "EV SUV", time: "7:20 PM, 28 Apr", fare: 240 },
    { from: "Whitefield, BLR", to: "Shopping Mall", vehicleType: "EV Deluxe", time: "12:30 PM, 2 May", fare: 295 },
    { from: "MG Road, BLR", to: "Gym", vehicleType: "EV Sedan", time: "6:50 AM, 4 May", fare: 110 },
    { from: "Jayanagar, BLR", to: "Clinic", vehicleType: "EV Mini", time: "5:30 PM, 5 May", fare: 130 },
    { from: "Hebbal, BLR", to: "Resort", vehicleType: "EV SUV", time: "3:40 PM, 6 May", fare: 375 }
];