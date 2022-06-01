import React, {useState, useEffect} from 'react';
import { Button, TextInput, StyleSheet, View, useColorScheme } from 'react-native';
import { login } from '../backend/idm';
import {useUser} from "../hook/User";

const LoginScreen = ({ navigation }) => {
    const [email, onChangeEmail] = useState(null);
    const [password, onChangePassword] = useState(null);

    const theme = useColorScheme();

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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: theme === 'light' ? '#EEEEEE' : '#222831'
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
            backgroundColor: '#EEEEEE',
            color: "#222831"
        },
    });

    return (

        <View style={styles.container}>
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
                    color="#B55400"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={() => navigation.navigate("Register")}
                    title="SIGN UP"
                    color="#393E46"
                />
            </View>
        </View>
    );
};




export default LoginScreen;