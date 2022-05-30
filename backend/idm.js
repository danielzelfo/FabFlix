// import Config from "backend/config.json";
import Axios from "axios";

// export async function login(loginRequest) {
//     const requestBody = {
//         email: loginRequest.email,
//         password: loginRequest.password
//     };

//     const options = {
//         method: "POST", // Method type ("POST", "GET", "DELETE", ect)
//         baseURL: Config.idm.baseUrl, // Base URL (localhost:8081 for example)
//         url: Config.idm.login, // Path of URL ("/login")
//         data: requestBody // Data to send in Body (The RequestBody to send)
//     }

//     return Axios.request(options);
// }


// export async function register_backend(registerRequest) {
//     const requestBody = {
//         email: registerRequest.email,
//         password: registerRequest.password
//     };

//     const options = {
//         method: "POST", // Method type ("POST", "GET", "DELETE", ect)
//         baseURL: Config.idm.baseUrl, // Base URL (localhost:8081 for example)
//         url: Config.idm.register, // Path of URL ("/register")
//         data: requestBody // Data to send in Body (The RequestBody to send)
//     }

//     return Axios.request(options);
// }

export const loginPost = async (email, password) => {
    // 10.0.2.2:8082
    return await fetch('http://akera.ddns.net:8082/login', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then((response) => response.json() )
    .then((json) => {
        console.log(json);
        return json;
    })
    .catch((error) => {
        console.error(error);
    });
};


export const registerPost = async (email, password) => {
    // alert("Email: " + email + ", password: " + password);
    // 10.0.2.2
    return await fetch('http://akera.ddns.net:8082/register', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then((response) => response.json() )
    .then((json) => {
        console.log(json);
        return json;
    })
    .catch((error) => {
        console.error(error);
    });
};
