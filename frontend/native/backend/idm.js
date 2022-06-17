import Axios from "axios";

export async function login(email, password) {
    const requestBody = {
        email: email,
        password: password
    };

    const options = {
        method: "POST",
        baseURL: "http://10.0.2.2:8085",
        url: "idm/login",
        data: requestBody
    }

    return Axios.request(options);
}

export async function registerRequest(email, password) {
    const requestBody = {
        email: email,
        password: password
    };

    const options = {
        method: "POST",
        baseURL: "http://10.0.2.2:8085",
        url: "idm/register",
        data: requestBody
    }

    return Axios.request(options);
}