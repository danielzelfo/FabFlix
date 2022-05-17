import React from "react";
import Content from 'app/Content';
import NavBar from 'app/NavBar';
import {UserProvider} from "hook/User";
import { AppStyles } from "style/Styles";
import { View } from "react-native";

const App = () => {
    return (
        <UserProvider>
            <View style={AppStyles.StyledDiv}>
                <NavBar/>
                <Content/>
            </View>
        </UserProvider>
    );
};

export default App;
