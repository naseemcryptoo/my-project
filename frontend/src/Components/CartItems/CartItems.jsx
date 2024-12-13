import React, { useContext } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const CartItems = () => {
  const { getTotalCartAmount, all_product, cartItems, removeFromCart, addToCart } = useContext(ShopContext);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('auth-token'); // Check if the user is logged in
  const isCartEmpty = all_product.every(e => cartItems[e.id] <= 0); // Determine if cart is empty

  const handleProceedToCheckout = () => {
    if (!isLoggedIn) {
      alert('Please log in to proceed to checkout.');
      return;
    }
    navigate('/confirmorder');
  };

  return (
    <div className='cartitems'>
      {/* Page Title */}
      <header className="cart-header">
        <h1>Your Shopping Cart</h1>
        <p>Review the items in your cart before proceeding to checkout. Adjust quantities or remove items as needed.</p>
      </header>

      {/* Cart Table Header */}
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />

      {/* Cart Items */}
      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <img src={e.image} alt="" className='carticon-product' />
                <p>{e.name}</p>
                <p>TK {e.new_price}</p>

                <div className='cartitems-quantity-container'>
                  <button className='cartitems-quantity-btn' onClick={() => removeFromCart(e.id)}>-</button>
                  <span className='cartitems-quantity'>{cartItems[e.id]}</span>
                  <button className='cartitems-quantity-btn' onClick={() => addToCart(e.id)}>+</button>
                </div>

                <p>TK {e.new_price * cartItems[e.id]}</p>
                <img
                  className='cartitems-remove-icon'
                  src={remove_icon}
                  onClick={() => removeFromCart(e.id)}
                  alt="Remove"
                />
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}

      {/* Footer Section */}
      <div className="cartitems-down">
        {/* Display if the cart is empty */}
        {isCartEmpty ? (
          <div className="empty-cart-message">
            <h2>Your cart is empty!</h2>
            <p>
              Looks like you haven't added anything to your cart yet. Explore our wide range of products and start shopping!
            </p>
          </div>
        ) : (
          <div className="cartitems-total">
            <h1>Cart Totals</h1>
            <div>
              <div className="cartitems-total-item">
                <p>Subtotal</p>
                <p>TK {getTotalCartAmount()}</p>
              </div>
              <hr />
              <div className="cartitems-total-item">
                <p>Shipping Fee</p>
                <p>Free</p>
              </div>
              <hr />
              <div className="cartitems-total-item">
                <h3>Total</h3>
                <h3>TK {getTotalCartAmount()}</h3>
              </div>
            </div>
            <button 
  onClick={handleProceedToCheckout}
  disabled={isCartEmpty}
  className="checkout-btn"
>
  PROCEED TO CHECKOUT
</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItems;
