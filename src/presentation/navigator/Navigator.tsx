import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../screens/LoginScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';
import ReportScreen from '../../screens/ReportScreen';
import MenuScreen from '../../screens/MenuScreen';

const Stack = createStackNavigator();

export const Navigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name = "Login" component = {LoginScreen} />
      <Stack.Screen name= "Welcome" component={WelcomeScreen}/>
      <Stack.Screen name= "Report" component={ReportScreen}/>
      <Stack.Screen name="Menu" component={MenuScreen} options={{
        presentation: 'transparentModal', 
        cardStyle: { backgroundColor: 'transparent' },
        animation: 'none', 
      }}/>
    </Stack.Navigator>
  );
};
export default Navigator;
