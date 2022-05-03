import React, { useState }  from "react";
import styled from "styled-components";
import {useForm} from "react-hook-form";
import {search_backend} from "backend/movies";
import {useUser} from "hook/User";
import { useNavigate } from "react-router-dom";

const MainDiv = styled.div`
  width: calc(100% - 50px);
`

const VerticalDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const HorizontalDiv = styled.div`
    display:flex; 
    flex-direction: row;
    gap: 5px;
    width: 100%;
`

const ResultTable = styled.div`
    margin-top: 50px;
	display: table;
    box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
    width: 100%;
`

const ResultRow = styled.div`
	display: table-row;
    div:nth-child(1) {
        width: 60%;
    }
    div:nth-child(2), div:nth-child(3) {
        width: 20%;
    }
`

const ResultCell = styled.div`
	border: 1px solid #eee;
	display: table-cell;
	padding: 3px 10px;
    p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

const ResultBody = styled.div`
	display: table-row-group;
`

const CustomButton = styled.button`
    background-color: white;
    border: 1px solid black;
    border-radius: 7.5px;
    padding: 2.5px;
    padding-left: 10px;
    padding-right: 10px;
    &:hover {
        background-color: black;
        color: white;
    }
`

const CustomSelect = styled.select`
    background-color: white;
    border: 1px solid black;
    border-radius: 7.5px;
    padding: 2.5px;
    padding-left: 10px;
    padding-right: 10px;
`

const CustomInput = styled.input`
    background-color: white;
    border: 1px solid black;
    border-radius: 7.5px;
    padding: 2.5px;
    padding-left: 10px;
    padding-right: 10px;
    outline: none;
`

const TableHeaderCellP = styled.p`
    font-weight: bold;
    text-align: center;
`


const SearchMovie = () => {
    const navigate = useNavigate();

    const {
        accessToken, setAccessToken,
        refreshToken, setRefreshToken
    } = useUser();

    const {register, getValues, setValue, handleSubmit} = useForm();

    // current page response data
    const [results, resultsSetter] = useState([]);

    // current page request data
    const [pageData, pageDataSetter] = useState({});

    const handleResultSuccess = (request, response) => {
        let movies = response.data["movies"];
        if (movies === undefined)
            movies = [];
        // set results to show in html
        resultsSetter(movies);
        // save the last successful request data (used by next / prev buttons)
        pageDataSetter(request);
    }

    const handlePageResultSuccess = (request, response) => {
        // set the page if the response is not empty
        if (response.data["movies"] !== undefined) {
            handleResultSuccess(request, response);
            setValue("movie_title", request.title === undefined ? "" : request.title);
            setValue("movie_year", request.year === undefined ? "" : request.year.toString());
            setValue("movie_director", request.director === undefined ? "" : request.director);
            setValue("movie_genre", request.genre === undefined ? "" : request.genre);
            setValue("filter_limit", request.limit === undefined ? "10" : request.limit.toString());
            setValue("filter_page", request.page === undefined ? "" : request.page.toString()); // (checking just incase)
            setValue("filter_orderBy", request.orderBy === undefined ? "title" : request.orderBy);
            setValue("filter_direction", request.direction === undefined ? "ASC" : request.direction);
        }
    }

    const submitSearch = () => {
        const payLoad = {}

        const defaultLimit = "10";
        const defaultPage = "1";
        const defaultOrderBy = "title";
        const defaultDirection = "ASC";

        const movie_title = getValues("movie_title");
        const movie_year = getValues("movie_year");
        const movie_director = getValues("movie_director");
        const movie_genre = getValues("movie_genre");
        const filter_limit = getValues("filter_limit");
        const filter_page = getValues("filter_page");
        const filter_orderBy = getValues("filter_orderBy");
        const filter_direction = getValues("filter_direction");

        if (movie_title !== "")
            payLoad.title = movie_title;
        if (movie_year !== "")
            payLoad.year = parseInt(movie_year);
        if (movie_director !== "")
            payLoad.director = movie_director;
        if (movie_genre !== "")
            payLoad.genre = movie_genre;
        if (filter_limit !== defaultLimit)
            payLoad.limit = parseInt(filter_limit);
        if (filter_page !== "" && filter_page !== defaultPage)
            payLoad.page = parseInt(filter_page);
        if (filter_orderBy !== defaultOrderBy)
            payLoad.orderBy = filter_orderBy;
        if (filter_direction !== defaultDirection)
            payLoad.direction = filter_direction;


        search_backend(payLoad, accessToken)
            .then(response => handleResultSuccess(payLoad, response))
            // .catch(error => navigate("/login"))
    }

    const submitPageSearch = (targetPage) => {
        // use current page request data / change page to target page
        const payLoad = pageData;
        payLoad["page"] = targetPage;
        search_backend(payLoad, accessToken)
            .then(response => handlePageResultSuccess(payLoad, response))
            // .catch(error => navigate("/login"))
    }

    const nextPage = () => {
        // get page number from last successful request data
        let page = pageData["page"];
        if (page === undefined)
            submitPageSearch(2) // undefined means page 1 (default)
        else
            submitPageSearch(page + 1)
    }
    const prevPage = () => {
        let page = pageData["page"];
        if (page !== undefined && page !== 1) {
            submitPageSearch(page - 1);
        }
    }

    return (
        <MainDiv>
            <VerticalDiv style={{alignItems: "center"}}>
                <h1>Search Movie</h1>
                <HorizontalDiv style={{justifyContent: "right"}}>
                    <CustomSelect id="filter_limit" {...register("filter_limit")}>
                        <option value="10">Limit: 10</option>
                        <option value="25">Limit: 25</option>
                        <option value="50">Limit: 50</option>
                        <option value="100">Limit: 100</option>
                    </CustomSelect>
                    <CustomSelect id="filter_orderBy" {...register("filter_orderBy")}>
                        <option value="title">Sort by: title</option>
                        <option value="rating">Sort by: rating</option>
                        <option value="year">Sort by: year</option>
                    </CustomSelect>
                    <CustomSelect id="filter_direction" {...register("filter_direction")}>
                        <option value="ASC">Direction: ASC</option>
                        <option value="DESC">Direction: DESC</option>
                    </CustomSelect>
                </HorizontalDiv>
                <HorizontalDiv style={{justifyContent: "center"}}>
                    <CustomInput placeholder="title" {...register("movie_title")} />
                    <CustomInput placeholder="year" {...register("movie_year")} />
                    <CustomInput placeholder="director" {...register("movie_director")} />
                    <CustomInput placeholder="genre" {...register("movie_genre")} />
                    <CustomButton onClick={handleSubmit(submitSearch)}>Search</CustomButton>
                </HorizontalDiv>
                <HorizontalDiv style={{justifyContent: "right"}}>
                    <label htmlFor="filter_page">Page</label>
                    <CustomInput id="filter_page" type="number" min="1" placeholder="1" style={{width: "4em"}} {...register("filter_page")}/>
                </HorizontalDiv>
            </VerticalDiv>
            
            {
            results.length > 0 ?
                <div>
                    <ResultTable>
                        <ResultBody>
                            <ResultRow>
                                <ResultCell><TableHeaderCellP>Title</TableHeaderCellP></ResultCell>
                                <ResultCell><TableHeaderCellP>Year</TableHeaderCellP></ResultCell>
                                <ResultCell><TableHeaderCellP>Director</TableHeaderCellP></ResultCell>
                            </ResultRow>
                        {
                        results.map( result =>
                            <ResultRow key={result.id}>
                                <ResultCell><p>{result.title}</p></ResultCell>
                                <ResultCell><p>{result.year}</p></ResultCell>
                                <ResultCell><p>{result.director}</p></ResultCell>
                            </ResultRow>
                        )
                        }
                        </ResultBody>
                    </ResultTable>
                    <HorizontalDiv style={{marginTop: "50px", justifyContent: "center"}}>
                        <CustomButton onClick={prevPage}>prev</CustomButton>
                        <CustomButton onClick={nextPage}>next</CustomButton>
                    </HorizontalDiv>
                </div>
            :
                <ResultTable>
                    <ResultBody>
                        <ResultRow>
                            <ResultCell >
                                <p style={{textAlign: "center"}}>No results</p>
                            </ResultCell>
                        </ResultRow>
                    </ResultBody>
                </ResultTable>
            }
            
        </MainDiv>
        
    );
}

export default SearchMovie;
