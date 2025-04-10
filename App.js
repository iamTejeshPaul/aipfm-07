import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './app/components/SplashScreen';
import LoginScreen from './app/components/LoginScreen';
import RegisterScreen from './app/components/RegisterScreen';
import DashboardScreen from './app/components/DashboardScreen';
import DetailsEntryScreen from './app/components/DetailsEntryScreen';
import HomeScreen from './app/screens/HomeScreen';
import ReportsScreen from './app/screens/ReportsScreen';
import IncomeScreen from './app/screens/IncomeScreen';
import GoalsScreen from './app/screens/GoalsScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import HelpDeskScreen from './app/screens/HelpDeskScreen';
import WebViewScreen from "./app/screens/WebViewScreen";
import BankingScreen from "./app/screens/BankingScreen";


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="DetailsEntryScreen" component={DetailsEntryScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
        <Stack.Screen name="IncomeScreen" component={IncomeScreen} />
        <Stack.Screen name="GoalsScreen" component={GoalsScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="HelpDeskScreen" component={HelpDeskScreen} />
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen name="BankingScreen" component={BankingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
