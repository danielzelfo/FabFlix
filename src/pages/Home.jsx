import React from "react";
import {Link} from "react-router-dom";
import { AppStyles } from "style/Styles";
import { View } from "react-native";

const Home = () => {
    return (
        <View style={AppStyles.MainDiv}>
            <View style={AppStyles.MapDiv}>
                <Link to="/movies/search">Search for movies</Link>
            </View>
        </View>
    );
}

export default Home;
