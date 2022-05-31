import Axios from "axios";

export async function login(email, password) {
    
    const requestBody = {
        email: email,
        password: password
    };

    const options = {
        method: "POST",
        baseURL: "http://akera.ddns.net:8082",
        url: "/login",
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
        baseURL: "http://akera.ddns.net:8082", 
        url: "/register", 
        data: requestBody 
    }

    return Axios.request(options);
}