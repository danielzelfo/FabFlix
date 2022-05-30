import React from 'react';
import { Button, TextInput, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import RegisterScreen from '../pages/Register';
import SearchScreen from '../pages/Search';
import { loginPost } from '../backend/idm';

const LoginScreen = ({ navigation }) => {
  const [email, onChangeEmail] = React.useState(null);
  const [password, onChangePassword] = React.useState(null);

  return (

    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeEmail}
        placeholder="Email"
        value={email}
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangePassword}
        value={password}
        placeholder="Password"
        secureTextEntry={true}
      />
      <View style={styles.buttonContainer}>
        <Button
          onPress={
            async () => {
              const result = await loginPost(email, password);
              if (result.result.code == 1020) {
                navigation.navigate("Search", { accessToken: result.accessToken, refreshToken: result.refreshToken });
              } else {
                alert("Please register first");
              }
            }
          }
          title="LOGIN"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => navigation.navigate("Register")}
          title="SIGN UP"
          color="#841584"
        />
      </View>
    </View>
  );
};

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={LoginScreen}
          options={{ title: 'FabFlix' }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    margin: 20
  },
  alternativeLayoutButtonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }, input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default MyStack;