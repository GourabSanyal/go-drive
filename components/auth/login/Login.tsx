import { View } from "react-native";
import { CheckBox, Input, Text } from "@ui-kitten/components";
import { styles } from "../styles";
import Margin from "@/components/ui/Margin";
import CustomButton from "@/components/ui/CustomButton";
import { Colors } from "@/theme/colors";
import { useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import PhantomConnect from "./PhantomConnect";

const Login = () => {
  const router = useRouter();
  const segments = useSegments();
  const db = getFirestore();
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(true);
  const [confirm, setConfirm] = useState<any | null>(null);
  const [code, setCode] = useState("");

  async function handleSignInWithPhoneNumber(phoneNumber: string) {
    try {
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        `+91${phoneNumber}`
      );
      setConfirm(confirmation);
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Welcome Back</Text>
      <Text style={styles.h2}>
        Start your eco-friendly journey {"\n"} with us!
      </Text>
      <Input
        placeholder="Phone Number"
        size="large"
        value={value}
        style={styles.input}
        onChangeText={(nextValue: string) => setValue(nextValue)}
      />
      <View style={{ marginTop: hp(3.5) }}>
        <CheckBox
          checked={checked}
          onChange={(nextChecked: boolean) => setChecked(nextChecked)}
        >
          <Text>
            <Text style={styles.checkbox}>By signing up. you agree to the</Text>{" "}
            <Text
              style={[
                styles.checkbox,
                { textDecorationLine: "underline", color: Colors.primary },
              ]}
            >
              Terms of service
            </Text>{" "}
            and{" "}
            <Text
              style={[
                styles.checkbox,
                { textDecorationLine: "underline", color: Colors.primary },
              ]}
            >
              Privacy policy
            </Text>
            .
          </Text>
        </CheckBox>
      </View>
      <Margin margin={hp(3.5)} />
      <CustomButton
        onPress={() => {
          router.push("/auth/otp");
          handleSignInWithPhoneNumber(value);
        }}
        status="primary"
      >
        Login
      </CustomButton>
      <View style={styles.orContainer}>
        <View style={styles.orDivider} />
        <Text style={[styles.h2_bold, { marginBottom: 0 }]}>Or</Text>
        <View style={styles.orDivider} />
      </View>
      <Text style={[styles.h2_bold, { color: Colors.primary }]}>
        Log In with
      </Text>
      <View style={styles.social}>
        <PhantomConnect />
      </View>
    </View>
  );
};

export default Login;
