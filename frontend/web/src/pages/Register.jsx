import React, { useState }  from "react";
import {useForm} from "react-hook-form";
import {register_backend} from "backend/idm";
import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom";
import { View, Text } from "react-native";
import {AppStyles} from "style/Styles";
import {CredentialForm} from "components/CredentialForm";

const Register = () => {
    const navigate = useNavigate();

    const {control, handleSubmit} = useForm();

    const [errorMessage, setErrorMessage] = useState(["", false]);

    const submitRegister = (payLoad) => {
        if (payLoad.email === undefined) {
            setErrorMessage(["Email is required", false]);
            return;
        }
        if (payLoad.password === undefined) {
            setErrorMessage(["Password is required", false]);
            return;
        }
        
        payLoad.password = payLoad.password.split('');

        register_backend(payLoad)
            .then(response => navigate("/login"))
            .catch(error => error.response === undefined ? setErrorMessage(["Internal server error. Please try again later", false]) : setErrorMessage(error.response.data.result.code === 1011 ? [error.response.data.result.message + ". Please login ", true] : [error.response.data.result.message, false]))
    }

    return (
        <View style={AppStyles.MainDiv}>
            <Text style={AppStyles.H1Text}>Register</Text>
            <CredentialForm title="Register" onPress={handleSubmit(submitRegister)} control={control}/> 
            {!!errorMessage[0] && (
                <Text style={AppStyles.ErrorMsg}> {errorMessage[0]}{errorMessage[1]&&<Link to="/login">here</Link>}. </Text>
            )}
        </View>
    );
}

export default Register;
