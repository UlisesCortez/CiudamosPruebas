import {Text, View} from 'react-native';
import { globalStyles } from '../../config/theme/theme';
import { ScrollView } from 'react-native-gesture-handler';


export const HomeScreens = () => {
    return (
      <View style = {[ globalStyles.mainContainer]}>
        <View style = {[globalStyles.globalMargin]}></View>
        <ScrollView>
          
        </ScrollView>
      </View>
    );
  };
  
export default HomeScreens;
  