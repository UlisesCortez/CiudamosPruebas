import Icon from 'react-native-vector-icons/Ionicons';
  export const AirplaneIcon = () => <Icon name = "airplane-outline" size = {30}/>

  export const EyeIcon = (props: any) => (
    <Icon name="eye" size={24} color={props.color || '#000'} />
  );

  export const EyeOffIcon = (props: any) => (
    <Icon name="eye-off" size={24} color={props.color || '#000'} />
  );

  export const WarningIcon = (props: any) => (
    <Icon name="warning-outline" size={40} color={props.color || '#fff'} />
  );
  
  export const MenuIcon = (props: any) => (
    <Icon name="menu" size={40} color={"gray"} />
  );
  export default {
    EyeIcon,
    EyeOffIcon,
    WarningIcon,
    MenuIcon,
  };