import React from "react";
import styled from "styled-components";
import {useForm} from "react-hook-form";
import {search_backend} from "backend/movies";
import {useUser} from "hook/User";

const VerticalDiv = styled.div`
  display: flex;
  flex-direction: column;
`
const HorizontalDiv = styled.div`
    justify-content: center;
    display:flex; 
    flex-direction: row;
`

const CenterDiv = styled.div`
    display: flex;
    justify-content: center;
`

const Search = () => {
    const {
        accessToken, setAccessToken,
        refreshToken, setRefreshToken
    } = useUser();

    const {register, getValues, handleSubmit} = useForm();

    const submitSearch = () => {
        const movie_title = getValues("movie_title");
        const movie_year = getValues("movie_year");
        const movie_director = getValues("movie_director");
        const movie_genre = getValues("movie_genre");
        const filter_limit = getValues("filter_limit");
        const filter_page = getValues("filter_page");
        const filter_orderBy = getValues("filter_orderBy");
        const filter_direction = getValues("filter_direction");

        const payLoad = {
            movie_title: movie_title,
            movie_year: movie_year,
            movie_director: movie_director,
            movie_genre: movie_genre,
            filter_limit: filter_limit,
            filter_page: filter_page,
            filter_orderBy: filter_orderBy,
            filter_direction: filter_direction,
            accessToken: accessToken
        }

        search_backend(payLoad)
            .then(response => alert(JSON.stringify(response, null, 2)))
            .catch(error => alert(JSON.stringify(error, null, 2)))
    }

    const yearValidation = (fieldName, fieldValue) => {
        if (isNaN(fieldValue)) {
            return `${fieldName} must be a number`;
        }
        return null;
    };

    return (
        <VerticalDiv>
            <CenterDiv><h1>Search Movie</h1></CenterDiv>
            <HorizontalDiv>
                <select id="filter_limit" {...register("filter_limit")}>
                    <option value="10">Limit: 10</option>
                    <option value="25">Limit: 25</option>
                    <option value="50">Limit: 50</option>
                    <option value="100">Limit: 100</option>
                </select>
                <HorizontalDiv>
                    <label htmlFor="filter_page">Page</label>
                    <input id="filter_page" type="number" min="1" placeholder="1" validate={yearValidation} {...register("filter_page")}/>
                </HorizontalDiv>
                <select id="filter_orderBy" {...register("filter_orderBy")}>
                    <option value="title">Sort by: title</option>
                    <option value="rating">Sort by: rating</option>
                    <option value="year">Sort by: year</option>
                </select>
                <select id="filter_direction" {...register("filter_direction")}>
                    <option value="ASC">Sort by: ASC</option>
                    <option value="DESC">Sort by: DESC</option>
                </select>
            </HorizontalDiv>
            <HorizontalDiv>
                <input placeholder="title" {...register("movie_title")} />
                <input placeholder="year" type="number" {...register("movie_year")} />
                <input placeholder="director" {...register("movie_director")} />
                <input placeholder="genre" {...register("movie_genre")} />
                <button onClick={handleSubmit(submitSearch)}>Search</button>
            </HorizontalDiv>
        </VerticalDiv>
        
    );
}

export default Search;
