import React, { createContext, useState, useContext, useEffect } from "react";
import {get_cart, add_to_cart, update_cart} from "backend/billing";
import {useUser} from "hook/User";

const localStorage = require("local-storage");

const CartContext = createContext({});

export const CartProvider = ({children}) => {
    const {accessToken} = useUser();

    const [cartData, cartDataSetter] = useState({total: 0, items: []});

    // set cart locally
    const setCartData = (cartResponse) => {
        if (cartResponse.result.code === 3004) {
            // cart empty
            cartDataSetter({total: 0, items: []});
            localStorage.set("cart_data", cartData);
            return
        }
        
        cartDataSetter({
            total: cartResponse.total,
            items: cartResponse.items
        });
        localStorage.set("cart_data", cartData);
    };

    // get cart from server
    async function downloadCart () {
        const response = await get_cart(accessToken);
        setCartData(response.data);
        return response.data;
    }

    const getMovieFromCart = (movieId, cart) => {
        for (let i = 0; i < cart.items.length; ++i) {
            if (cart.items[i].movieId === movieId) {
                return cart.items[i];
            }
        }
        return null;
    }

    async function addToCart (movieId, quantity) {
        const payLoad = {
            movieId: movieId,
            quantity: quantity
        }

        const localMovie = getMovieFromCart(movieId, cartData);
        if (localMovie !== null) {
            payLoad.quantity += localMovie.quantity;
            

            try {
                await update_cart(payLoad, accessToken);
            } catch (err) {
                if (err.response.data.result.code === 3001)
                    throw(Error("New quantity (" + (payLoad.quantity) + ") is more than the maximum quantity."));
                
                throw(Error("Failed to add to cart."));
            }
            return getMovieFromCart(movieId, await downloadCart()).quantity;
            
        } else {
            try {
                await add_to_cart(payLoad, accessToken);
                return getMovieFromCart(movieId, await downloadCart()).quantity;
            } catch(err) {
                if (err.response.data.result.code === 3002) {
                    // cart outdated

                    let cart = await downloadCart();
                    const localMovie = getMovieFromCart(movieId, cart);

                    payLoad.quantity += localMovie.quantity;
                    try {
                        await update_cart(payLoad, accessToken);
                    } catch (err) {
                        if (err.response.data.result.code === 3001)
                            throw(Error("New quantity (" + (payLoad.quantity) + ") is more than the maximum quantity."));
                        
                        throw(Error("Failed to add to cart."));
                    }
                    return getMovieFromCart(movieId, await downloadCart()).quantity;
                }
                
                if (err.response.data.result.code === 3001) {
                    throw(Error("Quantity (" + (payLoad.quantity) + ") is more than the maximum quantity."));
                }

                throw(Error("Failed to add to cart."));
            }
        }
    
    }

    //update cart on accessToken change
    useEffect(() => {
        if (accessToken !== null)
            downloadCart()
    }
    , [accessToken]);

    const value = {
        cartData, addToCart
    }

    return (
      <CartContext.Provider value={value}>
          {children}
      </CartContext.Provider>
    );
}

export const useCart = () => {
    return useContext(CartContext);
}
