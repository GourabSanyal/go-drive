import { Colors } from '@/theme/colors';
import { StyleSheet } from 'react-native';

export const commonOnboardStyles = StyleSheet.create({
  imageContainer: {
    height: '50%',
    backgroundColor: Colors.primary,
  },
  root: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  h1: {
    marginTop: 25,
    color: '#fff',
    fontSize: 30,
    marginBottom: 10,
    //  fontWeight: 'bold',
    fontFamily: 'MontserratBold',
    textAlign: 'center',
  },
  h2: {
    color: '#fff', fontSize: 16, marginBottom: 30,
    // fontWeight: 300,
    fontFamily: 'MontserratMedium',
    textAlign: 'center',
  },
  button: { marginTop: 20 },
  image: {
    width: '100%',
    resizeMode: 'contain',
    aspectRatio: 1,
  },
  body: {
    height: '50%',
    backgroundColor: '#0D0E22',
    padding: 30,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  nextBtn: {
    width: 85,
    height: 85,
    textAlign: 'center',
    margin: 'auto',
  },
  link: {
    color: '#fff', fontSize: 16, marginTop: 15,
    fontFamily: 'MontserratSemiBold',
    textAlign: 'center',
    textDecorationColor: '#fff',
    textDecorationLine: 'underline',
  },
});
