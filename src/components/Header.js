// src/components/Header.js
import React from "react";
import { Button, Stack, Avatar } from "@mui/material";
import Box from "@mui/material/Box";
import { useHistory } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  // For login/register pages, show a "Back to explore" button.
  if (hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_dark.svg" alt="QKart-icon" />
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      </Box>
    );
  }

  // On Products page: when logged out, show Login and Register buttons.
  // When children is passed, it will be rendered (e.g. the search bar).
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_dark.svg" alt="QKart-icon" />
      </Box>
      {token ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src="/avatar.png" alt={username} />
          <span>{username}</span>
          <Button variant="text" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button variant="text" onClick={() => history.push("/login")}>
            Login
          </Button>
          <Button variant="contained" onClick={() => history.push("/register")}>
            Register
          </Button>
        </Stack>
      )}
      {/* Render children (search view) if provided */}
      {children}
    </Box>
  );
};

export default Header;
