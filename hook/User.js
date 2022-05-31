import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext({});

export const UserProvider = ({children}) => {
    const [accessToken, accessTokenSetter] = useState(null);
    const [refreshToken, refreshTokenSetter] = useState(null);

    useEffect(() => { 
        AsyncStorage.getItem("access_token")
            .then(res => accessTokenSetter(res));
        
        AsyncStorage.getItem("refresh_token")
            .then(res => refreshTokenSetter(res));
        
    }, []);

    const setAccessToken = (accessToken) => {
        accessTokenSetter(accessToken);
        AsyncStorage.setItem("access_token", accessToken);
    }

    const setRefreshToken = (refreshToken) => {
        refreshTokenSetter(refreshToken);
        AsyncStorage.setItem("refresh_token", refreshToken);
    }

    const value = {
        accessToken, setAccessToken,
        refreshToken, setRefreshToken
    }

    return (
      <UserContext.Provider value={value}>
          {children}
      </UserContext.Provider>
    );
}

export const useUser = () => {
    return useContext(UserContext);
}
