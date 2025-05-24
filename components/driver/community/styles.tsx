import { Colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

export const CommunityStyles = StyleSheet.create({
    postsContainer: {
        width: "96%",
        alignSelf: "center"
    },
    container: {
        width: '100%',
        backgroundColor: Colors.background,
        borderRadius: 8,
        overflow: 'hidden',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0E0E0',
    },
    userInfo: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    star: {
        fontSize: 16,
        marginRight: 2,
    },
    filledStar: {
        color: Colors.primary,
    },
    emptyStar: {
        color: Colors.primary,
        opacity: 0.5,
    },
    ratingText: {
        marginLeft: 4,
        color: Colors.primary
    },
    bioContainer: {
        marginBottom: 12,
    },
    bioText: {
        // lineHeight: 20,
        color: 'white',
    },
    hashtagText: {
        color: Colors.primary,
        fontWeight: '500',
    },
    contentImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        marginVertical: 12,
        backgroundColor: '#E0E0E0',
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    actionText: {
        marginLeft: 6,
        color: 'white',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: 16,
    }
});

export const SearchbarStyles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#353f3b',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 50,
        borderWidth: 1,
        borderColor: "#fff"
    },
    searchIcon: {
        marginRight: 10,
        padding: 5,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        height: '100%',
        fontFamily: "MontserratSemiBold"
    },
    micIcon: {
        marginLeft: 10,
        padding: 5,
    },
})

export const POSTS = [
    {
        id: 1,
        userImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.76,
        fullname: "Arav Kumar",
        // image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 10,
        likeCount: 40,
        text: "Life in motion, one ride at a time. Whether it's a quick commute, chasing dreams, making memories, we're here to get you there— smoothly and safely. #helo"
    },
    {
        id: 2,
        userImage: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.9,
        fullname: "Sneha Reddy",
        image: "https://images.unsplash.com/photo-1605902711622-cfb43c4437d5?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 22,
        likeCount: 68,
        text: "Smooth rides, zero stress! Helo is my go-to for daily commutes. 🚗✨ #rideeasy"
    },
    {
        id: 3,
        userImage: "https://images.unsplash.com/photo-1614288331408-ecba4813d68a?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.5,
        fullname: "Rohan Singh",
        image: "https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 15,
        likeCount: 52,
        text: "Loved the comfort and punctuality. Best way to beat traffic in the city. #travelbetter"
    },
    {
        id: 4,
        userImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.8,
        fullname: "Neha Verma",
        image: "https://images.unsplash.com/photo-1592503254549-7b95579e9e3e?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 18,
        likeCount: 75,
        text: "Effortless bookings and always on time. Feels safe and secure with Helo. #ridesmart"
    },
    {
        id: 5,
        userImage: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.65,
        fullname: "Aman Mehra",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 12,
        likeCount: 34,
        text: "Reliable service every time. From work trips to weekend getaways, Helo has me covered."
    },
    {
        id: 6,
        userImage: "https://images.unsplash.com/photo-1589187155471-c7a98fb0c2cf?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 5.0,
        fullname: "Tanya Sharma",
        image: "https://images.unsplash.com/photo-1564869734233-e6c04e6c176f?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 30,
        likeCount: 102,
        text: "Great experience! Clean cars, courteous drivers. Helo always delivers. 🌟"
    },
    {
        id: 7,
        userImage: "https://images.unsplash.com/photo-1590080876030-f51f06fdd0f0?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.3,
        fullname: "Vikram Desai",
        image: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 8,
        likeCount: 20,
        text: "Affordable and efficient! I recommend Helo to all my colleagues. #valueforride"
    },
    {
        id: 8,
        userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.92,
        fullname: "Priya Joshi",
        image: "https://images.unsplash.com/photo-1573495628364-6fa0b8d88e3d?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 25,
        likeCount: 88,
        text: "Friendly drivers and fast support team. A+ experience all around! 🛵💨"
    },
    {
        id: 9,
        userImage: "https://images.unsplash.com/photo-1531891437562-6e16b2897c4d?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.7,
        fullname: "Kunal Agarwal",
        image: "https://images.unsplash.com/photo-1508963493744-76fce69379c0?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 16,
        likeCount: 49,
        text: "Been using Helo for months—still impressed every ride. Keep it up! #HeloWay"
    },
    {
        id: 10,
        userImage: "https://images.unsplash.com/photo-1595152772835-219674b2a8a0?ixlib=rb-4.0.3&w=1000&q=80",
        rating: 4.4,
        fullname: "Meena Iyer",
        image: "https://images.unsplash.com/photo-1532619675605-9edb4a1c9f2c?ixlib=rb-4.0.3&w=1000&q=80",
        commentCount: 9,
        likeCount: 27,
        text: "Feels like luxury at a budget price. Safe, timely, and classy. #GoHelo"
    }
];
