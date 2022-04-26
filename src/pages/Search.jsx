import React from "react";
import {useUser} from "hook/User";
import styled from "styled-components";
import {useForm} from "react-hook-form";
import {search_backend} from "backend/movies";


const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledH1 = styled.h1`
`

const StyledInput = styled.input`
`

const StyledButton = styled.button`
`

const Search = () => {


    const {register, getValues, handleSubmit} = useForm();

    const submitSearch = () => {
        const movie_title = getValues("movie_title");

        const payLoad = {
            movie_title: movie_title
        }

        search_backend(payLoad)
            .then(response => alert(JSON.stringify(response.data, null, 2)))
            .catch(error => alert(JSON.stringify(error.response.data, null, 2)))
    }

    return (
        <StyledDiv>
            <h1>Search</h1>
            <input {...register("movie_title")} placeholder="movie title"/>
            <button onClick={handleSubmit(submitSearch)}>Search</button>
        </StyledDiv>
    );
}

export default Search;
