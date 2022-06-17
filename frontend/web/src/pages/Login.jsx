import React, { useState } from "react";
import {Link} from "react-router-dom";
import {useUser} from "hook/User";
import {useForm} from "react-hook-form";
import {login} from "backend/idm";
import { useNavigate } from "react-router-dom";
import { View, Text } from "react-native";
import {AppStyles} from "style/Styles";
import {CredentialForm} from "components/CredentialForm";

const Login = () => {
    const navigate = useNavigate();

    const {
        setAccessToken, setRefreshToken
    } = useUser();

    const [errorMessage, setErrorMessage] = useState(["", false]);

    const {control, handleSubmit} = useForm();

    const handleLoginSucess = (response) => {
        navigate("/");
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
    }

    const handleLoginFail = (error) => {
        let errormsg = error.result.message;
        let errorcode = error.result.code;
        if (errorcode === 1021) {
            setErrorMessage([errormsg + ". Please register ", true]);
        } else {
            setErrorMessage([errormsg, false]);
        }
    }

    const submitLogin = (payLoad) => {
        if (payLoad.email === undefined) {
            setErrorMessage(["Email is required", false]);
            return;
        }
        if (payLoad.password === undefined) {
            setErrorMessage(["Password is required", false]);
            return;
        }
        
        payLoad.password = payLoad.password.split('');

        login(payLoad)
            .then(response => handleLoginSucess(response))
            .catch(error => error.response === undefined ? setErrorMessage(["Internal server error. Please try again later", false]) :  handleLoginFail(error.response.data))
    }

    return (
        <View style={AppStyles.MainDiv}>
            <Text style={AppStyles.H1Text}>Login</Text>
            <CredentialForm title="Login" onPress={handleSubmit(submitLogin)} control={control}/> 
            {!!errorMessage[0] && (
                <Text style={AppStyles.ErrorMsg}>{errorMessage[0]}{errorMessage[1] && <Link to="/register">here</Link>}. </Text>
            )}
        </View>
    );
}

export default Login;
