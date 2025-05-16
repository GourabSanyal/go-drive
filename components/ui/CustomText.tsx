import { Colors } from '@/theme/colors'
import { FC } from 'react'
import { Text, StyleSheet } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'

export interface CustomTextProps {
    variant?: 'h0' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';
    style?: any;
    fontSize?: number;
    children: React.ReactNode;
    fontFamily?:
    | "MontserratBlack"
    | "MontserratBlackItalic"
    | "MontserratBold"
    | "MontserratBoldItalic"
    | "MontserratExtraBold"
    | "MontserratExtraBoldItalic"
    | "MontserratExtraLight"
    | "MontserratExtraLightItalic"
    | "MontserratItalic"
    | "MontserratLight"
    | "MontserratLightItalic"
    | "MontserratMedium"
    | "MontserratMediumItalic"
    | "MontserratRegular"
    | "MontserratSemiBold"
    | "MontserratSemiBoldItalic"
    | "MontserratThin"
    | "MontserratThinItalic"
    numberOfLines?: number;
}

const FONT_SIZES = {
    h0: 32,
    h1: 24,
    h2: 22,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,
    h7: 12,
    h8: 10,
    h9: 9
}

const CustomText: FC<CustomTextProps> = ({
    variant = 'h6',
    style,
    fontFamily = "MontserratSemiBold",
    fontSize,
    numberOfLines,
    children
}) => {
    return (
        <Text
            ellipsizeMode='tail'
            numberOfLines={numberOfLines ? numberOfLines : undefined}
            style={[
                styles.text, {
                    fontSize: RFValue(fontSize ? fontSize : FONT_SIZES[variant]),
                    fontFamily: fontFamily
                },
                style
            ]}>
            {children}
        </Text>
    )
}

export default CustomText

const styles = StyleSheet.create({
    text: {
        color: Colors.text,
        textAlign: "left"
    }
})
