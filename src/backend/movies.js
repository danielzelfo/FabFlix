import Config from "backend/config.json";
import Axios from "axios";

export async function search_backend(movieRequest) {
    const requestBody = {
        title: movieRequest.movie_title
    };

    const options = {
        method: "GET", // Method type ("POST", "GET", "DELETE", ect)
        baseURL: Config.baseUrl, // Base URL (localhost:8081 for example)
        url: Config.movies.search, // Path of URL ("/register")
        params: requestBody // Data to send in Body (The RequestBody to send)
    }

    return Axios.request(options);
}
