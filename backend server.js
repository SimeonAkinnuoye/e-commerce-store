const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Sample product data with placeholder images
let products = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    category: 'clothing',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Comfortable 100% cotton t-shirt in various colors',
    stock: 50
  },
  {
    id: '2',
    name: 'Denim Jeans',
    category: 'clothing',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    description: 'Classic fit denim jeans with premium quality',
    stock: 30
  },
  {
    id: '3',
    name: 'Running Sneakers',
    category: 'shoes',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    description: 'Lightweight running shoes with excellent cushioning',
    stock: 25
  },
  {
    id: '4',
    name: 'Leather Boots',
    category: 'shoes',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop',
    description: 'Genuine leather boots for durability and style',
    stock: 15
  },
  {
    id: '5',
    name: 'Canvas Backpack',
    category: 'bags',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    description: 'Durable canvas backpack perfect for daily use',
    stock: 40
  },
  {
    id: '6',
    name: 'Leather Handbag',
    category: 'bags',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    description: 'Elegant leather handbag for professional settings',
    stock: 20
  },
  {
    id: '7',
    name: 'Summer Dress',
    category: 'clothing',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    description: 'Light and breezy summer dress for warm weather',
    stock: 35
  },
  {
    id: '8',
    name: 'Casual Loafers',
    category: 'shoes',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=400&fit=crop',
    description: 'Comfortable loafers for casual occasions',
    stock: 28
  }
];

let cart = [];
let orders = [];

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  let filteredProducts = products;
  
  if (category && category !== 'all') {
    filteredProducts = products.filter(product => product.category === category);
  }
  
  res.json(filteredProducts);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Get cart
app.get('/api/cart', (req, res) => {
  res.json(cart);
});

// Add to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: uuidv4(),
      productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }
  
  res.json({ message: 'Item added to cart', cart });
});

// Update cart item
app.put('/api/cart/:id', (req, res) => {
  const { quantity } = req.body;
  const cartItem = cart.find(item => item.id === req.params.id);
  
  if (!cartItem) {
    return res.status(404).json({ message: 'Cart item not found' });
  }
  
  cartItem.quantity = quantity;
  res.json({ message: 'Cart updated', cart });
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
  cart = cart.filter(item => item.id !== req.params.id);
  res.json({ message: 'Item removed from cart', cart });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  cart = [];
  res.json({ message: 'Cart cleared' });
});

// Place order
app.post('/api/orders', (req, res) => {
  const { customerInfo } = req.body;
  
  if (cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  
  const order = {
    id: uuidv4(),
    items: [...cart],
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    customerInfo,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  cart = []; // Clear cart after order
  
  res.json({ message: 'Order placed successfully', order });
});

// Get orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
