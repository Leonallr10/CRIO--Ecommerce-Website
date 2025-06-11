import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CreditCard, Delete } from "@mui/icons-material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import Cart, {
  generateCartItemsFrom,
  getTotalCartValue,
} from "./Cart";

import { config } from "../App";
import "./Checkout.css";

/**
 * View for adding a new address.
 */
const AddNewAddressView = ({
  newAddress,
  handleNewAddress,
  addAddress,
  cancelAdd,
}) => (
  <Box display="flex" flexDirection="column" my="1rem">
    <TextField
      multiline
      minRows={4}
      placeholder="Enter your complete address"
      value={newAddress.value}
      onChange={(e) =>
        handleNewAddress({ ...newAddress, value: e.target.value })
      }
    />
    <Stack direction="row" spacing={2} mt="0.5rem">
      <Button
        variant="contained"
        onClick={() => addAddress(newAddress.value)}
      >
        ADD
      </Button>
      <Button variant="text" onClick={cancelAdd}>
        CANCEL
      </Button>
    </Stack>
  </Box>
);

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAdding: false,
    value: "",
  });
  const [loading, setLoading] = useState(false);

  // 1. Fetch products
  const getProducts = async () => {
    try {
      const res = await axios.get(`${config.endpoint}/products`);
      setProducts(res.data);
      return res.data;
    } catch {
      enqueueSnackbar("Could not fetch products", { variant: "error" });
      return [];
    }
  };

  // 2. Fetch cart
  const getCart = async () => {
    if (!token) return [];
    try {
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartData(res.data);
      return res.data;
    } catch {
      enqueueSnackbar("Could not fetch cart details", {
        variant: "error",
      });
      return [];
    }
  };

  // 3. Fetch addresses
  const getAddresses = async () => {
    if (!token) return [];
    try {
      const res = await axios.get(
        `${config.endpoint}/user/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses((a) => ({ ...a, all: res.data }));
      return res.data;
    } catch {
      enqueueSnackbar("Could not fetch addresses", {
        variant: "error",
      });
      return [];
    }
  };

  // 4. Add a new address
  const addAddress = async (address) => {
    if (!address || address.trim().length < 20) {
      enqueueSnackbar("Address should be at least 20 characters", { variant: "warning" });
      return;
    }
    if (address.trim().length > 128) {
      enqueueSnackbar("Address should be less than 128 characters", { variant: "warning" });
      return;
    }

    try {
      const res = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: address.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Use the response (updated array) directly
      setAddresses((a) => ({ ...a, all: res.data }));
      setNewAddress({ isAdding: false, value: "" });
      enqueueSnackbar("Address added successfully", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(
        e.response?.data?.message || "Could not add address",
        { variant: "error" }
      );
    }
  };

  // 5. Delete an address
  const deleteAddress = async (addressId) => {
    try {
      const res = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses((a) => ({
        all: res.data,
        selected: a.selected === addressId ? "" : a.selected,
      }));
    } catch (e) {
      enqueueSnackbar(
        e.response?.data?.message || "Could not delete address",
        { variant: "error" }
      );
    }
  };

  // 6. Validate before checkout
  const validateRequest = () => {
    const balance = Number(localStorage.getItem("balance") || 0);
    const total = getTotalCartValue(items);

    if (balance < total) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }
    if (!addresses.all.length) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }
    if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  // 7. Perform checkout
  const performCheckout = async () => {
    if (!validateRequest()) return;
    setLoading(true);
    try {
      await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addresses.selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Deduct from wallet
      const newBalance =
        Number(localStorage.getItem("balance")) -
        getTotalCartValue(items);
      localStorage.setItem("balance", newBalance);
      enqueueSnackbar("Order placed successfully", { variant: "success" });
      history.push("/thanks");
    } catch (e) {
      enqueueSnackbar(
        e.response?.data?.message || "Could not place order",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  // On mount: check authentication and load data
  useEffect(() => {
    if (!token) {
      enqueueSnackbar("You must be logged in to access checkout", { variant: "error" });
      history.push("/login");
      return;
    }

    const load = async () => {
      const prods = await getProducts();
      const cart = await getCart();
      const cartItems = generateCartItemsFrom(cart, prods);
      setItems(cartItems);
      await getAddresses();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        {/* Shipping & Payment */}
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" p="1rem">
            <Typography variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />

           {/* Address list */}
<Box my="1rem">
  {addresses.all.length ? (
    addresses.all.map((addr) => {
      const isSelected = addresses.selected === addr._id;
      return (
        <Box
          key={addr._id}
          className={`address-item ${isSelected ? "selected" : "not-selected"}`}
          onClick={() =>
            setAddresses((a) => ({ ...a, selected: addr._id }))
          }
        >
          {/* Address text */}
          <Box flexGrow={1}>{addr.address}</Box>

          {/* DELETE button */}
          <Button
            startIcon={<Delete />}
            id="delete-btn"
            onClick={(e) => {
              e.stopPropagation();      // don’t re‐select when deleting
              deleteAddress(addr._id);
            }}
          >
            DELETE
          </Button>
        </Box>
      );
    })
  ) : (
    <Typography>
      No addresses found for this account. Please add one to proceed
    </Typography>
  )}
</Box>


            {/* Add new address or button */}
            {newAddress.isAdding ? (
              <AddNewAddressView
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
                cancelAdd={() =>
                  setNewAddress({ isAdding: false, value: "" })
                }
              />
            ) : (
              <Button
                variant="contained"
                onClick={() =>
                  setNewAddress({ isAdding: true, value: "" })
                }
              >
                Add new address
              </Button>
            )}

            {/* Payment section */}
            <Typography variant="h4" my="1rem">
              Payment
            </Typography>
            <Divider />
            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>
            <Button
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CreditCard />}
              variant="contained"
              onClick={performCheckout}
              disabled={loading}
            >
              {loading ? "PLACING ORDER..." : "PLACE ORDER"}
            </Button>
          </Box>
        </Grid>

        {/* Read‑only Cart sidebar */}
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart items={items} isReadOnly />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
