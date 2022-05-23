import Config from "backend/config.json";
import Axios from "axios";

export async function get_cart(accessToken) {

    const options = {
        method: "GET",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.get_cart,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }
    // return;
    return Axios.request(options);
}

export async function add_to_cart(movieRequest, accessToken) {    
    const options = {
        method: "POST",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.add_to_cart,
        data: movieRequest,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}

export async function update_cart(movieRequest, accessToken) {    
    const options = {
        method: "POST",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.update_cart,
        data: movieRequest,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}