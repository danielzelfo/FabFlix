import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../pages/Register';
import SearchScreen from '../pages/Search';
import LoginScreen from '../pages/Login';
import MovieScreen from '../pages/Movie';
import { UserProvider } from "../hook/User";
import { useColorScheme } from 'react-native';

const Stack = createNativeStackNavigator();

const MyStack = () => {

  const theme = useColorScheme();

  const defaultOptions = {
    headerTitleStyle: { color: theme === 'light' ? '#222831' : '#EEEEEE' },
    headerStyle: { backgroundColor: theme === 'light' ? '#EEEEEE' : '#393E46' }
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'FabFlix', ...defaultOptions }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '', ...defaultOptions }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: '', ...defaultOptions }} />
          <Stack.Screen name="Movie" component={MovieScreen} options={{ title: '', ...defaultOptions }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default MyStack;