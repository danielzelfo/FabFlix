import React, { useState, useEffect } from "react";
import { AppStyles } from "style/Styles";
import { View, Text } from "react-native";
import { order_complete } from "backend/billing";
import { useNavigate, useSearchParams } from "react-router-dom";
import {useUser} from "hook/User";
import {useCart} from "hook/Cart";

export const Complete = () => {

    const [searchParams] = useSearchParams();
    
    const {accessToken} = useUser();

    const {clearCartLocal} = useCart();
  
    const navigate = useNavigate();

    const [message, setMessage] = useState("Please wait...");

    const completeOrder = (response) => {
        clearCartLocal();
        setMessage(response.data.result.message);
    }

    useEffect(() => {
        const paymentIntent = searchParams.get("payment_intent");
        if (paymentIntent === null) {
            navigate("/checkout");
            return;
        }
        order_complete(accessToken, paymentIntent)
            .then((response) => completeOrder(response));
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={AppStyles.MainDiv}>
            <Text>{message}</Text>
        </View>
    );
}