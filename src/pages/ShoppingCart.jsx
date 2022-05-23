import React, { useState, useEffect }  from "react";
import { AppStyles } from "style/Styles";
import { View, Image, Text } from "react-native";
import {useUser} from "hook/User";
import {get_cart} from "backend/billing";

const ShoppingCart = () => {

    const {accessToken} = useUser();

    const [cartData, cartDataSetter] = useState({});

    useEffect(() => 
        get_cart(accessToken)
            .then(response => cartDataSetter(response))
    , [accessToken, cartDataSetter]);

    return (
        <View style={AppStyles.MainDiv}>
            {!!cartData.data &&
            <View style={AppStyles.VerticalDiv}>
                {JSON.stringify(cartData.data)}

            </View>
            }
        </View>
    );
}

export default ShoppingCart;
