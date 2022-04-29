import React, { useState }  from "react";
import styled from "styled-components";
import {useForm} from "react-hook-form";
import {search_backend} from "backend/movies";
import {useUser} from "hook/User";

const MainDiv = styled.div`
  width: calc(100% - 50px);
  position: relative;
`

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

const ResultsDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    > div {
        width: 20%;
        margin-top: 20px;
        box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
        border: 1px solid #fff;
    }
`

const Search = () => {
    const {
        accessToken, setAccessToken,
        refreshToken, setRefreshToken
    } = useUser();

    const {register, getValues, setValue, handleSubmit} = useForm();

    const [results, resultsSetter] = useState([]);

    const handleResultSuccess = (response) => {
        let movies = response.data["movies"];
        if (movies === undefined)
            movies = {};
        resultsSetter(movies);
    }

    const handlePageResultSuccess = (response, initPage) => {
        if (response.data["movies"] !== undefined) {
            handleResultSuccess(response);
        } else {
            setValue("filter_page", initPage);
        }
    }

    const submitSearch = () => {
        submitGeneralSearch()
            .then(response => handleResultSuccess(response))
            .catch(error => alert(JSON.stringify(error, null, 2)))
    }

    const submitPageSearch = (initPage) => {
        submitGeneralSearch()
            .then(response => handlePageResultSuccess(response, initPage))
            .catch(error => alert(JSON.stringify(error, null, 2)))
    }

    const submitGeneralSearch = () => {
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

        return search_backend(payLoad)
    }

    const nextPage = () => {
        let page = getValues("filter_page");
        if (page === "")
            page = "1";
        let initPage = page;
        setValue("filter_page", (parseInt(page)+1).toString());
        submitPageSearch(initPage)
    }
    const prevPage = () => {
        let page = getValues("filter_page");
        let initPage = page;
        if (page !== "" && page !== "1") {
            setValue("filter_page", (parseInt(page)-1).toString());
        } else {
            initPage = "1";
        }
        submitPageSearch(initPage)
    }

    return (
        <MainDiv>
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
                        <input id="filter_page" type="number" min="1" placeholder="1" {...register("filter_page")}/>
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
            {
            results.length > 0 ?
                <div>
                    <ResultsDiv>
                    {
                    results.map( result =>
                        <div key={result.id}>
                            <p>{result.title}</p>
                            <p>Year: {result.year}</p>
                            <p>Director: {result.director}</p>
                            <p>Rating: {result.rating}</p>
                        </div>
                    )
                    }
                    </ResultsDiv>
                    <HorizontalDiv style={{marginTop: "50px"}}>
                        <button onClick={prevPage}>prev</button>
                        <button onClick={nextPage}>next</button>
                    </HorizontalDiv>
                    
                </div>
            :
                <ResultsDiv>
                    <div>
                        <CenterDiv>
                            <p>No results</p>
                        </CenterDiv>
                    </div>
                </ResultsDiv>
            }
        </MainDiv>
        
    );
}

export default Search;
