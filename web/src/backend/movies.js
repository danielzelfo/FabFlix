import Config from "backend/config.json";
import Axios from "axios";

export async function search_movies(movieRequest, accessToken) {
    
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

export async function get_movie(movie_id, accessToken) {
    
    const options = {
        method: "GET",
        baseURL: Config.movies.baseUrl,
        url: `${Config.movies.movie}${movie_id}`,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}
