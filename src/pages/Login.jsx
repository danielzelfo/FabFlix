import React, { useState } from "react";
import {Link} from "react-router-dom";
import {useUser} from "hook/User";
import styled from "styled-components";
import {useForm} from "react-hook-form";
import {login} from "backend/idm";
import { useNavigate } from "react-router-dom";

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 20px);
`

const LoginForm = styled.div`
    display: flex;
    flex-direction: column;
    width: 30%;
    min-width: 300px;
`

const ErrorMsgP = styled.p`
    color: red;
    width: 100%;
    text-align: center;
`

const Login = () => {
    const navigate = useNavigate();

    const {
        setAccessToken, setRefreshToken
    } = useUser();

    const [errorMessage, setErrorMessage] = useState(["", false]);

    const {register, getValues, handleSubmit} = useForm();

    const handleLoginSucess = (response) => {
        setAccessToken(response.data.accessToken)
        setRefreshToken(response.data.refreshToken)
        navigate("/")
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

    const submitLogin = () => {
        const email = getValues("email");
        const password = getValues("password");

        const payLoad = {
            email: email,
            password: password.split('')
        }

        login(payLoad)
            .then(response => handleLoginSucess(response))
            .catch(error => handleLoginFail(error.response.data))
    }

    return (
        <MainDiv>
            <h1>Login</h1>
            <LoginForm>
                <input placeholder="email" type={"email"} {...register("email")} />
                <input placeholder="password" type={"password"} {...register("password")} />
                <button onClick={handleSubmit(submitLogin)}>Login</button>
            </LoginForm>
            {errorMessage[0] && (
                <ErrorMsgP> {errorMessage[0]}{errorMessage[1] && <Link to="/register">here</Link>}. </ErrorMsgP>
            )}
        </MainDiv>
    );
}

export default Login;
