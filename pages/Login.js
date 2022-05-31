import React, {useState, useEffect} from 'react';
import { Button, TextInput, StyleSheet, View } from 'react-native';
import { login } from '../backend/idm';
import {useUser} from "../hook/User";

const LoginScreen = ({ navigation }) => {
    const [email, onChangeEmail] = useState(null);
    const [password, onChangePassword] = useState(null);

    const {
        accessToken, setAccessToken, setRefreshToken
    } = useUser();

    useEffect(() => {
        if (accessToken !== null)
            navigation.navigate("Search");
    }, [accessToken]);

    const handleLoginSucess = (response) => {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        navigation.navigate("Search");
    }

    const handleLoginFail = (error) => {
        let errormsg = error.result.message;
        let errorcode = error.result.code;
        if (errorcode === 1021) {
            alert(errormsg + ". Please register.");
        } else {
            alert(errormsg);
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