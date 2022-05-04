import React from "react";
import {Route, Routes} from "react-router-dom";
import {useUser} from "hook/User";

import SearchMovie from "pages/SearchMovie";
import Register from "pages/Register";
import Login from "pages/Login";
import Home from "pages/Home";
import styled from "styled-components";

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;

  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - 50px);
  padding: 25px;

  background: #ffffff;
  box-shadow: inset 0 3px 5px -3px #000000;
`

const Content = () => {

    const {
        accessToken
    } = useUser();

    return (
        <StyledDiv>
            <Routes>
                {!accessToken && <Route path="/register" element={<Register/>}/>}
                {!accessToken && <Route path="/login" element={<Login/>}/>}
                {!!accessToken && <Route path="/movies/search" element={<SearchMovie/>}/>}
                {!!accessToken && <Route path="/" element={<Home/>}/>}
            </Routes>
        </StyledDiv>
    );
}

export default Content;
