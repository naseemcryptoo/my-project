import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./ConfirmOrder.css";
import { ShopContext } from "../../Context/ShopContext";

const ConfirmOrder = () => {
  const { all_product, cartItems, getTotalCartAmount, clearCart } = useContext(ShopContext); 
  const [orderDetails, setOrderDetails] = useState({
    fullName: "",
    city: "",
    address: "",
    paymentMethod: "cash",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails({ ...orderDetails, [name]: value });
  };

  const handlePaymentMethodChange = (method) => {
    setOrderDetails({ ...orderDetails, paymentMethod: method });
  };

  const handleConfirmOrder = async () => {
    if (!orderDetails.fullName || !orderDetails.city || !orderDetails.address) {
      alert("Please fill out all fields.");
      return;
    }

    const orderItems = Object.keys(cartItems)
      .filter((itemId) => cartItems[itemId] > 0)
      .map((itemId) => {
        const product = all_product.find((product) => product.id === parseInt(itemId));
        return {
          productId: product.id,
          name: product.name,
          quantity: cartItems[itemId],
          total: product.new_price * cartItems[itemId],
        };
      });

    const response = await fetch("http://localhost:4000/confirmorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderDetails,
        items: orderItems,
      }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Order placed successfully!");
      clearCart();
      navigate("/");
    } else {
      alert("Error placing order. Please try again.");
    }
  };

  return (
    <div className="confirm-order">
      <div className="order-details">
        <h2 className="order-details-title">Confirm Your Order</h2>
        <label className="form-label">
          Full Name:
          <input
            className="form-input"
            type="text"
            name="fullName"
            value={orderDetails.fullName}
            onChange={handleChange}
          />
        </label>
        <label className="form-label">
          City:
          <input
            className="form-input"
            type="text"
            name="city"
            value={orderDetails.city}
            onChange={handleChange}
          />
        </label>
        <label className="form-label">
          Address:
          <textarea
            className="form-textarea"
            name="address"
            value={orderDetails.address}
            onChange={handleChange}
          />
        </label>
        <div className="payment-method">
          <p className="payment-method-title">Payment Method:</p>
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              checked={orderDetails.paymentMethod === "cash"}
              onChange={() => handlePaymentMethodChange("cash")}
            />
            Cash
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              checked={orderDetails.paymentMethod === "card"}
              onChange={() => handlePaymentMethodChange("card")}
            />
            Card
          </label>
        </div>
        <button className="confirm-order-button" onClick={handleConfirmOrder}>
          Confirm Order
        </button>
      </div>
      <div className="cart-summary">
        <h3 className="cart-summary-title">Your Cart</h3>
        {all_product
          .filter((product) => cartItems[product.id] > 0)
          .map((product) => (
            <div key={product.id} className="cart-item">
              <img
                src={product.image}
                alt={product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <p className="cart-item-name">{product.name}</p>
                <p className="cart-item-quantity">Quantity: {cartItems[product.id]}</p>
                <p className="cart-item-total">
                  Total: TK {product.new_price * cartItems[product.id]}
                </p>
              </div>
            </div>
          ))}
        <h4 className="cart-summary-total">
          Total Amount: TK {getTotalCartAmount()}
        </h4>
      </div>
    </div>
  );
};

export default ConfirmOrder;
