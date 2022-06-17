import React, { useState } from 'react';
import { Button, TextInput, StyleSheet, View, useColorScheme } from 'react-native';
import { registerRequest } from '../backend/idm';

const RegisterScreen = ({ route, navigation }) => {

  const theme = useColorScheme();

  const [email, onChangeEmail] = useState(null);
  const [password, onChangePassword] = useState(null);
  const [passwordRe, onChangePasswordRe] = useState(null);

  const handleRegisterError = (error) => {
    if (error.result === undefined) {
      alert("Internal server error. Please try again later.");
      return;
    }

    if (error.result.code === 1011)
      alert(error.result.message + ". Please login.")
    else
      alert(error.result.message)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: theme === 'light' ? '#EEEEEE' : '#222831'
    },
    buttonContainer: {
      margin: 20
    },
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      backgroundColor: "#EEEEEE",
      color: "#222831"
    },
  });

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          style={styles.input}
          onChangeText={onChangeEmail}
          placeholder="Email"
          placeholderTextColor="grey"
          value={email}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangePassword}
          value={password}
          placeholder="Password"
          placeholderTextColor="grey"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          onChangeText={onChangePasswordRe}
          value={passwordRe}
          placeholder="Password again"
          placeholderTextColor="grey"
          secureTextEntry={true}
        />
        <View style={styles.buttonContainer}>
          <Button
            onPress={
              async () => {
                if (email === null || email === "") {
                  handleRegisterError({ result: { message: "Email is required" } });
                  return;
                }
                if (password === null || password === "" || passwordRe === null || passwordRe === "") {
                  handleRegisterError({ result: { message: "Password is required" } });
                  return;
                }
                if (password !== passwordRe) {
                  handleRegisterError({ result: { message: "Two passwords should be identical!" } });
                  return;
                }

                registerRequest(email, password)
                  .then(response => {alert("Registered successfully."); navigation.navigate("Login")})
                  .catch(error => { console.log(error); handleRegisterError(error.response.data) })

              }
            }
            title="SIGN UP"
            color="#393E46"
          />
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;