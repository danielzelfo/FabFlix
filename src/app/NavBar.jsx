import React from "react";
import {NavLink} from "react-router-dom";
import styled from "styled-components";
import {useUser} from "hook/User";
import { useNavigate } from "react-router-dom";
import { AppStyles } from "style/Styles";
import { View, Button } from "react-native";

const StyledNavLink = styled(NavLink)`
  padding: 10px;
  font-size: 25px;
  color: #000;
  text-decoration: none;
`;

const NavBar = () => {
    const navigate = useNavigate();

    const {
        accessToken, setAccessToken
    } = useUser();

    const logoutUser = () => {
        navigate("/login");
        setAccessToken(null);
    }

    return (
        <View style={AppStyles.MainNav}>
            <View style={AppStyles.StyledNav}>
                {!!accessToken && 
                    <StyledNavLink to="/">
                        Home
                    </StyledNavLink>
                }
                {!accessToken && 
                    <StyledNavLink to="/login">
                        Login
                    </StyledNavLink>
                }
                {!accessToken && 
                    <StyledNavLink to="/register">
                        Register
                    </StyledNavLink>
                } 
            </View>
            {!!accessToken && 
                <View style={{width: "80px"}}>
                    <Button  title="log out" onPress={logoutUser} />
                </View>
            }
        </View>
    );
}

export default NavBar;
