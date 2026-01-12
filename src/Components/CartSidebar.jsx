import React from 'react';
import { Offcanvas, ListGroup, Button, Badge, Form } from 'react-bootstrap';
import { FiX, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CartSidebar = ({
  show,
  onHide,
  cartItems,
  cartTotal,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout
}) => {
  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="cart-sidebar">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="d-flex align-items-center">
          <FiShoppingCart className="me-2" />
          Your Cart
          <Badge bg="primary" className="ms-2">
            {cartItems.length}
          </Badge>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <p>Your cart is empty</p>
            <Button variant="outline-primary" onClick={onHide}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ListGroup variant="flush">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListGroup.Item className="d-flex align-items-center">
                      {item.product?.images?.length > 0 ? (
                        <img
                          src={item.product.images[0].startsWith('http')
                            ? item.product.images[0]
                            : `http://localhost:5000/${item.product.images[0]}`}
                          alt={item.product.name}
                          width="60"
                          height="60"
                          className="rounded me-3 object-fit-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60';
                          }}
                        />
                      ) : (
                        <div className="rounded me-3 d-flex align-items-center justify-content-center bg-light"
                          style={{ width: '60px', height: '60px' }}>
                          <span className="text-muted">No Image</span>
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.product?.name || item.name}</h6>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
                            style={{ width: '60px' }}
                            className="me-2"
                          />
                          <span className="text-muted">
                            x ${(item.product?.price || item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <FiX />
                      </Button>
                    </ListGroup.Item>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ListGroup>

            <div className="border-top pt-3 mt-3">
              <div className="d-flex justify-content-between mb-3">
                <h5>Total:</h5>
                <h5>${cartTotal.toFixed(2)}</h5>
              </div>
              <Button
                variant="primary"
                className="w-100 py-3"
                onClick={onCheckout}
              >
                Checkout <FiArrowRight className="ms-2" />
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartSidebar;