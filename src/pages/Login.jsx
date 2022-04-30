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

/**
 * useUser():
 * <br>
 * This is a hook we will use to keep track of our accessToken and
 * refreshToken given to use when the user calls "login".
 * <br>
 * For now, it is not being used, but we recommend setting the two tokens
 * here to the tokens you get when the user completes the login call (once
 * you are in the .then() function after calling login)
 * <br>
 * These have logic inside them to make sure the accessToken and
 * refreshToken are saved into the local storage of the web browser
 * allowing you to keep values alive even when the user leaves the website
 * <br>
 * <br>
 * useForm()
 * <br>
 * This is a library that helps us with gathering input values from our
 * users.
 * <br>
 * Whenever we make a html component that takes a value (<input>, <select>,
 * ect) we call this function in this way:
 * <pre>
 *     {...register("email")}
 * </pre>
 * Notice that we have "{}" with a function call that has "..." before it.
 * This is just a way to take all the stuff that is returned by register
 * and <i>distribute</i> it as attributes for our components. Do not worry
 * too much about the specifics of it, if you would like you can read up
 * more about it on "react-hook-form"'s documentation:
 * <br>
 * <a href="https://react-hook-form.com/">React Hook Form</a>.
 * <br>
 * Their documentation is very detailed and goes into all of these functions
 * with great examples. But to keep things simple: Whenever we have a html with
 * input we will use that function with the name associated with that input,
 * and when we want to get the value in that input we call:
 * <pre>
 * getValue("email")
 * </pre>
 * <br>
 * To Execute some function when the user asks we use:
 * <pre>
 *     handleSubmit(ourFunctionToExecute)
 * </pre>
 * This wraps our function and does some "pre-checks" before (This is useful if
 * you want to do some input validation, more of that in their documentation)
 */
const Login = () => {
    const navigate = useNavigate();

    const {
        accessToken, setAccessToken,
        refreshToken, setRefreshToken
    } = useUser();

    const [errorMessage, setErrorMessage] = useState(["", false]);

    const {register, getValues, handleSubmit} = useForm();

    const handleLoginSucess = (response) => {
        setAccessToken(response.data["accessToken"])
        setRefreshToken(response.data["refreshToken"])
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
