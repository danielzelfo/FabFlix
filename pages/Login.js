import React, {useState} from 'react';
import { Button, TextInput, StyleSheet, View } from 'react-native';
import { login } from '../backend/idm';

const LoginScreen = ({ navigation }) => {
    const [email, onChangeEmail] = useState(null);
    const [password, onChangePassword] = useState(null);

    const handleLoginSucess = (response) => {
        navigation.navigate("Search", { accessToken: response.data.accessToken, refreshToken: response.data.refreshToken });
    }

    const handleLoginFail = (error) => {
        let errormsg = error.result.message;
        let errorcode = error.result.code;
        if (errorcode === 1021) {
            alert(errormsg + ". Please register ");
            // setErrorMessage([errormsg + ". Please register ", true]);
        } else {
            alert(errormsg);
            // setErrorMessage([errormsg, false]);
        }
    }

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
                        () => {
                            if (email === null || email === "") {
                                handleLoginFail({result: {message: "Email is required"}});
                                return;
                            }
                            if (password === null || password === "") {
                                handleLoginFail({result: {message: "Password is required"}});
                                return;
                            }
                            login(email, password)
                                .then(response => handleLoginSucess(response))
                                .catch(error => handleLoginFail(error.response.data))
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


export default LoginScreen;