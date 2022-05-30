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

export async function delete_cart_item(movieId, accessToken) {    
    const options = {
        method: "DELETE",
        baseURL: Config.billing.baseUrl,
        url: `${Config.billing.delete_cart_item}/${movieId}`,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}

export async function clear_cart(accessToken) {    
    const options = {
        method: "POST",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.clear_cart,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}

export async function order_payment(accessToken) {
    
    const options = {
        method: "GET",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.order_payment,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}

export async function order_complete(accessToken, paymentIntentId) {
    const payload = {
        paymentIntentId: paymentIntentId
    }
    const options = {
        method: "POST",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.order_complete,
        headers: {
            Authorization: "Bearer " + accessToken
        },
        data: payload
    }

    return Axios.request(options);
}

export async function order_list(accessToken) {
    const options = {
        method: "GET",
        baseURL: Config.billing.baseUrl,
        url: Config.billing.order_list,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}


export async function order_detail(accessToken, saleId) {
    const options = {
        method: "GET",
        baseURL: Config.billing.baseUrl,
        url: `${Config.billing.order_detail}/${saleId}`,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}