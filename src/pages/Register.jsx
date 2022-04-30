import React, { useState }  from "react";
import styled from "styled-components";
import {useForm} from "react-hook-form";
import {register_backend} from "backend/idm";
import { useNavigate } from "react-router-dom";
import {Link} from "react-router-dom";


const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 20px);
`

const RegisterForm = styled.div`
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

const Register = () => {
    const navigate = useNavigate();

    const {register, getValues, handleSubmit} = useForm();

    const [errorMessage, setErrorMessage] = useState(["", false]);

    const submitRegister = () => {
        const email = getValues("email");
        const password = getValues("password");

        const payLoad = {
            email: email,
            password: password.split('')
        }

        register_backend(payLoad)
            .then(response => navigate("/login"))
            .catch(error => setErrorMessage(error.response.data.result.code == 1011 ? [error.response.data.result.message + ". Please login ", true] : [error.response.data.result.message, false]))
    }

    return (
        <MainDiv>
            <h1>Register</h1>
            <RegisterForm>
                <input placeholder="email" type={"email"} {...register("email")} />
                <input placeholder="password" type={"password"} {...register("password")} />
                <button onClick={handleSubmit(submitRegister)}>Register</button>
            </RegisterForm>
            {errorMessage[0] && (
                <ErrorMsgP> {errorMessage[0]}{errorMessage[1]&&<Link to="/login">here</Link>}. </ErrorMsgP>
            )}
        </MainDiv>
    );
}

export default Register;
