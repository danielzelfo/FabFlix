import React from "react";
import {Route, Routes} from "react-router-dom";
import {useUser} from "hook/User";
import Movie from "pages/Movie";
import SearchMovie from "pages/SearchMovie";
import ShoppingCart from "pages/ShoppingCart";
import Register from "pages/Register";
import Login from "pages/Login";
import Home from "pages/Home";
import { AppStyles } from "style/Styles";
import { View } from "react-native";
import {Checkout} from "pages/Checkout";
import {Complete} from "pages/Complete"
const Content = () => {

    const {
        accessToken
    } = useUser();

    return (
        <View style={AppStyles.ContentDiv}>
            {!accessToken ? 
                //not logged in
                <Routes>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/" element={<Login/>}/>
                </Routes>
            :
                //logged in
                <Routes>
                    <Route path="/movies/search" element={<SearchMovie/>}/>
                    <Route path="/movie/:movie_id" element={<Movie/>}/>
                    <Route path="/cart" element={<ShoppingCart/>}/>
                    <Route path="/checkout" element={<Checkout/>}/>
                    <Route path="/complete" element={<Complete/>}/>
                    <Route path="/" element={<Home/>}/>
                </Routes>
            }
        </View>
    );
}

export default Content;
