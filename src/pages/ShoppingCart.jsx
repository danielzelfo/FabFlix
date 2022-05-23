import React from "react";
import { AppStyles } from "style/Styles";
import { View } from "react-native";
import {useCart} from "hook/Cart";

const ShoppingCart = () => {
    const {cartData} = useCart();

    return (
        <View style={AppStyles.MainDiv}>
            
            <View style={AppStyles.VerticalDiv}>
                <h1>
                {JSON.stringify(cartData)}
                </h1>
            </View>
            
        </View>
    );
}

export default ShoppingCart;
