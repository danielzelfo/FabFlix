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
                {!accessToken ? 
                    //not logged in
                    <View style={AppStyles.StyledNav}>
                        <StyledNavLink to="/login"> Login </StyledNavLink>
                        <StyledNavLink to="/register"> Register </StyledNavLink>
                    </View>
                :
                    //logged in
                    <View style={AppStyles.StyledNav}>
                        <View style={AppStyles.StyledNav}>
                            <StyledNavLink to="/"> Home </StyledNavLink>
                            <StyledNavLink to="/cart"> Cart </StyledNavLink>
                            <StyledNavLink to="/order-history"> Order History </StyledNavLink>
                        </View>
                        <View style={AppStyles.LogoutButton}><Button  title="log out" onPress={logoutUser} /></View>
                    </View>
                }
            </View>
    );
}

export default NavBar;
