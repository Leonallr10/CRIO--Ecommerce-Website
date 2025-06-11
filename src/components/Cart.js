import React from "react";
import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useHistory } from "react-router-dom";
import "./Cart.css";

/**
 * Combine minimal cartData with full productsData.
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData || !productsData) return [];
  return cartData.map((ci) => {
    const prod = productsData.find((p) => p._id === ci.productId);
    return {
      name: prod.name,
      category: prod.category,
      cost: prod.cost,
      rating: prod.rating,
      image: prod.image,
      productId: ci.productId,
      qty: ci.qty,
    };
  });
};

/**
 * Get the total value of all products in the cart
 */
export const getTotalCartValue = (items = []) =>
  items.reduce((sum, { cost, qty }) => sum + cost * qty, 0);

/**
 * Return the sum of quantities of all products added to the cart
 */
export const getTotalItems = (items = []) =>
  items.reduce((total, { qty }) => total + qty, 0);

/**
 * + / – controls component.
 */
const ItemQuantity = ({ value, handleAdd, handleDelete }) => (
  <Stack direction="row" alignItems="center">
    <IconButton size="small" color="primary" onClick={handleDelete}>
      <RemoveOutlined />
    </IconButton>
    <Box padding="0.5rem" data-testid="item-qty">
      {value}
    </Box>
    <IconButton size="small" color="primary" onClick={handleAdd}>
      <AddOutlined />
    </IconButton>
  </Stack>
);

/**
 * Cart sidebar.
 *
 * @param {Array.<CartItem>} items
 * @param {Function} handleQuantity
 * @param {Boolean} isReadOnly
 */
const Cart = ({
  items = [],
  handleQuantity = () => {},
  isReadOnly = false,
}) => {
  const history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <Box className="cart">
      {items.map((item) => (
        <Box
          display="flex"
          alignItems="flex-start"
          padding="1rem"
          key={item.productId}
        >
          <Box className="image-container">
            <img
              src={item.image}
              alt={item.name}
              width="100%"
              height="100%"
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="6rem"
            paddingX="1rem"
            flexGrow={1}
          >
            <div>{item.name}</div>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {isReadOnly ? (
                <Typography data-testid="item-qty">
                  Qty: {item.qty}
                </Typography>
              ) : (
                <ItemQuantity
                  value={item.qty}
                  handleAdd={() =>
                    handleQuantity(item.productId, item.qty + 1)
                  }
                  handleDelete={() =>
                    handleQuantity(item.productId, item.qty - 1)
                  }
                />
              )}
              <Box padding="0.5rem" fontWeight="700">
                ${item.cost}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}

      {isReadOnly && (
        <Box padding="1rem" mt="1rem" borderTop="1px solid #ccc">
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>
          <Box display="flex" justifyContent="space-between" my="0.5rem">
            <Typography>Products</Typography>
            <Typography>{getTotalItems(items)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" my="0.5rem">
            <Typography>Total Products Price</Typography>
            <Typography>${getTotalCartValue(items)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" my="0.5rem">
            <Typography>Shipping Charges</Typography>
            <Typography>$0</Typography>
          </Box>
          <Divider />
          <Box display="flex" justifyContent="space-between" mt="0.5rem">
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h6">
              ${getTotalCartValue(items)}
            </Typography>
          </Box>
        </Box>
      )}

      {!isReadOnly && (
        <>
          {/* Order total in non‐readonly mode */}
          <Box
            padding="1rem"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box color="#3C3C3C">Order total</Box>
            <Box
              data-testid="cart-total"
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
            >
              ${getTotalCartValue(items)}
            </Box>
          </Box>
          {/* Checkout button */}
          <Box display="flex" justifyContent="flex-end" className="cart-footer">
            <Button
              color="primary"
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={() => history.push("/checkout")}
              className="checkout-btn"
            >
              Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Cart;
