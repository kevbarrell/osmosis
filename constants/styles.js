import { StyleSheet } from 'react-native';
import colors from './colors';

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.purple,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: colors.white,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightPink,
    borderRadius: 10,
    padding: 15,
    color: colors.white,
    lineHeight: 20,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: colors.pink,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgot: {
    color: colors.lightPink,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 0,
    marginBottom: 10,
  },
  divider: {
    marginVertical: 30,
    borderBottomColor: colors.lightPink,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    justifyContent: 'center',
    marginBottom: 15,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  socialText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  text: {
    color: colors.white,
  },
  link: {
    color: colors.lightPink,
    fontWeight: 'bold',
  },

  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#ccc',
    marginBottom: 10,
  },
  photoGrid: {
  },
  photoBox: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    backgroundColor: colors.gray,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 50,
  },
  deleteX: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'black',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteXText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.lightPink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: colors.lightPink,
  },
  optionText: {
    color: colors.white,
  },
  selectedOptionText: {
    color: colors.purple,
  },
});

export default baseStyles;
