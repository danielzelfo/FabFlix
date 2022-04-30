import Config from "backend/config.json";
import Axios from "axios";

export async function search_backend(movieRequest, accessToken) {
    
    const options = {
        method: "GET",
        baseURL: Config.movies.baseUrl,
        url: Config.movies.search,
        params: movieRequest,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}
