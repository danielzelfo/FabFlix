import React from "react";
import {Route, Routes} from "react-router-dom";
import {useUser} from "hook/User";
import SearchMovie from "pages/SearchMovie";
import Register from "pages/Register";
import Login from "pages/Login";
import Home from "pages/Home";
import { AppStyles } from "style/Styles";
import { View } from "react-native";

const Content = () => {

    const {
        accessToken
    } = useUser();

    return (
        <View style={AppStyles.ContentDiv}>
            <Routes>
                {!accessToken && <Route path="/register" element={<Register/>}/>}
                {!accessToken && <Route path="/login" element={<Login/>}/>}
                {!!accessToken && <Route path="/movies/search" element={<SearchMovie/>}/>}
                {!accessToken ? <Route path="/" element={<Login/>}/> : <Route path="/" element={<Home/>}/>}
            </Routes>
        </View>
    );
}

export default Content;
