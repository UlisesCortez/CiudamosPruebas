import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import {Navigator} from './presentation/navigator/Navigator'

//Utilizar esta forma de exportacion para evitar fallos a la hora de que la aplicacion busque. 
//Puede ser export antes del la variable o incluso despues 
export const CIUDAMOS = () => {
  return (
    <NavigationContainer>
      <Navigator />
    </NavigationContainer>
   
  );
};
export default CIUDAMOS;
