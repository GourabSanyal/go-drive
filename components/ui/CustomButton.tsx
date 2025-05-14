import {
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    GestureResponderEvent,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import CustomText, { CustomTextProps } from './CustomText';

// Status-based colors
const STATUS_COLORS = {
    primary: '#00bf72',
    secondary: '#ffffff',
    danger: '#E53636',
    disabled: '#CCCCCC',
} as const;

// Size-based styles
const SIZE_STYLES = {
    small: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16 },
    large: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
} as const;

// Define status and size types based on the keys of the constants
type ButtonStatus = keyof typeof STATUS_COLORS;
type ButtonSize = keyof typeof SIZE_STYLES;

interface CustomButtonProps extends CustomTextProps {
    onPress?: (event: GestureResponderEvent) => void;
    size?: ButtonSize;
    status?: ButtonStatus;
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    onPress,
    size = 'medium',
    status = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
    fontFamily,
    fontSize,
    numberOfLines,
    variant,
    children
}) => {
    const buttonColor = disabled ? STATUS_COLORS.disabled : STATUS_COLORS[status] || STATUS_COLORS.primary;
    const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.medium;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor: buttonColor,
                    paddingVertical: sizeStyle.paddingVertical,
                    paddingHorizontal: sizeStyle.paddingHorizontal,
                },
                disabled && styles.disabled,
                style,
            ]}
            activeOpacity={1}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <CustomText
                    numberOfLines={numberOfLines}
                    fontFamily={fontFamily}
                    variant={variant}
                    fontSize={fontSize}
                    style={[styles.text, textStyle]}>
                    {children}
                </CustomText>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: "relative"
    },
    text: {
        color: '#FFFFFF',
        width: "100%",
        textTransform: 'uppercase',
        textAlign: "center"
    },
    disabled: {
        opacity: 0.6,
    },
});

export default CustomButton;