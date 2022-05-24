import React, { useEffect, useState } from "react";
import { AppStyles } from "style/Styles";
import { View, Button, Text, TextInput } from "react-native";
import { useCart } from "hook/Cart";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
    const { cartData, clearCart } = useCart();
    const [ignoreCartUpdate, setIgnoreCartUpdate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!ignoreCartUpdate) {
            addCartItems();
        } else {
            setIgnoreCartUpdate(false);
        }
    }, [cartData]);

    const { updateCart } = useCart();

    const addCartItems = () => {
        reset({
            data: 'cart'
        });

        for (let i = 0; i < cartData.items.length; ++i) {
            const item = cartData.items[i];
            append(item);
        }
    }

    const { control, reset, getValues } = useForm();


    const { fields, append } = useFieldArray({
        control,
        name: "cart"
    });

    const updateQuantity = (index) => {
        const quantity = getValues(`cart.${index}.quantity`)
        const id = fields[index].movieId;
        setIgnoreCartUpdate(true);
        updateCart(id, quantity);
    }

    return (
        <View style={AppStyles.MainDiv}>
            <View style={AppStyles.HorizontalDivCart}>
                <View>
                    <View style={AppStyles.CartItems}>
                    {fields.length > 0 ?
                        fields.map((item, index) => (
                            <View style={AppStyles.CartItem} key={item.movieId}>
                                <Text style={{padding: "5px"}}>{item.movieTitle}</Text>
                                <Controller
                                    render={({ field }) =>
                                        <TextInput {...field} style={AppStyles.CartQuantity} />
                                    }
                                    name={`cart.${index}.quantity`}
                                    control={control}
                                />
                                <View style={{ width: "30px", height: "30px" }}>
                                    <Button onPress={() => updateQuantity(index)} title="✔" />
                                </View>
                            </View>
                        ))
                        :
                        <Text style={{fontSize: "20px"}}>Cart is empty</Text>
                    }
                    </View>
                    <View style={{ width: "70px", marginTop: "10px" }}>
                        <Button title="Clear" onPress={clearCart} />
                    </View>
                </View>
                <View>
                    <Text>Total: <Text>{cartData.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text></Text>
                    <Button title="Checkout" onPress={() => navigate("/checkout")} />
                </View>
            </View>
        </View>
    );


}

export default ShoppingCart;
