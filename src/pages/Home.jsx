import React from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

const MainDiv = styled.div` 
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const MapDiv = styled.div` 
    width: 60%;
    min-width: 300px;
    margin-top: 20px;
`

const StyledH1 = styled.h1`
`

const Home = () => {
    return (
        <MainDiv>
            <h1>Home</h1>
            <MapDiv>
                <li>
                    <ol><Link to="/movies/search">Search for movies</Link></ol>
                </li>
            </MapDiv>
        </MainDiv>
    );
}

export default Home;
