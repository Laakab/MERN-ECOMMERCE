import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <Card className="h-100">
      {product.images?.length > 0 && (
        <Card.Img 
          variant="top" 
          src={product.images[0]} 
          alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Text>
          ${product.price.toFixed(2)}
        </Card.Text>
        <Button 
          variant="primary" 
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;