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
    const field_names = ["title", "year", "director", "genre", "limit", "page", "orderBy", "direction"];
    const default_field_values = ["", "", "", "", "10", "1", "title", "ASC"]

    const navigate = useNavigate();

    const {
        accessToken
    } = useUser();

    const {register, getValues, setValue, handleSubmit} = useForm();

    // current page response data
    const [results, resultsSetter] = useState([]);

    // current page request data
    const [pageData, pageDataSetter] = useState({});

    const handleResultSuccess = (request, response) => {
        let movies = response.data.movies;
        if (movies === undefined)
            movies = [];
        // set results to show in html
        resultsSetter(movies);
        // save the last successful request data (used by next / prev buttons)
        pageDataSetter(request);
    }

    const handlePageResultSuccess = (request, response) => {
        // set the page if the response is not empty
        if (response.data.movies !== undefined) {
            handleResultSuccess(request, response);
            for(let i = 0; i < field_names.length; ++i) {
                setValue(field_names[i], request[field_names[i]] === undefined ? default_field_values[i] : request[field_names[i]]);
            }
        }
    }

    const submitSearch = () => {
        const payLoad = {}

        for(let i = 0; i < field_names.length; ++i) {
            let value = getValues(field_names[i]);
            if (value !== "" && !(default_field_values[i] !== "" && value === default_field_values[i]))
                payLoad[field_names[i]] = value;
        }

        search_backend(payLoad, accessToken)
            .then(response => handleResultSuccess(payLoad, response))
            .catch(error => navigate("/login"))
    }

    const submitPageSearch = (targetPage) => {
        // use current page request data / change page to target page
        const payLoad = {};
        Object.assign(payLoad, pageData);
        if (targetPage !== 1)
            payLoad.page = targetPage;
        else if (payLoad.page !== undefined) 
            delete payLoad.page;
        
        search_backend(payLoad, accessToken)
            .then(response => handlePageResultSuccess(payLoad, response))
            .catch(error => navigate("/login"))
    }

    const nextPage = () => {
        // get page number from last successful request data
        let page = pageData.page;
        if (page === undefined)
            submitPageSearch(2) // undefined means page 1 (default)
        else
            submitPageSearch(page + 1)
    }
    const prevPage = () => {
        let page = pageData.page;
        if (page !== undefined && page !== 1) {
            submitPageSearch(page - 1);
        }
    }

    return (
        <MainDiv>
            <VerticalDiv style={{alignItems: "center"}}>
                <h1>Search Movie</h1>
                <HorizontalDiv style={{justifyContent: "right"}}>
                    <CustomSelect id="limit" {...register("limit")}>
                        <option value="10">Limit: 10</option>
                        <option value="25">Limit: 25</option>
                        <option value="50">Limit: 50</option>
                        <option value="100">Limit: 100</option>
                    </CustomSelect>
                    <CustomSelect id="orderBy" {...register("orderBy")}>
                        <option value="title">Sort by: title</option>
                        <option value="rating">Sort by: rating</option>
                        <option value="year">Sort by: year</option>
                    </CustomSelect>
                    <CustomSelect id="direction" {...register("direction")}>
                        <option value="ASC">Direction: ASC</option>
                        <option value="DESC">Direction: DESC</option>
                    </CustomSelect>
                </HorizontalDiv>
                <HorizontalDiv style={{justifyContent: "center"}}>
                    <CustomInput placeholder="title" {...register("title")} />
                    <CustomInput placeholder="year" {...register("year")} />
                    <CustomInput placeholder="director" {...register("director")} />
                    <CustomInput placeholder="genre" {...register("genre")} />
                    <CustomButton onClick={handleSubmit(submitSearch)}>Search</CustomButton>
                </HorizontalDiv>
                <HorizontalDiv style={{justifyContent: "right"}}>
                    <label htmlFor="page">Page</label>
                    <CustomInput id="page" type="number" min="1" placeholder="1" style={{width: "4em"}} {...register("page")}/>
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
