import Config from "backend/config.json";
import Axios from "axios";

export async function get_cart(accessToken) {
    console.log("get_cart");
    const options = {
        method: "GET",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.get_cart,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

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