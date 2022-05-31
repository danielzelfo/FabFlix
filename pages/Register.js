import React, { Component } from 'react';
import { Button, TextInput, StyleSheet, View } from 'react-native';
import { registerRequest } from '../backend/idm';

const RegisterScreen = ({ route, navigation }) => {
  const [email, onChangeEmail] = React.useState(null);
  const [password, onChangePassword] = React.useState(null);
  const [passwordRe, onChangePasswordRe] = React.useState(null);

  const handleRegisterError = (error) => {
    if (error.result.code === 1011)
      alert(error.result.message + ". Please login.")
    else
      alert(error.result.message)
  }

  return (
    <View style={styles.container}>
    <View>
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
      <TextInput
        style={styles.input}
        onChangeText={onChangePasswordRe}
        value={passwordRe}
        placeholder="Password again"
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
                .then(response => navigation.navigate("Login"))
                .catch(error => {console.log(error); handleRegisterError(error.response.data)})

            }
          }
          title="SIGN UP"
          color="#841584"
        />
      </View>
    </View>
    </View>
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default RegisterScreen;