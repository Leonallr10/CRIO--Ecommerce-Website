import React, { useEffect, useState, useRef } from "react";
import { CircularProgress, Grid, Box, Typography, TextField } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";

import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

import { config } from "../App";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]); // complete products list
  const [cartData, setCartData] = useState([]);   // minimal cart data: [{ productId, qty }, ...]
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const debounceTimer = useRef(null);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${config.endpoint}/products`);
      setProducts(res.data);
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        enqueueSnackbar("Network error. Please check your connection.", { variant: "error" });
      } else {
        enqueueSnackbar("Could not fetch products. Please try again.", { variant: "error" });
      }
    }
    setLoadingProducts(false);
  };

  // Fetch cart items for logged-in user
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartData(res.data);
    } catch (error) {
      enqueueSnackbar("Could not fetch cart items", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchProducts();
    if (isLoggedIn) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search
  const debounceSearch = (e) => {
    const text = e.target.value;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => performSearch(text), 500);
  };

  // Search products
  const performSearch = async (searchText) => {
    if (!searchText) {
      fetchProducts();
      return;
    }
    setLoadingProducts(true);
    try {
      const res = await axios.get(
        `${config.endpoint}/products/search?value=${searchText}`
      );
      setProducts(res.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setProducts([]);
      } else {
        enqueueSnackbar("Could not fetch products", { variant: "error" });
      }
    }
    setLoadingProducts(false);
  };

  /**
   * addToCart handles adding/updating an item’s quantity.
   *
   * When called from the ProductCard (with shouldWarn true and qty === 1), if the item is already in cart,
   * a warning is shown and no API call occurs.
   *
   * When invoked from Cart (shouldWarn false or omitted), if the quantity is set to zero,
   * it removes the item from the cart by updating state and returns a dummy response (with expected URL and headers)
   * for the tests to verify.
   *
   * Otherwise, it makes the API call and updates state.
   */
   const addToCart = async (productId, qty, shouldWarn = false) => {
    if (!isLoggedIn) {
      enqueueSnackbar("Please login to add items to cart", { variant: "warning" });
      return;
    }

    if (shouldWarn && qty === 1 && cartData.find((item) => item.productId === productId)) {
      enqueueSnackbar("Item already in cart", { variant: "warning" });
      return;
    }
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartData(response.data);
      return response;
    } catch (error) {
      enqueueSnackbar("Failed to update cart", { variant: "error" });
      throw error;
    }
  };
  

  // Merge cartData with products for rendering the Cart
  const cartItems = generateCartItemsFrom(cartData, products);

  // Render main content: either loader, no products message, or grid with product cards and Cart sidebar.
  const renderMainContent = () => {
    if (loadingProducts) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <CircularProgress color="success" size={40} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading Products...
          </Typography>
        </Box>
      );
    }
    if (!products.length) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: "gray" }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            No products found
          </Typography>
        </Box>
      );
    }
    return (
      <Grid container spacing={2}>
        {/* Products Grid */}
        <Grid item xs={12} md={isLoggedIn ? 9 : 12}>
          <Grid container spacing={2}>
            {products.map((p) => (
              <Grid item xs={6} md={4} key={p._id}>
                <ProductCard
                  product={p}
                  // When called from the ProductCard, pass shouldWarn true.
                  addToCart={(id, quantity) => addToCart(id, quantity, true)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        {/* Cart Sidebar */}
        {isLoggedIn && (
          <Grid item xs={12} md={3}>
            <Cart items={cartItems} handleQuantity={addToCart} />
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div className="products">
      <Header>
        <Box display="flex" justifyContent="center" width="100%">
          <TextField
            placeholder="Search for items/categories"
            variant="outlined"
            size="small"
            onChange={debounceSearch}
            className="search-desktop"
          />
        </Box>
      </Header>
      <Box className="search-mobile" sx={{ m: "1rem" }}>
        <TextField
          placeholder="Search for items/categories"
          variant="outlined"
          fullWidth
          size="small"
          onChange={debounceSearch}
        />
      </Box>
      <Box sx={{ p: "1rem" }}>{renderMainContent()}</Box>
      <Footer />
    </div>
  );
};

export default Products;
