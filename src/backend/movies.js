import Config from "backend/config.json";
import Axios from "axios";

export async function search_backend(movieRequest) {
    const defaultLimit = "10";
    const defaultPage = "1";
    const defaultOrderBy = "title";
    const defaultDirection = "ASC";

    const requestParams = {};

    if (movieRequest.movie_title !== "")
        requestParams.title = movieRequest.movie_title;
    if (movieRequest.movie_year !== "")
        requestParams.year = parseInt(movieRequest.movie_year);
    if (movieRequest.movie_director !== "")
        requestParams.director = movieRequest.movie_director;
    if (movieRequest.movie_genre !== "")
        requestParams.genre = movieRequest.movie_genre;
    if (movieRequest.filter_limit !== defaultLimit)
        requestParams.limit = parseInt(movieRequest.filter_limit);
    if (movieRequest.filter_page !== "" && movieRequest.filter_page !== defaultPage)
        requestParams.page = parseInt(movieRequest.filter_page);
    if (movieRequest.filter_orderBy !== defaultOrderBy)
        requestParams.orderBy = movieRequest.filter_orderBy;
    if (movieRequest.filter_direction !== defaultDirection)
        requestParams.direction = movieRequest.filter_direction;

    const requestHeaders = {
        Authorization: "Bearer " + movieRequest.accessToken
    }

    const options = {
        method: "GET",
        baseURL: Config.movies.baseUrl,
        url: Config.movies.search,
        params: requestParams,
        headers: requestHeaders
    }

    return Axios.request(options);
}
