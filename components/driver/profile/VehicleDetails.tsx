import CustomText from '@/components/ui/CustomText'
import { Pen, Plus } from 'lucide-react-native'
import { View, } from 'react-native'
import Check from "@/assets/images/profile/check.svg"
import { vehicleDetailsStyles as styles } from './styles'
import { FC } from 'react'

export interface VehicleDetailsProps {
    isVehicleNumberPlate: boolean
    vehicleName: string
    vehicleType: string
    numberplate?: string
}

const VehicleDetails: FC<VehicleDetailsProps> = ({
    isVehicleNumberPlate,
    vehicleName,
    vehicleType
}) => {
    return (
        <View style={styles.vehicleDetailsContainer}>
            <View>
                <CustomText variant='h2'>{vehicleName}</CustomText>
                <View style={styles.numberPlate}>
                    <CustomText variant='h7'>
                        Vehicle number plate
                    </CustomText>
                    {isVehicleNumberPlate && <Check width={16} height={16} />}
                </View>
                <CustomText variant='h7'>{vehicleType}</CustomText>
            </View>
            <View style={styles.editContainer}>
                <View style={styles.editIcons}>
                    <Pen color="#fff" size={20} />
                    <CustomText variant='h7'>Edit</CustomText>
                </View>
                <View style={styles.editIcons}>
                    <Plus color="#fff" />
                    <CustomText variant='h7'>Add</CustomText>
                </View>
            </View>
        </View >
    )
}

export default VehicleDetails