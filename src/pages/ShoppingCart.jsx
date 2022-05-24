import React from "react";
import { AppStyles } from "style/Styles";
import { View, Button } from "react-native";
import {useCart} from "hook/Cart";

const ShoppingCart = () => {
    const {cartData, clearCart} = useCart();

    return (
        <View style={AppStyles.MainDiv}>
            
            <View style={AppStyles.VerticalDiv}>
                <h1>
                {JSON.stringify(cartData)}
                </h1>
            </View>

            <Button title="Clear cart" onPress={clearCart} />
            
        </View>
    );
}

export default ShoppingCart;
