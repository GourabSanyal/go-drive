import { Colors } from '@/theme/colors';
import { StyleSheet, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0E22',
        paddingTop: Platform.OS === 'ios' ? hp(8) : hp(6),
        paddingLeft: wp(8),
        paddingRight: wp(8),
    },
    input: {
        paddingTop: hp(3.5),
        fontFamily: 'MontserratRegular',
        backgroundColor: '#0D0E22',
        fontSize: RFValue(16),
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(5),
        marginBottom: hp(6),
        marginTop: hp(6),
    },
    orDivider: {
        height: 1,
        backgroundColor: '#fff',
        width: '100%',
    },
    h1: {
        color: '#fff',
        fontSize: RFValue(35),
        marginBottom: hp(0.6),
        fontFamily: 'MontserratBold',
        textAlign: 'center',
    },
    h2: {
        color: '#fff',
        fontSize: RFValue(16),
        marginBottom: hp(3.5),
        fontFamily: 'MontserratRegular',
        textAlign: 'center',
    },
    h2_bold: {
        color: '#fff',
        fontSize: RFValue(18),
        marginBottom: hp(3.5),
        fontFamily: 'MontserratSemiBold',
        textAlign: 'center',
    },
    button: {
        marginBottom: hp(2.4),
        marginTop: hp(3.5),
        width: '100%',
    },
    underline: { color: Colors.primary, textDecorationLine: 'underline' },
    image: {
        width: wp(12.5),
        height: wp(12.5),
    },
    social: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: wp(7.5),
        height: 'auto',
        marginBottom: hp(3.5),
    },
    checkbox: {
        fontSize: RFValue(14),
        fontFamily: 'MontserratMedium',
    },
    modalcontainer: {
        minHeight: hp(23),
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});
