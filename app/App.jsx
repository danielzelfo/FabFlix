import React from "react";
import Content from 'app/Content';
import NavBar from 'app/NavBar';
import {UserProvider} from "hook/User";
import {CartProvider} from "hook/Cart";
import { AppStyles } from "style/Styles";
import { View } from "react-native";
import "../style/App.css";

const App = () => {
    return (
        <UserProvider>
            <CartProvider>
                <View style={AppStyles.StyledDiv}>
                    <NavBar/>
                    <Content/>
                </View>
            </CartProvider>
        </UserProvider>
    );
};

export default App;
