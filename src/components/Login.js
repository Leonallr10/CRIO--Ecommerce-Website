import React, { useState } from "react";
import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Header from "./Header";
import Footer from "./Footer";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Update the form data as the user types.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate that both username and password are provided.
  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  // Store login details in local storage.
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  // Send the login API request.
  const login = async () => {
    if (!validateInput(formData)) return;
    setLoading(true);
    try {
      const response = await axios.post(`${config.endpoint}/auth/login`, {
        username: formData.username,
        password: formData.password,
      });
      if (response.status === 201 && response.data.success) {
        persistLogin(response.data.token, response.data.username, response.data.balance);
        enqueueSnackbar("Logged in successfully", { variant: "success" });
        history.push("/"); // Redirect to products page.
      }
    } catch (error) {
      const errMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Login failed";
      enqueueSnackbar(errMsg, { variant: "error" });
    }
    setLoading(false);
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between" minHeight="100vh">
      {/* Header with back-to-explore button */}
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            id="password"
            label="Password"
            variant="outlined"
            name="password"
            type="password"
            placeholder="Enter Password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            onClick={login}
            disabled={loading}
            className="button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login to QKart"}
          </Button>
          <p className="secondary-action">
            Don’t have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
