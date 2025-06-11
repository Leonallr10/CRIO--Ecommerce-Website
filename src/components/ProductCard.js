import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import "./ProductCard.css";

/**
 * ProductCard displays product details along with an "ADD TO CART" button.
 * When clicked, it calls addToCart(productId, 1, true).
 */
const ProductCard = ({ product, addToCart }) => {
  const { _id, name, cost, rating, image } = product;
  return (
    <Card className="product-card">
      <CardMedia
        component="img"
        image={image}
        alt={name}
        className="product-image"
      />
      <CardContent>
        <Typography variant="h6" component="div" className="product-name">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="product-price">
          {"$" + cost}
        </Typography>
        <Box className="product-rating" role="img" aria-label={`${rating} stars`}>
          {Array.from({ length: rating }, (_, index) => (
            <StarIcon key={index} style={{ color: "#ffb825" }} />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => addToCart(_id, 1, true)}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
