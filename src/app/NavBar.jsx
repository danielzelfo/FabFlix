import React from "react";
import {NavLink} from "react-router-dom";
import styled from "styled-components";
import {useUser} from "hook/User";
import { useNavigate } from "react-router-dom";

const StyledNav = styled.nav`
  display: flex;
  justify-content: center;
  width: calc(100% - 40px);
  height: 50px;
  position: relative;
  left: 5px;
  background-color: #fff;
`;

const StyledNavLink = styled(NavLink)`
  padding: 10px;
  font-size: 25px;
  color: #000;
  text-decoration: none;
`;


const MainNav = styled.div`
    position: relative;
    left: 50%;
    transform: translate(-50%);
    display: flex;
    justify-content: center;
    width: calc(100% - 10px);
`

const LogoutButton = styled.button`
    margin-left: 5px;
    background-color: white;
    border: 1px solid black;
    border-radius: 7.5px;
    max-width: 40px;
    &:hover {
        background-color: black;
        color: white;
    }
`

const NavBar = () => {
    const navigate = useNavigate();

    const {
        accessToken, setAccessToken
    } = useUser();

    const logoutUser = () => {
        setAccessToken(null);
        navigate("/login");
    }

    return (
        <MainNav>
            <StyledNav>
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
            </StyledNav>
            {!!accessToken && 
                <LogoutButton onClick={logoutUser}>log out</LogoutButton>
            }
        </MainNav>
    );
}

export default NavBar;
