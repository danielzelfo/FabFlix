import Axios from "axios";

export async function search_movies(movieRequest, accessToken) {
    const options = {
        method: "GET",
        baseURL: "http://akera.ddns.net:8083",
        url: "/movie/search",
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
        baseURL: "http://akera.ddns.net:8083",
        url: `/movie/${movie_id}`,
        headers: {
            Authorization: "Bearer " + accessToken
        }
    }

    return Axios.request(options);
}
