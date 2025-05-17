import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CustomText from '@/components/ui/CustomText';
import Withdraw from "@/assets/images/profile/withdraw.svg"
import Txn from "@/assets/images/profile/txn.svg"
import { balanceCardStyles as styles } from './styles';
import { FC } from 'react';

export interface BalanceCardProps {
    balance: number
}

const BalanceCard: FC<BalanceCardProps> = ({ balance }) => {
    return (
        <View style={styles.card}>
            <View style={styles.balanceContainer}>
                <View style={styles.balanceLabel}>
                    <CustomText variant='h7' style={{ color: "black" }}>Your balance</CustomText>
                </View>
                <CustomText variant='h2'>${balance}</CustomText>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity activeOpacity={1} style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <Withdraw width={20} height={20} />
                    </View>
                    <CustomText variant='h7'>Withdraw</CustomText>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <Txn width={20} height={20} />
                    </View>
                    <CustomText variant='h7'>Transaction</CustomText>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={1} style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <Feather name="more-vertical" size={20} color="white" />
                    </View>
                    <CustomText variant='h7'>More</CustomText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default BalanceCard