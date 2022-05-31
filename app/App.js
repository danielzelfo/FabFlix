import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../pages/Register';
import SearchScreen from '../pages/Search';
import LoginScreen from '../pages/Login';
import {UserProvider} from "../hook/User";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'FabFlix' }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default MyStack;