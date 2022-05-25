import React, { createContext, useState, useContext, useEffect } from "react";
import {get_cart, add_to_cart, update_cart, clear_cart, delete_cart_item} from "backend/billing";
import {useUser} from "hook/User";

const localStorage = require("local-storage");

const CartContext = createContext({});

export const CartProvider = ({children}) => {
    const {accessToken} = useUser();

    const [cartData, cartDataSetter] = useState({total: 0, items: []});

    const setCartData = (cart) => {
        cartDataSetter(cart);
        localStorage.set("cart_data", cart);
    };

    const clearCartLocal = () => {
        setCartData({total: 0, items: []});
    }

    const clearCart = () => {
        clearCartLocal();
        clear_cart(accessToken);
    }

    // set cart locally
    const setCartDataResponse = (cartResponse) => {
        if (cartResponse.result.code === 3004) {
            // cart empty
            clearCartLocal();
            return
        }
        
        setCartData({
            total: cartResponse.total,
            items: cartResponse.items
        });
    };

    // get cart from server
    async function downloadCart () {
        const response = await get_cart(accessToken);
        setCartDataResponse(response.data);
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

    async function updateCart (movieId, quantity) {
        const payLoad = {
            movieId: movieId,
            quantity: quantity
        }

        const localMovie = getMovieFromCart(movieId, cartData);
        if (localMovie === null){
            throw(Error("Movie is not in cart."));
        }

        if (quantity === 0) {
            await delete_cart_item(movieId, accessToken);
        } else {
            try {
                await update_cart(payLoad, accessToken);
                
            } catch (err) {
                if (err.response.data.result.code === 3001)
                    throw(Error("New quantity (" + (payLoad.quantity) + ") is more than the maximum quantity."));
                
                // if the cart is outdated, download and throw error
                await downloadCart();
                throw(Error("Failed to update cart."));
            }
        }
        downloadCart();
    }

    //update cart on accessToken change
    useEffect(() => {
        if (accessToken !== null)
            downloadCart()
    } , [accessToken]);

    const value = {
        cartData, addToCart, clearCart, updateCart, clearCartLocal
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
