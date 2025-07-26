import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
const Header = ({ cartCount }) => (
  <header className="header">
    <div className="container">
      <Link to="/" className="logo">
        <h1>StyleShop</h1>
      </Link>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart ({cartCount})
        </Link>
      </nav>
    </div>
  </header>
);

const ProductCard = ({ product, onAddToCart }) => (
  <div className="product-card">
    <img src={product.image} alt={product.name} />
    <div className="product-info">
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
      <p className="description">{product.description}</p>
      <button 
        onClick={() => onAddToCart(product.id)}
        className="add-to-cart-btn"
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  </div>
);

const Home = () => (
  <div className="home">
    <div className="hero">
      <div className="container">
        <h2>Welcome to StyleShop</h2>
        <p>Discover the latest trends in clothing, shoes, and bags</p>
        <Link to="/products" className="cta-button">Shop Now</Link>
      </div>
    </div>
    <div className="categories">
      <div className="container">
        <h3>Shop by Category</h3>
        <div className="category-grid">
          <Link to="/products?category=clothing" className="category-card">
            <h4>Clothing</h4>
          </Link>
          <Link to="/products?category=shoes" className="category-card">
            <h4>Shoes</h4>
          </Link>
          <Link to="/products?category=bags" className="category-card">
            <h4>Bags</h4>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const Products = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products?category=${category}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products">
      <div className="container">
        <h2>Products</h2>
        <div className="filters">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedCategory('clothing')}
            className={selectedCategory === 'clothing' ? 'active' : ''}
          >
            Clothing
          </button>
          <button 
            onClick={() => setSelectedCategory('shoes')}
            className={selectedCategory === 'shoes' ? 'active' : ''}
          >
            Shoes
          </button>
          <button 
            onClick={() => setSelectedCategory('bags')}
            className={selectedCategory === 'bags' ? 'active' : ''}
          >
            Bags
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Cart = ({ cart, onUpdateCart, onRemoveFromCart, onClearCart }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: ''
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/orders', { customerInfo });
      alert('Order placed successfully!');
      onClearCart();
      setShowCheckout(false);
      setCustomerInfo({ name: '', email: '', address: '' });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <h2>Your Cart</h2>
          <p>Your cart is empty</p>
          <Link to="/products" className="continue-shopping">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h2>Your Cart</h2>
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>${item.price}</p>
              </div>
              <div className="quantity-controls">
                <button onClick={() => onUpdateCart(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onUpdateCart(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button 
                onClick={() => onRemoveFromCart(item.id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Total: ${total.toFixed(2)}</h3>
          <button onClick={() => setShowCheckout(true)} className="checkout-btn">
            Proceed to Checkout
          </button>
          <button onClick={onClearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        {showCheckout && (
          <div className="checkout-modal">
            <div className="modal-content">
              <h3>Checkout</h3>
              <form onSubmit={handleCheckout}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Shipping Address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit">Place Order</button>
                  <button type="button" onClick={() => setShowCheckout(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post('/api/cart', { productId, quantity: 1 });
      fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateCart = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="App">
        <Header cartCount={cartCount} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products onAddToCart={addToCart} />} />
            <Route path="/cart" element={
              <Cart 
                cart={cart}
                onUpdateCart={updateCart}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
